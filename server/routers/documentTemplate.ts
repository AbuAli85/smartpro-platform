import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { storagePut } from "../storage";
import { generatePDF } from "../pdfGenerator";
import { localizeArray } from "../helpers/i18n";

export const documentTemplateRouter = router({
  // List all document templates
  list: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        category: z.string().optional(),
        language: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, category, language, search } = input;
      const offset = (page - 1) * limit;

      const result = await db.listDocumentTemplates({
        category,
        language,
        search,
        limit,
        offset,
      });

      // Localize template names and descriptions
      const localizedTemplates = localizeArray(
        result.templates,
        ctx.language,
        ["templateName", "description"]
      );

      return {
        templates: localizedTemplates,
        total: result.total,
        page,
        limit,
      };
    }),

  // Get a single template by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const template = await db.getDocumentTemplateById(input.id);

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      // Localize template content
      const localizedTemplate = localizeArray([template], ctx.language, ["templateName", "description"])[0];

      return localizedTemplate;
    }),

  // Generate a document from a template
  generate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        documentName: z.string(),
        filledData: z.record(z.string(), z.any()),
        officeId: z.number().optional(),
        bookingId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Get the template
      const template = await db.getDocumentTemplateById(input.templateId);

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      // Generate PDF from template and filled data
      const pdfBuffer = await generatePDF({
        template,
        filledData: input.filledData,
        language: template.language as "en" | "ar",
      });

      // Upload to S3
      const fileKey = `documents/${user.id}/${Date.now()}-${input.documentName}.pdf`;
      const { url } = await storagePut(
        fileKey,
        pdfBuffer,
        "application/pdf"
      );

      // Save the generated document
      const docId = await db.createGeneratedDocument({
        templateId: input.templateId,
        userId: user.id,
        officeId: input.officeId,
        bookingId: input.bookingId,
        documentName: input.documentName,
        filledData: input.filledData,
        fileUrl: url,
        fileKey,
        status: "generated",
      });

      // Increment template usage
      await db.incrementTemplateUsage(input.templateId);

      await db.logActivity({
        userId: user.id,
        action: "generated",
        entityType: "document",
        entityId: docId,
        description: `Generated document: ${input.documentName}`,
      });

      return { id: docId, url };
    }),

  // Get user's generated documents
  getMyDocuments: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    return await db.getUserGeneratedDocuments(user.id);
  }),

  // Translation Management (Admin only)
  updateTranslation: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      templateNameAr: z.string().optional(),
      descriptionAr: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user!.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const { templateId, ...translations } = input;
      await db.updateTemplateTranslation(templateId, translations);
      return { success: true };
    }),
});
