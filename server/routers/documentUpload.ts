import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { storagePut } from "../storage";
import { validateDocument, getRequiredDocuments, checkDocumentCompleteness } from "../documentValidation";
import { randomBytes } from "crypto";

/**
 * Document Upload Router
 * Handles document uploads with AI validation for service requests
 */
export const documentUploadRouter = router({
  /**
   * Get required documents for a service type
   */
  getRequiredDocuments: protectedProcedure
    .input(
      z.object({
        serviceType: z.string(),
      })
    )
    .query(async ({ input }) => {
      const requirements = getRequiredDocuments(input.serviceType);
      return {
        requirements,
        totalRequired: requirements.filter((r) => r.required).length,
        totalOptional: requirements.filter((r) => !r.required).length,
      };
    }),

  /**
   * Upload a document
   */
  uploadDocument: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded file data
        mimeType: z.string(),
        documentType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Validate file size (16MB limit)
      const fileBuffer = Buffer.from(input.fileData, "base64");
      const fileSizeInMB = fileBuffer.length / (1024 * 1024);
      
      if (fileSizeInMB > 16) {
        throw new Error("File size exceeds 16MB limit");
      }

      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(input.mimeType)) {
        throw new Error("Invalid file type. Only PDF, JPG, and PNG files are allowed");
      }

      // Generate unique file key with random suffix
      const randomSuffix = randomBytes(8).toString("hex");
      const extension = input.mimeType.split("/")[1];
      const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileKey = `service-requests/${user.id}/${Date.now()}-${randomSuffix}-${sanitizedFileName}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

      return {
        url,
        fileKey,
        fileName: input.fileName,
        mimeType: input.mimeType,
        size: fileBuffer.length,
        uploadedAt: new Date().toISOString(),
      };
    }),

  /**
   * Validate an uploaded document using AI
   */
  validateDocument: protectedProcedure
    .input(
      z.object({
        documentUrl: z.string(),
        fileName: z.string(),
        expectedType: z.string(),
        serviceType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const validation = await validateDocument(
        input.documentUrl,
        input.expectedType,
        input.serviceType
      );

      return {
        ...validation,
        fileName: input.fileName,
      };
    }),

  /**
   * Validate multiple documents
   */
  validateMultipleDocuments: protectedProcedure
    .input(
      z.object({
        documents: z.array(
          z.object({
            url: z.string(),
            name: z.string(),
            type: z.string().optional(),
          })
        ),
        serviceType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const validations = await Promise.all(
        input.documents.map(async (doc) => {
          const expectedType = doc.type || "supporting_document";
          const validation = await validateDocument(
            doc.url,
            expectedType,
            input.serviceType
          );

          return {
            ...validation,
            fileName: doc.name,
            url: doc.url,
          };
        })
      );

      // Check completeness
      const completeness = checkDocumentCompleteness(
        validations.map((v) => ({ type: v.documentType })),
        input.serviceType
      );

      return {
        validations,
        completeness,
        summary: {
          total: validations.length,
          valid: validations.filter((v) => v.isValid).length,
          invalid: validations.filter((v) => !v.isValid).length,
          averageConfidence:
            validations.reduce((sum, v) => sum + v.confidence, 0) / validations.length,
        },
      };
    }),

  /**
   * Check document completeness for a service type
   */
  checkCompleteness: protectedProcedure
    .input(
      z.object({
        uploadedDocuments: z.array(
          z.object({
            type: z.string(),
          })
        ),
        serviceType: z.string(),
      })
    )
    .query(async ({ input }) => {
      return checkDocumentCompleteness(input.uploadedDocuments, input.serviceType);
    }),
});
