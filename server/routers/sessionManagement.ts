import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  getActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
  logAuthEvent,
} from "../db";
import { TRPCError } from "@trpc/server";

export const sessionManagementRouter = router({
  /**
   * Get all active sessions for the current user
   */
  getActiveSessions: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await getActiveSessions(ctx.user.id);

    // Get current session ID from cookie
    const currentSessionId = ctx.req.cookies?.["manus_session_id"];

    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        sessionId: session.sessionId,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        lastActive: session.lastActive,
        createdAt: session.createdAt,
        isCurrent: session.sessionId === currentSessionId,
      })),
    };
  }),

  /**
   * Revoke a specific session
   */
  revokeSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const success = await revokeSession(input.sessionId, ctx.user.id);

      if (!success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found or already revoked",
        });
      }

      await logAuthEvent({
        userId: ctx.user.id,
        eventType: "session_revoked",
        ipAddress: ctx.req.ip || "unknown",
        userAgent: ctx.req.headers["user-agent"] || "unknown",
        success: true,
        metadata: { revokedSessionId: input.sessionId },
      });

      return { success: true };
    }),

  /**
   * Revoke all other sessions (keep current session active)
   */
  revokeAllOtherSessions: protectedProcedure.mutation(async ({ ctx }) => {
    const currentSessionId = ctx.req.cookies?.["manus_session_id"];

    if (!currentSessionId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active session found",
      });
    }

    const count = await revokeAllOtherSessions(ctx.user.id, currentSessionId);

    await logAuthEvent({
      userId: ctx.user.id,
      eventType: "all_sessions_revoked",
      ipAddress: ctx.req.ip || "unknown",
      userAgent: ctx.req.headers["user-agent"] || "unknown",
      success: true,
      metadata: { sessionsRevoked: count },
    });

    return { success: true, count };
  }),
});
