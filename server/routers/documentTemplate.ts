import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { storagePut } from "../storage";
import { generatePDF } from "../pdfGenerator";

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
    .query(async ({ input }) => {
      const { page, limit, category, language, search } = input;
      const offset = (page - 1) * limit;

      const result = await db.listDocumentTemplates({
        category,
        language,
        search,
        limit,
        offset,
      });

      return {
        templates: result.templates,
        total: result.total,
        page,
        limit,
      };
    }),

  // Get a single template by ID
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
});
