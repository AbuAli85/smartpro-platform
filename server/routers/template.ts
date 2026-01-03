import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

export const templateRouter = router({
  // Get all templates with filters
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        language: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await db.listDocumentTemplates(input);
    }),

  // Get template by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const template = await db.getDocumentTemplateById(input.id);
      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }
      return template;
    }),

  // Get templates by office (for office owners)
  getByOffice: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getDocumentTemplatesByOfficeId(input.officeId);
    }),

  // Create template (office owners)
  create: protectedProcedure
    .input(
      z.object({
        templateName: z.string(),
        templateNameAr: z.string().optional(),
        category: z.string(),
        description: z.string().optional(),
        templateContent: z.string(),
        variables: z.any().optional(),
        language: z.string().default("en"),
        isOfficial: z.boolean().default(false),
        isPremium: z.boolean().default(false),
        price: z.string().optional(),
        officeId: z.number().optional(),
        // File upload data
        fileData: z.string().optional(), // Base64 encoded file
        fileName: z.string().optional(),
        mimeType: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let fileUrl: string | undefined;
      let fileKey: string | undefined;
      let fileSize: number | undefined;

      // Handle file upload if provided
      if (input.fileData && input.fileName) {
        const buffer = Buffer.from(input.fileData, "base64");
        fileSize = buffer.length;
        
        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        fileKey = `templates/${ctx.user.id}/${timestamp}-${randomSuffix}-${input.fileName}`;
        
        const result = await storagePut(fileKey, buffer, input.mimeType);
        fileUrl = result.url;
      }

      const templateId = await db.createDocumentTemplateByOwner({
        templateName: input.templateName,
        templateNameAr: input.templateNameAr,
        category: input.category,
        description: input.description,
        templateContent: input.templateContent,
        variables: input.variables,
        language: input.language,
        isOfficial: input.isOfficial,
        isPremium: input.isPremium,
        price: input.price,
        fileUrl,
        fileKey,
        fileSize,
        mimeType: input.mimeType,
        createdBy: ctx.user.id,
        officeId: input.officeId,
      });

      return { id: templateId, fileUrl };
    }),

  // Update template
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        templateName: z.string().optional(),
        templateNameAr: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        templateContent: z.string().optional(),
        variables: z.any().optional(),
        price: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await db.updateDocumentTemplateByOwner(id, updates);
      return { success: true };
    }),

  // Delete template
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteDocumentTemplateByOwner(input.id);
      return { success: true };
    }),

  // Track download
  trackDownload: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.trackTemplateDownload(input.templateId, ctx.user.id, {
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      
      // Increment usage count
      await db.incrementTemplateUsage(input.templateId);
      
      return { success: true };
    }),

  // Get download stats
  getDownloadStats: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      return await db.getTemplateDownloadStats(input.templateId);
    }),
});
