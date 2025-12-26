import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { logActivity } from "../db";

// Validation schemas
const createSanadOfficeSchema = z.object({
  officeName: z.string().min(3, "Office name must be at least 3 characters"),
  officeNameAr: z.string().optional(),
  commercialRegistration: z.string().min(5, "Commercial registration is required"),
  tradeLicense: z.string().optional(),
  taxRegistration: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  whatsapp: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  governorate: z.string().min(1, "Governorate is required"),
  wilayat: z.string().min(1, "Wilayat is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  yearEstablished: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
});

export const sanadOfficeRouter = router({
  // Create a new Sanad office
  create: protectedProcedure
    .input(createSanadOfficeSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Generate slug from office name
      const slug = input.officeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if slug already exists
      const existingOffice = await db.getSanadOfficeBySlug(slug);
      if (existingOffice) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An office with this name already exists",
        });
      }

      // Create the office
      const officeId = await db.createSanadOffice({
        ...input,
        slug,
        ownerId: user.id,
        status: "pending",
        verificationStatus: "unverified",
        createdBy: user.id,
      });

      // Add the owner as staff
      await db.addSanadOfficeStaff({
        officeId,
        userId: user.id,
        role: "owner",
        status: "active",
        joinedAt: new Date(),
      });

      // Log activity
      await logActivity({
        userId: user.id,
        action: "created",
        entityType: "sanad_office",
        entityId: officeId,
        description: `Created Sanad office: ${input.officeName}`,
      });

      return { id: officeId, slug };
    }),

  // Get a single Sanad office by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const office = await db.getSanadOfficeById(input.id);

      if (!office) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Office not found",
        });
      }

      // Get services
      const services = await db.getSanadOfficeServices(input.id);

      // Get reviews
      const reviews = await db.getOfficeReviews(input.id);

      return {
        ...office,
        services,
        reviews,
      };
    }),

  // Get a single Sanad office by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const office = await db.getSanadOfficeBySlug(input.slug);

      if (!office || office.status !== "active") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Office not found",
        });
      }

      // Get services
      const services = await db.getSanadOfficeServices(office.id);

      // Get reviews
      const reviews = await db.getOfficeReviews(office.id);

      return {
        ...office,
        services,
        reviews,
      };
    }),

  // List all Sanad offices (with pagination and filters)
  list: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        governorate: z.string().optional(),
        search: z.string().optional(),
        status: z.enum(["pending", "active", "suspended", "inactive"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, governorate, search, status } = input;
      const offset = (page - 1) * limit;

      const result = await db.listSanadOffices({
        governorate,
        search,
        status: status || "active", // Default to active for public view
        limit,
        offset,
      });

      return {
        offices: result.offices,
        total: result.total,
        page,
        limit,
      };
    }),

  // Get offices owned by the current user
  getMyOffices: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    return await db.getSanadOfficesByOwnerId(user.id);
  }),

  // Get staff for an office
  getStaff: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getSanadOfficeStaff(input.officeId);
    }),

  // Invite staff to an office
  inviteStaff: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        email: z.string().email(),
        role: z.enum(["owner", "manager", "staff", "viewer"]),
        permissions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Check if current user has permission
      const currentStaff = await db.getUserOfficeRole(user.id, input.officeId);

      if (!currentStaff || !["owner", "manager"].includes(currentStaff.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to invite staff",
        });
      }

      // TODO: Find user by email and invite them
      // For now, just return success
      return { success: true };
    }),

  // Add a service to an office
  addService: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        serviceName: z.string().min(3),
        serviceNameAr: z.string().optional(),
        category: z.string().min(1),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        price: z.string().optional(),
        priceType: z.enum(["fixed", "hourly", "custom"]).default("fixed"),
        estimatedDeliveryDays: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Check if user has permission
      const staff = await db.getUserOfficeRole(user.id, input.officeId);

      if (!staff || !["owner", "manager"].includes(staff.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to add services",
        });
      }

      const serviceId = await db.createSanadOfficeService({
        officeId: input.officeId,
        serviceName: input.serviceName,
        serviceNameAr: input.serviceNameAr,
        category: input.category,
        description: input.description,
        descriptionAr: input.descriptionAr,
        price: input.price,
        priceType: input.priceType,
        estimatedDeliveryDays: input.estimatedDeliveryDays,
        currency: "OMR",
        isActive: true,
      });

      await logActivity({
        userId: user.id,
        action: "created",
        entityType: "service",
        entityId: serviceId,
        description: `Added service: ${input.serviceName}`,
      });

      return { id: serviceId };
    }),

  // Get services for an office
  getServices: publicProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getSanadOfficeServices(input.officeId);
    }),

  // Get the first office owned by current user (for dashboard)
  getMyOffice: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    const offices = await db.getSanadOfficesByOwnerId(user.id);
    return offices[0] || null;
  }),

  // Get statistics for an office
  getOfficeStats: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOfficeStatistics(input.officeId);
    }),

  // Availability management
  getAvailability: publicProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOfficeAvailability(input.officeId);
    }),

  createAvailability: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
        slotDuration: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createOfficeAvailability(input);
      return { success: true };
    }),

  updateAvailability: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        slotDuration: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateOfficeAvailability(input.id, input);
      return { success: true };
    }),

  deleteAvailability: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteOfficeAvailability(input.id);
      return { success: true };
    }),

  // Office profile management
  updateProfile: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        email: z.string().email(),
        phone: z.string(),
        address: z.string(),
        region: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { officeId, ...updateData } = input;
      
      // Verify office ownership
      const office = await db.getOfficeById(officeId);
      if (!office || office.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this office",
        });
      }

      await db.updateOfficeProfile(officeId, updateData);
      return { success: true };
    }),
});
