import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const notificationRouter = router({
  // Get unread notifications
  getUnread: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    return await db.getUnreadNotifications(user.id);
  }),

  // Get all notifications
  getAll: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;
      return await db.getUserNotifications(user.id, input?.limit);
    }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    const count = await db.getUnreadNotificationCount(user.id);
    return { count };
  }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      await db.markNotificationAsRead(input.notificationId);
      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user!;
    await db.markAllNotificationsAsRead(user.id);
    return { success: true };
  }),

  // Subscribe to push notifications
  subscribeToPush: protectedProcedure
    .input(z.object({ subscription: z.any() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      // Store subscription in database
      await db.savePushSubscription(user.id, input.subscription);
      return { success: true };
    }),

  // Unsubscribe from push notifications
  unsubscribeFromPush: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      // Remove subscription from database
      await db.removePushSubscription(user.id, input.endpoint);
      return { success: true };
    }),
});
