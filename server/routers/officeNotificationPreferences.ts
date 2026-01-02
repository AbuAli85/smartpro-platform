import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const officeNotificationPreferencesRouter = router({
  // Get notification preferences for an office
  getPreferences: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Verify user owns this office
      const office = await db.getOfficeById(input.officeId);
      if (!office || office.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this office's preferences",
        });
      }

      const prefs = await db.getOfficeNotificationPreferences(input.officeId);
      
      // Return default preferences if none exist
      if (!prefs) {
        return {
          officeId: input.officeId,
          serviceTypes: [],
          governorates: [],
          minBudget: 0,
          maxBudget: 999999,
          emailNotifications: true,
          inAppNotifications: true,
          isActive: 1,
        };
      }

      return prefs;
    }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        serviceTypes: z.array(z.string()),
        governorates: z.array(z.string()),
        minBudget: z.number().min(0),
        maxBudget: z.number().min(0),
        emailNotifications: z.boolean(),
        inAppNotifications: z.boolean(),
        isActive: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Verify user owns this office
      const office = await db.getOfficeById(input.officeId);
      if (!office || office.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this office's preferences",
        });
      }

      // Validate budget range
      if (input.maxBudget < input.minBudget) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum budget must be greater than or equal to minimum budget",
        });
      }

      await db.upsertOfficeNotificationPreferences({
        officeId: input.officeId,
        serviceTypes: input.serviceTypes,
        governorates: input.governorates,
        minBudget: input.minBudget,
        maxBudget: input.maxBudget,
        emailNotifications: input.emailNotifications,
        inAppNotifications: input.inAppNotifications,
        isActive: input.isActive,
      });

      return { success: true };
    }),
});
