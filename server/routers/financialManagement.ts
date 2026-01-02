import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { bookings, sanadOfficeServices } from "../../drizzle/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export const financialManagementRouter = router({
  // Get financial overview for an office
  getFinancialOverview: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      const database = await getDb();
      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Default to last 30 days if no dates provided
      const endDate = (input.endDate || new Date()).toISOString();
      const startDate = (input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).toISOString();

      // Get total revenue
      const revenueResult = await database
        .select({
          totalRevenue: sql<string>`COALESCE(SUM(${bookings.price}), 0)`,
          completedBookings: sql<number>`COUNT(*)`,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.officeId, input.officeId),
            eq(bookings.status, "completed"),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        );

      // Get pending revenue
      const pendingResult = await database
        .select({
          pendingRevenue: sql<string>`COALESCE(SUM(${bookings.price}), 0)`,
          pendingBookings: sql<number>`COUNT(*)`,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.officeId, input.officeId),
            eq(bookings.status, "confirmed"),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        );

      // Get revenue by service
      const revenueByService = await database
        .select({
          serviceId: bookings.serviceId,
          serviceName: bookings.serviceDescription,
          revenue: sql<string>`COALESCE(SUM(${bookings.price}), 0)`,
          bookingCount: sql<number>`COUNT(*)`,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.officeId, input.officeId),
            eq(bookings.status, "completed"),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        )
        .groupBy(bookings.serviceId, bookings.serviceDescription);

      return {
        totalRevenue: parseFloat(revenueResult[0]?.totalRevenue || "0"),
        completedBookings: revenueResult[0]?.completedBookings || 0,
        pendingRevenue: parseFloat(pendingResult[0]?.pendingRevenue || "0"),
        pendingBookings: pendingResult[0]?.pendingBookings || 0,
        revenueByService: revenueByService.map(r => ({
          serviceId: r.serviceId,
          serviceName: r.serviceName,
          revenue: parseFloat(r.revenue),
          bookingCount: r.bookingCount,
        })),
        period: {
          startDate: startDate,
          endDate: endDate,
        },
      };
    }),

  // Get payment history
  getPaymentHistory: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      limit: z.number().default(50),
      offset: z.number().default(0),
      status: z.enum(["completed", "pending", "cancelled", "all"]).default("all"),
    }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      const database = await getDb();
      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Build where conditions
      const conditions = [eq(bookings.officeId, input.officeId)];
      if (input.status !== "all") {
        conditions.push(eq(bookings.status, input.status));
      }

      // Get payments
      const payments = await database
        .select({
          id: bookings.id,
          customerName: bookings.userId,
          customerEmail: bookings.userId,
          serviceDescription: bookings.serviceDescription,
          price: bookings.price,
          status: bookings.status,
          scheduledDate: bookings.scheduledDate,
          createdAt: bookings.createdAt,
          completedAt: bookings.completedDate,
        })
        .from(bookings)
        .where(and(...conditions))
        .orderBy(desc(bookings.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const countResult = await database
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(bookings)
        .where(and(...conditions));

      return {
        payments: payments.map(p => ({
          ...p,
          price: parseFloat(p.price as any),
        })),
        total: countResult[0]?.count || 0,
        hasMore: (input.offset + input.limit) < (countResult[0]?.count || 0),
      };
    }),

  // Get revenue trends
  getRevenueTrends: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      period: z.enum(["7days", "30days", "90days", "1year"]).default("30days"),
    }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      const database = await getDb();
      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const periodDays = {
        "7days": 7,
        "30days": 30,
        "90days": 90,
        "1year": 365,
      }[input.period];

      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

      // Get daily revenue
      const trends = await database
        .select({
          date: sql<string>`DATE(${bookings.createdAt})`,
          revenue: sql<string>`COALESCE(SUM(${bookings.price}), 0)`,
          bookingCount: sql<number>`COUNT(*)`,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.officeId, input.officeId),
            eq(bookings.status, "completed"),
            gte(bookings.createdAt, startDate)
          )
        )
        .groupBy(sql`DATE(${bookings.createdAt})`)
        .orderBy(sql`DATE(${bookings.createdAt})`);

      return trends.map(t => ({
        date: t.date,
        revenue: parseFloat(t.revenue),
        bookingCount: t.bookingCount,
      }));
    }),

  // Get service pricing analysis
  getServicePricing: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      const database = await getDb();
      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get services with booking stats
      const services = await database
        .select({
          id: sanadOfficeServices.id,
          serviceName: sanadOfficeServices.serviceName,
          serviceNameAr: sanadOfficeServices.serviceNameAr,
          price: sanadOfficeServices.price,
          estimatedDays: sanadOfficeServices.id,
          isActive: sanadOfficeServices.isActive,
          totalBookings: sql<number>`(
            SELECT COUNT(*) 
            FROM ${bookings} 
            WHERE ${bookings.serviceId} = ${sanadOfficeServices.id}
          )`,
          completedBookings: sql<number>`(
            SELECT COUNT(*) 
            FROM ${bookings} 
            WHERE ${bookings.serviceId} = ${sanadOfficeServices.id}
            AND ${bookings.status} = 'completed'
          )`,
          totalRevenue: sql<string>`(
            SELECT COALESCE(SUM(${bookings.price}), 0)
            FROM ${bookings} 
            WHERE ${bookings.serviceId} = ${sanadOfficeServices.id}
            AND ${bookings.status} = 'completed'
          )`,
        })
        .from(sanadOfficeServices)
        .where(eq(sanadOfficeServices.officeId, input.officeId));

      return services.map(s => ({
        ...s,
        price: parseFloat(s.price as any),
        totalRevenue: parseFloat(s.totalRevenue),
        conversionRate: s.totalBookings > 0 
          ? (s.completedBookings / s.totalBookings) * 100 
          : 0,
      }));
    }),

  // Export financial report
  exportFinancialReport: protectedProcedure
    .input(z.object({
      officeId: z.number(),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      format: z.enum(["csv", "pdf"]).default("csv"),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const offices = await db.getOfficesByOwner(ctx.user.id);
      const ownsOffice = offices.some(o => o.id === input.officeId);
      
      if (!ownsOffice) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this office",
        });
      }

      // Get all bookings for the period
      const database = await getDb();
      if (!database) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const reportData = await database
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.officeId, input.officeId),
            gte(bookings.createdAt, input.startDate.toISOString()),
            lte(bookings.createdAt, input.endDate.toISOString())
          )
        )
        .orderBy(desc(bookings.createdAt));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "exported_financial_report",
        entityType: "office",
        entityId: input.officeId,
        description: `Exported ${input.format.toUpperCase()} report for ${input.startDate.toISOString().split('T')[0]} to ${input.endDate.toISOString().split('T')[0]}`,
      });

      // Return data for frontend to process
      return {
        data: reportData,
        format: input.format,
        period: {
          startDate: input.startDate.toISOString(),
          endDate: input.endDate.toISOString(),
        },
      };
    }),
});
