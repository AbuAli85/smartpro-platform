import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { sanadOfficeRouter } from "./routers/sanadOffice";
import { documentTemplateRouter } from "./routers/documentTemplate";
import { bookingRouter } from "./routers/booking";
import { sitemapRouter } from "./routers/sitemap";
import { adminRouter } from "./routers/admin";

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
  }),

  // SmartPro feature routers
  sanadOffice: sanadOfficeRouter,
  documentTemplate: documentTemplateRouter,
  booking: bookingRouter,
  sitemap: sitemapRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
