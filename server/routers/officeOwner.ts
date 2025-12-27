import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { sendOfficeRegistrationConfirmationEmail } from "../_core/emailTemplates";

export const officeOwnerRouter = router({
  // Register a new Sanad office
  registerOffice: protectedProcedure
    .input(z.object({
      officeName: z.string().min(3),
      officeNameAr: z.string().optional(),
      description: z.string().min(20),
      descriptionAr: z.string().optional(),
      licenseNumber: z.string(),
      address: z.string(),
      addressAr: z.string().optional(),
      city: z.string(),
      region: z.string(),
      phone: z.string(),
      email: z.string().email(),
      website: z.string().url().optional(),
      serviceIds: z.array(z.number()),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create the office
      const officeId = await db.createOffice({
        ...input,
        ownerId: ctx.user.id,
        isVerified: false, // Requires admin verification
        isAvailable: false, // Not available until verified
      });

      // Update user role to sanad_owner if not already
      if (ctx.user.role === "user") {
        await db.updateUserRole(ctx.user.id, "sanad_owner");
      }

      // Send confirmation email
      await sendOfficeRegistrationConfirmationEmail(input.email, input.officeName);

      return { officeId, message: "Office registered successfully. Pending verification." };
    }),

  // Get offices owned by the current user
  getMyOffices: protectedProcedure.query(async ({ ctx }) => {
    const offices = await db.getOfficesByOwner(ctx.user.id);
    return offices;
  }),

  // Get bookings for a specific office
  getOfficeBookings: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getOfficeBookingsForOwner(input.officeId);
    }),

  // Toggle office status (active/inactive)
  toggleOfficeStatus: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      isAvailable: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.toggleOfficeStatus(input.officeId, input.isAvailable);
    }),

  // Get office performance metrics
  getOfficeMetrics: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getOwnerOfficeMetrics(input.officeId);
    }),

  // Get office reviews
  getOfficeReviews: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getOfficeReviews(input.officeId);
    }),

  // Respond to a review
  respondToReview: protectedProcedure
    .input(z.object({
      reviewId: z.number(),
      response: z.string().min(1).max(1000),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get the review to verify ownership
      const review = await db.getReviewById(input.reviewId);
      
      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      // Verify office ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === review.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.addOwnerResponseToReview(input.reviewId, input.response);
    }),

  // Update office basic information
  updateOfficeInfo: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      officeName: z.string().min(1).max(255),
      description: z.string().max(2000).optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().max(20).optional(),
      address: z.string().max(500).optional(),
      city: z.string().max(100).optional(),
      region: z.string().max(100).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.updateOfficeInfo(input);
    }),

  // Get office services
  getOfficeServices: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getSanadOfficeServices(input.officeId);
    }),

  // Add new service
  addService: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      serviceName: z.string().min(1).max(255),
      serviceNameAr: z.string().min(1).max(255),
      description: z.string().max(1000).optional(),
      descriptionAr: z.string().max(1000).optional(),
      price: z.number().min(0),
      estimatedDays: z.number().min(1),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.addOfficeService(input);
    }),

  // Update service
  updateService: protectedProcedure
    .input(z.object({
      serviceId: z.number(),
      serviceName: z.string().min(1).max(255).optional(),
      serviceNameAr: z.string().min(1).max(255).optional(),
      description: z.string().max(1000).optional(),
      descriptionAr: z.string().max(1000).optional(),
      price: z.number().min(0).optional(),
      estimatedDays: z.number().min(1).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get service to verify ownership
      const service = await db.getServiceById(input.serviceId);
      
      if (!service) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service not found",
        });
      }

      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === service.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this service",
        });
      }

      return await db.updateOfficeService(input);
    }),

  // Delete service
  deleteService: protectedProcedure
    .input(z.object({ serviceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Get service to verify ownership
      const service = await db.getServiceById(input.serviceId);
      
      if (!service) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service not found",
        });
      }

      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === service.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this service",
        });
      }

      return await db.deleteOfficeService(input.serviceId);
    }),

  // Get office availability schedule
  getOfficeAvailability: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.getOfficeAvailability(input.officeId);
    }),

  // Update availability schedule
  updateAvailability: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
      slotDuration: z.number().min(15).max(240).default(60),
      isAvailable: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      return await db.upsertOfficeAvailability(input);
    }),

  // Delete availability schedule
  deleteAvailability: protectedProcedure
    .input(z.object({ availabilityId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Get availability to verify ownership
      const availability = await db.getAvailabilityById(input.availabilityId);
      
      if (!availability) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Availability schedule not found",
        });
      }

      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === availability.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this availability schedule",
        });
      }

      return await db.deleteOfficeAvailability(input.availabilityId);
    }),

  // Update office profile (onboarding step 1)
  updateOfficeProfile: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      logoUrl: z.string().url().optional(),
      coverUrl: z.string().url().optional(),
      tagline: z.string(),
      description: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      // Update office profile fields
      const updates: any = {};
      if (input.logoUrl) updates.logoUrl = input.logoUrl;
      if (input.coverUrl) updates.coverImageUrl = input.coverUrl;
      if (input.description) updates.description = input.description;
      
      if (Object.keys(updates).length > 0) {
        await db.updateSanadOffice(input.officeId, updates);
      }

      return { success: true };
    }),

  // Update office services (onboarding step 2) - TODO: Implement after fixing service schema
  // updateOfficeServices: protectedProcedure
  //   .input(z.object({
  //     officeId: z.number(),
  //     serviceIds: z.array(z.number()),
  //     pricing: z.record(z.number()),
  //   }))
  //   .mutation(async ({ input, ctx }) => {
  //     // Verify ownership
  //     const offices = await db.getOfficesByOwner(ctx.user.id);
  //     const ownsOffice = offices.some(o => o.id === input.officeId);
  //     
  //     if (!ownsOffice) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "You do not own this office",
  //       });
  //     }

  //     await db.updateOfficeServices(
  //       input.officeId,
  //       input.serviceIds,
  //       input.pricing as Record<number, number>
  //     );

  //     return { success: true };
  //   }),

  // Update office availability (onboarding step 3)
  updateOfficeAvailability: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      workingHours: z.record(z.string(), z.object({
        enabled: z.boolean(),
        start: z.string(),
        end: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      await db.updateOfficeWorkingHours(
        input.officeId,
        input.workingHours as Record<string, { enabled: boolean; start: string; end: string }>
      );

      return { success: true };
    }),

  // Activate office (onboarding step 4)
  activateOffice: protectedProcedure
    .input(z.object({
      officeId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      await db.toggleOfficeStatus(input.officeId, true);

      await db.logActivity({
        userId: ctx.user.id,
        action: "activated",
        entityType: "office",
        entityId: input.officeId,
        description: "Completed onboarding and activated office",
      });

      return { success: true };
    }),

  // Get office analytics data
  getOfficeAnalytics: protectedProcedure
    .input(z.object({
      period: z.enum(["7days", "30days", "90days", "1year"]),
    }))
    .query(async ({ ctx, input }) => {
      const offices = await db.getOfficesByOwner(ctx.user.id);
      if (!offices || offices.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No office found" });
      }

      const office = offices[0];
      const now = new Date();
      const periodDays = {
        "7days": 7,
        "30days": 30,
        "90days": 90,
        "1year": 365,
      }[input.period];

      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

      // Get analytics data
      const analytics = await db.getOfficeAnalyticsData(office.id, startDate, now);

      return analytics;
    }),
});
