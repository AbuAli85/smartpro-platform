import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import * as mfa from "../_core/mfa";
import { TRPCError } from "@trpc/server";

/**
 * Multi-Factor Authentication Router
 * Handles MFA setup, verification, and management
 */
export const mfaRouter = router({
  /**
   * Get MFA status for current user
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    const status = await db.getMFAStatus(user.id);
    
    return {
      enabled: status.enabled,
      enabledAt: status.enabledAt,
      backupCodesCount: status.backupCodes?.length || 0,
    };
  }),

  /**
   * Generate MFA setup (secret + QR code)
   */
  generateSetup: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user!;
    
    // Check if MFA is already enabled
    const status = await db.getMFAStatus(user.id);
    if (status.enabled) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "MFA is already enabled for this account",
      });
    }

    const email = user.email || user.openId;
    const setup = await mfa.generateMFASecret(email);

    return {
      qrCodeUrl: setup.qrCodeUrl,
      secret: setup.secret,
      backupCodes: setup.backupCodes,
    };
  }),

  /**
   * Enable MFA after verifying the first token
   */
  enable: protectedProcedure
    .input(
      z.object({
        secret: z.string(),
        token: z.string().length(6),
        backupCodes: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Verify the token
      const isValid = mfa.verifyMFAToken(input.token, input.secret);
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Hash backup codes before storing
      const hashedBackupCodes = input.backupCodes.map(code => 
        mfa.hashBackupCode(code)
      );

      // Enable MFA
      await db.enableMFA(user.id, input.secret, hashedBackupCodes);

      // Log MFA enabled event
      await db.logAuthEvent({
        userId: user.id,
        openId: user.openId,
        eventType: "mfa_enabled",
        ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress,
        userAgent: ctx.req.headers["user-agent"],
        success: true,
        severity: "info",
      });

      return { success: true };
    }),

  /**
   * Verify MFA token during login
   */
  verify: protectedProcedure
    .input(
      z.object({
        token: z.string().min(6).max(10), // 6 for TOTP, 8-9 for backup codes
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      const status = await db.getMFAStatus(user.id);

      if (!status.enabled || !status.secret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "MFA is not enabled for this account",
        });
      }

      // Try TOTP verification first
      const isTOTPValid = mfa.verifyMFAToken(input.token, status.secret);
      
      if (isTOTPValid) {
        // Log successful MFA verification
        await db.logAuthEvent({
          userId: user.id,
          openId: user.openId,
          eventType: "mfa_verified",
          ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress,
          userAgent: ctx.req.headers["user-agent"],
          success: true,
          severity: "info",
        });

        return { success: true, method: "totp" as const };
      }

      // Try backup code verification
      if (status.backupCodes && status.backupCodes.length > 0) {
        const isBackupValid = mfa.verifyBackupCode(
          input.token,
          status.backupCodes
        );

        if (isBackupValid) {
          // Remove used backup code
          const updatedCodes = mfa.removeUsedBackupCode(
            input.token,
            status.backupCodes
          );
          await db.updateBackupCodes(user.id, updatedCodes);

          // Log successful backup code usage
          await db.logAuthEvent({
            userId: user.id,
            openId: user.openId,
            eventType: "mfa_verified",
            ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress,
            userAgent: ctx.req.headers["user-agent"],
            metadata: {
              method: "backup_code",
              remainingCodes: updatedCodes.length,
            },
            success: true,
            severity: "info",
          });

          return {
            success: true,
            method: "backup_code" as const,
            remainingBackupCodes: updatedCodes.length,
          };
        }
      }

      // Log failed verification
      await db.logAuthEvent({
        userId: user.id,
        openId: user.openId,
        eventType: "mfa_failed",
        ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress,
        userAgent: ctx.req.headers["user-agent"],
        success: false,
        severity: "warning",
      });

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid verification code",
      });
    }),

  /**
   * Disable MFA (requires current token)
   */
  disable: protectedProcedure
    .input(
      z.object({
        token: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      const status = await db.getMFAStatus(user.id);

      if (!status.enabled || !status.secret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "MFA is not enabled for this account",
        });
      }

      // Verify token before disabling
      const isValid = mfa.verifyMFAToken(input.token, status.secret) ||
        (status.backupCodes && mfa.verifyBackupCode(input.token, status.backupCodes));

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Disable MFA
      await db.disableMFA(user.id);

      // Log MFA disabled event
      await db.logAuthEvent({
        userId: user.id,
        openId: user.openId,
        eventType: "mfa_disabled",
        ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress,
        userAgent: ctx.req.headers["user-agent"],
        success: true,
        severity: "warning",
      });

      return { success: true };
    }),

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes: protectedProcedure
    .input(
      z.object({
        token: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      const status = await db.getMFAStatus(user.id);

      if (!status.enabled || !status.secret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "MFA is not enabled for this account",
        });
      }

      // Verify token before regenerating
      const isValid = mfa.verifyMFAToken(input.token, status.secret);
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Generate new backup codes
      const newBackupCodes = mfa.generateBackupCodes(10);
      const hashedCodes = newBackupCodes.map(code => mfa.hashBackupCode(code));

      // Update in database
      await db.updateBackupCodes(user.id, hashedCodes);

      return {
        success: true,
        backupCodes: newBackupCodes,
      };
    }),
});
