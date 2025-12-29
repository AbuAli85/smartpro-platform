import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { notifyNewBid, notifyBidAccepted } from "../_core/socket";
import { generateTrackingNumber, sendRequestConfirmationEmail, sendNewRequestNotificationToOffice, sendNewBidNotificationEmail, sendBidAcceptedNotificationEmail, sendServiceCompletionEmail } from "../_core/serviceRequestEmails";
import { analyzeServiceRequest, matchOffices } from "../_core/intelligentRequestService";

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

      // Generate tracking number
      const trackingNumber = generateTrackingNumber();

      // AI-powered request analysis
      const analysis = await analyzeServiceRequest({
        title: input.title,
        description: input.description,
        serviceType: input.serviceType,
        deadline: input.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        urgency: input.urgency,
      });

      // Create service request with tracking number
      const requestId = await db.createServiceRequest({
        userId: user.id,
        ...input,
        budgetMin: input.budgetMin?.toString(),
        budgetMax: input.budgetMax?.toString(),
        deadline: input.deadline ? new Date(input.deadline) : undefined,
      });

      // Store tracking number in database (we'll add this field)
      // For now, we'll include it in the response and send via email

      // Send confirmation email to customer
      try {
        await sendRequestConfirmationEmail({
          to: user.email || '',
          customerName: user.name || 'Customer',
          trackingNumber,
          serviceTitle: input.title,
          serviceType: input.serviceType,
          budget: input.budgetMax ? `${input.budgetMin || 0} - ${input.budgetMax}` : 'Not specified',
          deadline: input.deadline ? new Date(input.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Flexible',
          language: 'ar', // Default to Arabic, can be made dynamic based on user preference
        });
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
        // Don't fail the request if email fails
      }

      // Smart office matching and notifications
      try {
        // Get all offices that could match
        const allOffices = await db.getAllOffices();
        const officesWithStats = allOffices.map((office: any) => ({
          id: office.id,
          name: office.officeName,
          governorate: office.governorate || '',
          serviceCategories: office.serviceCategories || [],
          averageRating: office.averageRating || 0,
          completedBookings: office.completedBookings || 0,
          responseTime: 4, // Default 4 hours, can be calculated from historical data
        }));

        const matchedOffices = await matchOffices({
          serviceType: input.serviceType,
          governorate: input.governorate || 'Any Location',
          budget: input.budgetMax || 1000,
          urgency: input.urgency,
          description: input.description,
          offices: officesWithStats,
        });

        // Notify matched offices (top 5)
        for (const match of matchedOffices.slice(0, 5)) {
          const office = allOffices.find((o: any) => o.id === match.officeId);
          if (office && office.createdBy) {
            // Create in-app notification
            await db.createNotification({
              userId: office.createdBy,
              type: 'system',
              title: 'New Service Request Available',
              message: `A new ${input.serviceType} request matches your expertise (Match: ${match.matchScore}%)`,
              actionUrl: `/marketplace/requests/${requestId}`,
            });

            // Send email notification
            const officeOwner = await db.getUserById(office.createdBy);
            if (officeOwner?.email) {
              await sendNewRequestNotificationToOffice({
                to: officeOwner.email,
                officeName: office.officeName,
                serviceTitle: input.title,
                serviceType: input.serviceType,
                budget: input.budgetMax ? `${input.budgetMin || 0} - ${input.budgetMax}` : 'Not specified',
                deadline: input.deadline ? new Date(input.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Flexible',
                governorate: input.governorate || 'Any Location',
                language: 'ar',
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to match offices or send notifications:', error);
        // Don't fail the request if matching/notification fails
      }

      return { 
        id: requestId, 
        trackingNumber,
        analysis: {
          budgetRecommendation: analysis.budgetRecommendation,
          estimatedTimeline: analysis.timelinePrediction,
          requirements: analysis.requirementChecklist,
        }
      };
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

        // Send email notification to customer
        try {
          const customer = await db.getUserById(request.userId);
          if (customer?.email) {
            await sendNewBidNotificationEmail({
              to: customer.email,
              customerName: customer.name || 'Customer',
              trackingNumber: 'SR-' + input.requestId, // Simplified tracking number
              serviceTitle: request.title,
              officeName: office.officeName,
              bidAmount: input.proposedPrice.toString(),
              language: 'ar',
            });
          }
        } catch (error) {
          console.error('Failed to send bid notification email:', error);
        }
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

        // Send bid accepted email notification to office
        const officeOwner = await db.getUserById(office.createdBy);
        if (officeOwner && officeOwner.email) {
          // Generate tracking number from request ID
          const trackingNumber = `SR-${request.id.toString().padStart(6, '0')}`;
          await sendBidAcceptedNotificationEmail({
            to: officeOwner.email,
            officeName: office.officeName || "Your Office",
            trackingNumber,
            serviceTitle: request.title,
            customerName: user.name || "Customer",
            bidAmount: bid.proposedPrice,
            language: officeOwner.preferredLanguage === 'ar' ? 'ar' : 'en',
          });
        }
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

  // Update request status (office can mark as completed)
  updateRequestStatus: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
        status: z.enum(["open", "bidding", "awarded", "in_progress", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      const request = await db.getServiceRequest(input.requestId);
      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service request not found",
        });
      }

      // Verify permission: either customer or office with accepted bid
      const isCustomer = request.userId === user.id;
      let isOffice = false;
      
      if (request.acceptedBidId) {
        const acceptedBid = await db.getServiceBid(request.acceptedBidId);
        if (acceptedBid) {
          const office = await db.getSanadOfficeById(acceptedBid.officeId);
          if (office && office.createdBy === user.id) {
            isOffice = true;
          }
        }
      }

      if (!isCustomer && !isOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this request",
        });
      }

      // Update request status
      await db.updateServiceRequest(input.requestId, {
        status: input.status,
      });

      // Send service completion email if status is completed
      if (input.status === "completed" && request.acceptedBidId) {
        const acceptedBid = await db.getServiceBid(request.acceptedBidId);
        if (acceptedBid) {
          const office = await db.getSanadOfficeById(acceptedBid.officeId);
          const customer = await db.getUserById(request.userId);
          
          if (customer && customer.email && office) {
            const trackingNumber = `SR-${request.id.toString().padStart(6, '0')}`;
            await sendServiceCompletionEmail({
              to: customer.email,
              customerName: customer.name || "Customer",
              trackingNumber,
              serviceTitle: request.title,
              officeName: office.officeName || "Office",
              language: customer.preferredLanguage === 'ar' ? 'ar' : 'en',
            });
          }
        }
      }

      return { success: true };
    }),
});
