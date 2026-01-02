import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const serviceBundleRouter = router({
  // Create a new bundle (office owner)
  createBundle: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        name: z.string().min(5, "Bundle name must be at least 5 characters"),
        description: z.string().optional(),
        discountPercentage: z.number().min(1).max(50, "Discount must be between 1% and 50%"),
        validFrom: z.string().optional(),
        validUntil: z.string().optional(),
        services: z.array(
          z.object({
            serviceId: z.number(),
            serviceName: z.string(),
            servicePrice: z.number(),
          })
        ).min(2, "Bundle must include at least 2 services"),
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

      const bundleId = await db.createServiceBundle({
        officeId: input.officeId,
        name: input.name,
        description: input.description,
        discountPercentage: input.discountPercentage.toString(),
        validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
        validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
        createdBy: user.id,
        services: input.services.map((s) => ({
          serviceId: s.serviceId,
          serviceName: s.serviceName,
          servicePrice: s.servicePrice.toString(),
        })),
      });

      return { id: bundleId };
    }),

  // Get bundles for an office
  getOfficeBundles: publicProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOfficeBundles(input.officeId);
    }),

  // Get single bundle
  getBundle: publicProcedure
    .input(z.object({ bundleId: z.number() }))
    .query(async ({ input }) => {
      const bundle = await db.getServiceBundle(input.bundleId);
      if (!bundle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bundle not found",
        });
      }
      return bundle;
    }),

  // Get all active bundles (marketplace)
  getAllBundles: publicProcedure.query(async () => {
    return await db.getAllActiveBundles();
  }),

  // Update bundle
  updateBundle: protectedProcedure
    .input(
      z.object({
        bundleId: z.number(),
        officeId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        discountPercentage: z.number().min(1).max(50).optional(),
        validFrom: z.string().optional(),
        validUntil: z.string().optional(),
        isActive: z.number().optional(),
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

      const updates: any = {};
      if (input.name) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.discountPercentage) updates.discountPercentage = input.discountPercentage.toString();
      if (input.validFrom) updates.validFrom = new Date(input.validFrom);
      if (input.validUntil) updates.validUntil = new Date(input.validUntil);
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await db.updateServiceBundle(input.bundleId, updates);

      return { success: true };
    }),

  // Delete bundle (soft delete)
  deleteBundle: protectedProcedure
    .input(z.object({ bundleId: z.number(), officeId: z.number() }))
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

      await db.deleteServiceBundle(input.bundleId);

      return { success: true };
    }),
});
