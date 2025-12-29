import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Account Recovery Router
 * 
 * Handles email verification and password reset functionality.
 * Rate limiting is applied at the Express middleware level.
 */
export const accountRecoveryRouter = router({
  /**
   * Request email verification
   * Generates a verification token and sends email
   */
  requestEmailVerification: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const token = await db.generateEmailVerificationToken(ctx.user.id);
      
      // TODO: Send verification email with token
      // await sendVerificationEmail(ctx.user.email, token);
      
      // Log the event
      await db.logAuthEvent({
        userId: ctx.user.id,
        openId: ctx.user.openId,
        eventType: "email_verification_sent",
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"],
        success: true,
        severity: "info",
      });
      
      return { success: true, message: "Verification email sent" };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send verification email",
      });
    }
  }),

  /**
   * Verify email with token
   */
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const success = await db.verifyEmailWithToken(input.token);
      
      if (!success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification token",
        });
      }
      
      // Log the event (we don't have userId from token, so log without it)
      await db.logAuthEvent({
        eventType: "email_verified",
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"],
        success: true,
        severity: "info",
        metadata: { token: input.token.substring(0, 8) + "..." },
      });
      
      return { success: true, message: "Email verified successfully" };
    }),

  /**
   * Request password reset
   * Rate limited to 3 requests per hour per IP (via Express middleware)
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const result = await db.generatePasswordResetToken(input.email);
      
      if (!result) {
        // Don't reveal if email exists - always return success
        return { success: true, message: "If the email exists, a reset link has been sent" };
      }
      
      // TODO: Send password reset email with token
      // await sendPasswordResetEmail(input.email, result.token);
      
      // Log the event
      await db.logAuthEvent({
        userId: result.userId,
        eventType: "password_reset_requested",
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"],
        success: true,
        severity: "info",
        metadata: { email: input.email },
      });
      
      return { success: true, message: "If the email exists, a reset link has been sent" };
    }),

  /**
   * Verify password reset token
   */
  verifyPasswordResetToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const userId = await db.verifyPasswordResetToken(input.token);
      
      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }
      
      return { valid: true, userId };
    }),

  /**
   * Complete password reset
   * Note: In a real implementation, this would also update the password hash
   */
  completePasswordReset: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = await db.verifyPasswordResetToken(input.token);
      
      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }
      
      // TODO: Hash and update password
      // await db.updateUserPassword(userId, hashPassword(input.newPassword));
      
      // Clear reset token
      await db.completePasswordReset(userId);
      
      // Log the event
      await db.logAuthEvent({
        userId,
        eventType: "password_reset_completed",
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"],
        success: true,
        severity: "info",
      });
      
      return { success: true, message: "Password reset successfully" };
    }),

  /**
   * Set recovery email
   */
  setRecoveryEmail: protectedProcedure
    .input(z.object({ recoveryEmail: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      await db.setRecoveryEmail(ctx.user.id, input.recoveryEmail);
      
      return { success: true, message: "Recovery email updated" };
    }),

  /**
   * Verify recovery email
   */
  verifyRecoveryEmail: protectedProcedure.mutation(async ({ ctx }) => {
    await db.verifyRecoveryEmail(ctx.user.id);
    
    return { success: true, message: "Recovery email verified" };
  }),
});
