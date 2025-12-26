import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { sanadOfficeRouter } from "./routers/sanadOffice";
import { documentTemplateRouter } from "./routers/documentTemplate";
import { bookingRouter } from "./routers/booking";
import { sitemapRouter } from "./routers/sitemap";
import { adminRouter } from "./routers/admin";
import { loyaltyRouter } from "./routers/loyalty";
import { referralRouter } from "./routers/referral";
import { notificationRouter } from "./routers/notification";
import { analyticsRouter } from "./routers/analytics";
import { adminAnalyticsRouter } from "./routers/adminAnalytics";
import { officeOwnerRouter } from "./routers/officeOwner";
import { templateRouter } from "./routers/template";
import { chatRouter } from "./routers/chat";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email().optional(),
          phone: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user!;
        await db.updateUserProfile(user.id, {
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
        });
        return { success: true };
      }),
    getNotificationCounts: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user!;
      const pendingBookings = await db.getPendingBookingsCount(user.id);
      return {
        bookings: pendingBookings,
      };
    }),
  }),

  // SmartPro feature routers
  sanadOffice: sanadOfficeRouter,
  documentTemplate: documentTemplateRouter,
  booking: bookingRouter,
  sitemap: sitemapRouter,
  admin: adminRouter,
  loyalty: loyaltyRouter,
  referral: referralRouter,
  notification: notificationRouter,
  analytics: analyticsRouter,
  adminAnalytics: adminAnalyticsRouter,
  officeOwner: officeOwnerRouter,
  template: templateRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
