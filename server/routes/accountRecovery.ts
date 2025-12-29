import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import {
  generateEmailVerificationToken,
  verifyEmailWithToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  completePasswordReset,
  setRecoveryEmail,
  verifyRecoveryEmail,
  logAuthEvent,
} from "../db";
import { sendEmail } from "../_core/emailSms";
import { TRPCError } from "@trpc/server";

export const accountRecoveryRouter = router({
  /**
   * Send email verification link
   */
  sendVerificationEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;

    if (!user.email) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User does not have an email address",
      });
    }

    if (user.emailVerified) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email is already verified",
      });
    }

    const token = await generateEmailVerificationToken(user.id);
    const verificationUrl = `${process.env.VITE_APP_URL || 'https://smartpro.manus.space'}/verify-email?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email - SmartPro",
      text: `Verify your email address. Visit: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Hello ${user.name || 'there'},</p>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #003366; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">SmartPro - National Digital Infrastructure for Business Services</p>
        </div>
      `,
    });

    await logAuthEvent({
      userId: user.id,
      eventType: "email_verification_sent",
      ipAddress: ctx.req.ip || "unknown",
      userAgent: ctx.req.headers["user-agent"] || "unknown",
      success: true,
    });

    return { success: true };
  }),

  /**
   * Verify email with token
   */
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const success = await verifyEmailWithToken(input.token);

      if (!success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification token",
        });
      }

      // Log the event (we need to get user ID from token first)
      const user = ctx.user;
      if (user) {
        await logAuthEvent({
          userId: user.id,
          eventType: "email_verified",
          ipAddress: ctx.req.ip || "unknown",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
          success: true,
        });
      }

      return { success: true };
    }),

  /**
   * Request password reset
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const result = await generatePasswordResetToken(input.email);

      // Always return success to prevent email enumeration
      if (!result) {
        return { success: true };
      }

      const resetUrl = `${process.env.VITE_APP_URL || 'https://smartpro.manus.space'}/reset-password?token=${result.token}`;

      await sendEmail({
        to: input.email,
        subject: "Password Reset Request - SmartPro",
        text: `Reset your password. Visit: ${resetUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #003366; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Reset Password
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p><strong>If you didn't request this password reset, please ignore this email.</strong> Your password will remain unchanged.</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">SmartPro - National Digital Infrastructure for Business Services</p>
          </div>
        `,
      });

      await logAuthEvent({
        userId: result.userId,
        eventType: "password_reset_requested",
        ipAddress: ctx.req.ip || "unknown",
        userAgent: ctx.req.headers["user-agent"] || "unknown",
        success: true,
      });

      return { success: true };
    }),

  /**
   * Verify password reset token (check if valid before showing reset form)
   */
  verifyResetToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const userId = await verifyPasswordResetToken(input.token);

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
   * Note: In Manus OAuth system, we can't actually change passwords
   * This endpoint completes the reset flow and logs the event
   */
  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = await verifyPasswordResetToken(input.token);

      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      await completePasswordReset(userId);

      await logAuthEvent({
        userId,
        eventType: "password_reset_completed",
        ipAddress: ctx.req.ip || "unknown",
        userAgent: ctx.req.headers["user-agent"] || "unknown",
        success: true,
        metadata: { method: "email_link" },
      });

      return { success: true };
    }),

  /**
   * Set recovery email
   */
  setRecoveryEmail: protectedProcedure
    .input(z.object({ recoveryEmail: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      await setRecoveryEmail(ctx.user.id, input.recoveryEmail);

      await logAuthEvent({
        userId: ctx.user.id,
        eventType: "recovery_email_added",
        ipAddress: ctx.req.ip || "unknown",
        userAgent: ctx.req.headers["user-agent"] || "unknown",
        success: true,
      });

      return { success: true };
    }),

  /**
   * Verify recovery email
   */
  verifyRecoveryEmail: protectedProcedure.mutation(async ({ ctx }) => {
    await verifyRecoveryEmail(ctx.user.id);

    return { success: true };
  }),

  /**
   * Get recovery status
   */
  getRecoveryStatus: protectedProcedure.query(async ({ ctx }) => {
    return {
      emailVerified: ctx.user.emailVerified || false,
      hasRecoveryEmail: !!ctx.user.recoveryEmail,
      recoveryEmailVerified: ctx.user.recoveryEmailVerified || false,
    };
  }),
});
