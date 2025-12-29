import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import * as securityMetrics from "../db-security-metrics";

/**
 * Security Dashboard Router
 * 
 * Admin-only endpoints for security monitoring and analytics
 */
export const securityDashboardRouter = router({
  /**
   * Get MFA enrollment statistics
   */
  getMFAStats: adminProcedure.query(async () => {
    return await securityMetrics.getMFAStats();
  }),

  /**
   * Get recent MFA enrollments
   */
  getRecentMFAEnrollments: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional().default(10) }))
    .query(async ({ input }) => {
      return await securityMetrics.getRecentMFAEnrollments(input.limit);
    }),

  /**
   * Get password reset statistics
   */
  getPasswordResetStats: adminProcedure
    .input(z.object({ days: z.number().min(1).max(365).optional().default(30) }))
    .query(async ({ input }) => {
      return await securityMetrics.getPasswordResetStats(input.days);
    }),

  /**
   * Get recent password reset requests
   */
  getRecentPasswordResets: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional().default(10) }))
    .query(async ({ input }) => {
      return await securityMetrics.getRecentPasswordResets(input.limit);
    }),

  /**
   * Get suspicious activity
   */
  getSuspiciousActivity: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional().default(20) }))
    .query(async ({ input }) => {
      return await securityMetrics.getSuspiciousActivity(input.limit);
    }),

  /**
   * Get active sessions statistics
   */
  getActiveSessionsStats: adminProcedure.query(async () => {
    return await securityMetrics.getActiveSessionsStats();
  }),

  /**
   * Get security events trend for charts
   */
  getSecurityEventsTrend: adminProcedure
    .input(z.object({ days: z.number().min(1).max(365).optional().default(30) }))
    .query(async ({ input }) => {
      return await securityMetrics.getSecurityEventsTrend(input.days);
    }),

  /**
   * Get audit log summary with filtering
   */
  getAuditLogSummary: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        eventType: z.string().optional(),
        userId: z.number().optional(),
        severity: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      return await securityMetrics.getAuditLogSummary(input);
    }),
});
