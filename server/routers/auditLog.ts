import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Audit Log Router
 * Provides access to authentication audit logs for users and admins
 */
export const auditLogRouter = router({
  /**
   * Get current user's audit logs
   */
  getMyLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        eventTypes: z.array(z.enum([
          "login_success",
          "login_failure",
          "logout",
          "session_expired",
          "role_changed",
          "permission_denied",
          "password_reset_requested",
          "password_reset_completed",
          "mfa_enabled",
          "mfa_disabled",
          "mfa_verified",
          "mfa_failed",
          "email_verified",
          "account_locked",
          "account_unlocked",
        ])).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;
      const logs = await db.getUserAuditLogs(user.id, {
        limit: input.limit,
        offset: input.offset,
        eventTypes: input.eventTypes,
      });
      return logs;
    }),

  /**
   * Get all audit logs (admin only)
   */
  getAllLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        eventTypes: z.array(z.enum([
          "login_success",
          "login_failure",
          "logout",
          "session_expired",
          "role_changed",
          "permission_denied",
          "password_reset_requested",
          "password_reset_completed",
          "mfa_enabled",
          "mfa_disabled",
          "mfa_verified",
          "mfa_failed",
          "email_verified",
          "account_locked",
          "account_unlocked",
        ])).optional(),
        severity: z.array(z.enum(["info", "warning", "error", "critical"])).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;
      
      // Only admins can view all logs
      if (user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can view all audit logs",
        });
      }

      const logs = await db.getAllAuditLogs({
        limit: input.limit,
        offset: input.offset,
        eventTypes: input.eventTypes,
        severity: input.severity,
        startDate: input.startDate,
        endDate: input.endDate,
      });
      
      return logs;
    }),

  /**
   * Get audit log statistics (admin only)
   */
  getStats: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;
      
      // Only admins can view stats
      if (user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can view audit log statistics",
        });
      }

      const stats = await db.getAuditLogStats({
        startDate: input.startDate,
        endDate: input.endDate,
      });
      
      return stats;
    }),
});
