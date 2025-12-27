import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { notifyNewBid, notifyBidAccepted } from "../_core/socket";

export const serviceMarketplaceRouter = router({
  // Create a new service request (customer)
  createRequest: protectedProcedure
    .input(
      z.object({
        title: z.string().min(10, "Title must be at least 10 characters"),
        description: z.string().min(50, "Description must be at least 50 characters"),
        serviceType: z.string(),
        category: z.string().optional(),
        requirements: z.string().optional(),
        documents: z.array(z.string()).optional(),
        budgetMin: z.number().optional(),
        budgetMax: z.number().optional(),
        deadline: z.string().optional(),
        urgency: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        governorate: z.string().optional(),
        wilayat: z.string().optional(),
        remoteAccepted: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      const requestId = await db.createServiceRequest({
        userId: user.id,
        ...input,
        budgetMin: input.budgetMin?.toString(),
        budgetMax: input.budgetMax?.toString(),
        deadline: input.deadline ? new Date(input.deadline) : undefined,
      });

      return { id: requestId };
    }),

  // List all open service requests (for offices)
  listRequests: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        governorate: z.string().optional(),
        urgency: z.enum(["low", "medium", "high", "urgent"]).optional(),
        status: z.enum(["open", "bidding", "awarded", "in_progress", "completed", "cancelled"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return await db.listServiceRequests(input);
    }),

  // Get my service requests (customer)
  getMyRequests: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    return await db.getUserServiceRequests(user.id);
  }),

  // Get single request with bids
  getRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .query(async ({ ctx, input }) => {
      const request = await db.getServiceRequest(input.requestId);
      
      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service request not found",
        });
      }

      // Get bids for this request
      const bids = await db.getRequestBids(input.requestId);

      return { ...request, bids };
    }),

  // Create a bid (office)
  createBid: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
        officeId: z.number(),
        proposedPrice: z.number().positive(),
        estimatedDuration: z.string(),
        coverLetter: z.string().min(100, "Cover letter must be at least 100 characters"),
        methodology: z.string().optional(),
        portfolio: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Verify user has access to this office
      const hasAccess = await db.getUserOfficeRole(user.id, input.officeId);
      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this office",
        });
      }

      // Check if request is still open
      const request = await db.getServiceRequest(input.requestId);
      if (!request || request.status !== "open") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This service request is no longer accepting bids",
        });
      }

      const bidId = await db.createServiceBid({
        ...input,
        proposedPrice: input.proposedPrice.toString(),
      });

      // Update request bid count and status
      await db.updateServiceRequest(input.requestId, {
        bidCount: (request.bidCount || 0) + 1,
        status: "bidding",
      });

      // Notify customer of new bid
      await db.createNotification({
        userId: request.userId,
        type: "system",
        title: "New Bid Received",
        message: `You received a new bid on your service request: ${request.title}`,
        actionUrl: `/marketplace/requests/${input.requestId}`,
      });

      // Real-time notification via WebSocket
      const office = await db.getSanadOfficeById(input.officeId);
      if (office) {
        notifyNewBid(request.userId, {
          requestId: input.requestId,
          requestTitle: request.title,
          officeName: office.officeName,
          price: input.proposedPrice.toString(),
          estimatedDuration: input.estimatedDuration,
        });
      }

      return { id: bidId };
    }),

  // Accept a bid (customer)
  acceptBid: protectedProcedure
    .input(z.object({ bidId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      const bid = await db.getServiceBid(input.bidId);
      if (!bid) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bid not found",
        });
      }

      const request = await db.getServiceRequest(bid.requestId);
      if (!request || request.userId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to accept this bid",
        });
      }

      // Update bid status
      await db.updateServiceBid(input.bidId, { status: "accepted" });

      // Update request status
      await db.updateServiceRequest(bid.requestId, {
        status: "awarded",
        acceptedBidId: input.bidId,
      });

      // Reject other bids
      const allBids = await db.getRequestBids(bid.requestId);
      for (const otherBid of allBids) {
        if (otherBid.id !== input.bidId && otherBid.status === "pending") {
          await db.updateServiceBid(otherBid.id, { status: "rejected" });
        }
      }

      // Create booking from accepted bid
      const bookingId = await db.createBooking({
        officeId: bid.officeId,
        userId: user.id,
        serviceDescription: request.description,
        requirements: request.requirements,
        price: bid.proposedPrice,
        status: "pending",
        bookingType: "marketplace",
      });

      // Get office owner for notification
      const office = await db.getSanadOfficeById(bid.officeId);
      if (office && office.createdBy) {
        // Notify office owner
        await db.createNotification({
          userId: office.createdBy, // Office owner ID
          type: "booking",
          title: "Bid Accepted!",
          message: `Your bid on "${request.title}" has been accepted`,
          actionUrl: `/bookings/${bookingId}`,
        });

        // Real-time notification via WebSocket
        notifyBidAccepted(office.createdBy, {
          requestTitle: request.title,
          customerName: user.name || "Customer",
          price: bid.proposedPrice,
        });
      }

      return { bookingId };
    }),

  // Get my bids (office)
  getMyBids: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Verify access
      const hasAccess = await db.getUserOfficeRole(user.id, input.officeId);
      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this office",
        });
      }

      return await db.getOfficeBids(input.officeId);
    }),
});
