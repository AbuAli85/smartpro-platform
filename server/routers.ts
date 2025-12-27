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
import { chatAnalyticsRouter } from "./routers/chatAnalytics";
import { cannedResponsesRouter } from "./routers/cannedResponses";
import { chatAssignmentRouter } from "./routers/chatAssignment";
import { chatRatingsRouter } from "./routers/chatRatings";
import { chatTransferRouter } from "./routers/chatTransfer";
import { followUpRouter } from "./routers/followUp";
import { exportRouter } from "./routers/export";
import { bulkTranslationRouter } from "./routers/bulkTranslation";
import { translationRequestRouter } from "./routers/translationRequest";
import { translationExportRouter } from "./routers/translationExport";
import { translationAnalyticsRouter } from "./routers/translationAnalytics";
import { translationMemoryRouter } from "./routers/translationMemory";
import { autoTranslateRouter } from "./routers/autoTranslate";
import { translationQualityRouter } from "./routers/translationQuality";
import { collaborativeReviewRouter } from "./routers/collaborativeReview";
import { smartBatchProcessingRouter } from "./routers/smartBatchProcessing";
import { analyticsExportRouter } from "./routers/analyticsExport";
import { translatorTrainingRouter } from "./routers/translatorTraining";
import { serviceMarketplaceRouter } from "./routers/serviceMarketplace";
import { serviceBundleRouter } from "./routers/serviceBundle";
import { storageRouter } from "./routers/storage";
import { reviewsRouter } from "./routers/reviews";
import { recommendationsRouter } from "./routers/recommendations";
import { campaignsRouter } from "./routers/campaigns";

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
    updateLanguagePreference: protectedProcedure
      .input(z.object({ language: z.enum(["en", "ar"]) }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user!;
        await db.updateUserLanguagePreference(user.id, input.language);
        return { success: true, language: input.language };
      }),
    updateNotificationPreferences: protectedProcedure
      .input(z.object({
        preferences: z.object({
          email: z.boolean(),
          sms: z.boolean(),
          confirmations: z.boolean(),
          reminders: z.boolean(),
          marketing: z.boolean(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user!;
        await db.updateUserNotificationPreferences(user.id, input.preferences);
        return { success: true };
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
  chatAnalytics: chatAnalyticsRouter,
  cannedResponses: cannedResponsesRouter,
  chatAssignment: chatAssignmentRouter,
  chatRatings: chatRatingsRouter,
  chatTransfer: chatTransferRouter,
  followUp: followUpRouter,
  export: exportRouter,
  bulkTranslation: bulkTranslationRouter,
  translationRequest: translationRequestRouter,
  translationExport: translationExportRouter,
  translationAnalytics: translationAnalyticsRouter,
  translationMemory: translationMemoryRouter,
  autoTranslate: autoTranslateRouter,
  translationQuality: translationQualityRouter,
  collaborativeReview: collaborativeReviewRouter,
  smartBatchProcessing: smartBatchProcessingRouter,
  analyticsExport: analyticsExportRouter,
  translatorTraining: translatorTrainingRouter,
  serviceMarketplace: serviceMarketplaceRouter,
  serviceBundle: serviceBundleRouter,
  storage: storageRouter,
  reviews: reviewsRouter,
  recommendations: recommendationsRouter,
  campaigns: campaignsRouter,
});

export type AppRouter = typeof appRouter;
