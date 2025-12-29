import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./context";

/**
 * Middleware to enforce MFA for admin users
 * Throws an error if the user is an admin and doesn't have MFA enabled
 */
export function enforceMFAForAdmin(ctx: TrpcContext) {
  const user = ctx.user;

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  // Check if user is admin
  if (user.role === "admin") {
    // Check if MFA is enabled
    if (!user.mfaEnabled) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "MFA_REQUIRED_FOR_ADMIN",
        cause: {
          code: "MFA_REQUIRED",
          message: "Multi-factor authentication is required for admin accounts. Please enable 2FA in your security settings.",
          setupUrl: "/security/mfa",
        },
      });
    }
  }

  return true;
}

/**
 * Check if MFA enforcement should be applied
 * Returns true if user is admin without MFA
 */
export function shouldEnforceMFA(ctx: TrpcContext): boolean {
  const user = ctx.user;
  if (!user) return false;
  return user.role === "admin" && !user.mfaEnabled;
}
