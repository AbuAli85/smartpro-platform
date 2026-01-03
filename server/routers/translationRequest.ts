import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { sendEmail } from "../_core/email";
import { ENV } from "../_core/env";

/**
 * Translation Request Router
 * Handles translation request workflow: submission, approval, rejection, completion
 */

export const translationRequestRouter = router({
  /**
   * Create a new translation request
   * Office owners can request translations for their offices
   */
  create: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(["office", "template"]),
        entityId: z.number(),
        proposedNameAr: z.string().optional(),
        proposedDescriptionAr: z.string().optional(),
        notes: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get entity details
      let currentNameEn: string;
      let currentDescriptionEn: string | undefined;

      if (input.entityType === "office") {
        const office = await db.getSanadOfficeById(input.entityId);
        if (!office) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Office not found",
          });
        }
        currentNameEn = office.officeName;
        currentDescriptionEn = office.description || undefined;
      } else {
        const template = await db.getDocumentTemplateById(input.entityId);
        if (!template) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Template not found",
          });
        }
        currentNameEn = template.templateName;
        currentDescriptionEn = template.description || undefined;
      }

      // Create translation request
      const requestId = await db.createTranslationRequest({
        entityType: input.entityType,
        entityId: input.entityId,
        requesterId: ctx.user.id,
        requesterName: ctx.user.name || "Unknown User",
        requesterEmail: ctx.user.email || undefined,
        currentNameEn,
        currentDescriptionEn,
        proposedNameAr: input.proposedNameAr,
        proposedDescriptionAr: input.proposedDescriptionAr,
        notes: input.notes,
        priority: input.priority,
      });

      // Send email notification to admins
      try {
        await sendEmail({
          to: process.env.OWNER_EMAIL || "admin@smartpro.om",
          subject: `New Translation Request: ${currentNameEn}`,
          html: `
            <h2>New Translation Request</h2>
            <p><strong>Type:</strong> ${input.entityType}</p>
            <p><strong>Name:</strong> ${currentNameEn}</p>
            <p><strong>Requested by:</strong> ${ctx.user.name} (${ctx.user.email})</p>
            <p><strong>Priority:</strong> ${input.priority}</p>
            ${input.notes ? `<p><strong>Notes:</strong> ${input.notes}</p>` : ""}
            <p><a href="${process.env.VITE_APP_URL || "https://smartpro.om"}/admin/translation-requests/${requestId}">Review Request</a></p>
          `,
        });
      } catch (error) {
        console.error("[Translation Request] Failed to send email notification:", error);
        // Don't fail the request if email fails
      }

      return {
        success: true,
        requestId,
        message: "Translation request submitted successfully",
      };
    }),

  /**
   * List translation requests
   * Admins see all, users see only their own
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
        entityType: z.enum(["office", "template"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const filters = {
        status: input.status,
        entityType: input.entityType,
        limit: input.limit,
        offset: input.offset,
        // Non-admins can only see their own requests
        requesterId: ctx.user.role === "admin" ? undefined : ctx.user.id,
      };

      const requests = await db.listTranslationRequests(filters);
      return requests;
    }),

  /**
   * Get single translation request by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const request = await db.getTranslationRequestById(input.id);
      
      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Translation request not found",
        });
      }

      // Non-admins can only view their own requests
      if (ctx.user.role !== "admin" && request.requesterId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own translation requests",
        });
      }

      return request;
    }),

  /**
   * Approve translation request (Admin only)
   */
  approve: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        reviewNotes: z.string().optional(),
        applyTranslation: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can approve translation requests",
        });
      }

      const request = await db.getTranslationRequestById(input.id);
      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Translation request not found",
        });
      }

      // Update request status
      await db.updateTranslationRequestStatus(
        input.id,
        "approved",
        ctx.user.id,
        input.reviewNotes
      );

      // Apply translation if requested
      if (input.applyTranslation && (request.proposedNameAr || request.proposedDescriptionAr)) {
        if (request.entityType === "office") {
          await db.updateOfficeTranslation(request.entityId, {
            officeNameAr: request.proposedNameAr || undefined,
            descriptionAr: request.proposedDescriptionAr || undefined,
          });
        } else {
          await db.updateTemplateTranslation(request.entityId, {
            templateNameAr: request.proposedNameAr || undefined,
            descriptionAr: request.proposedDescriptionAr || undefined,
          });
        }

        // Log translation activity
        await db.logTranslationActivity({
          entityType: request.entityType,
          entityId: request.entityId,
          entityName: request.currentNameEn,
          translatorId: ctx.user.id,
          translatorName: ctx.user.name || "Admin",
          actionType: "updated",
          fieldChanged: "both",
          source: "request_approval",
          requestId: input.id,
        });

        // Mark request as completed
        await db.completeTranslationRequest(input.id, ctx.user.id);
      }

      // Send email notification to requester
      if (request.requesterEmail) {
        try {
          await sendEmail({
            to: request.requesterEmail,
            subject: `Translation Request Approved: ${request.currentNameEn}`,
            html: `
              <h2>Translation Request Approved</h2>
              <p>Your translation request for <strong>${request.currentNameEn}</strong> has been approved.</p>
              ${input.reviewNotes ? `<p><strong>Admin Notes:</strong> ${input.reviewNotes}</p>` : ""}
              ${input.applyTranslation ? "<p>The translation has been applied to the system.</p>" : ""}
            `,
          });
        } catch (error) {
          console.error("[Translation Request] Failed to send approval email:", error);
        }
      }

      return {
        success: true,
        message: "Translation request approved successfully",
      };
    }),

  /**
   * Reject translation request (Admin only)
   */
  reject: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        reviewNotes: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can reject translation requests",
        });
      }

      const request = await db.getTranslationRequestById(input.id);
      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Translation request not found",
        });
      }

      // Update request status
      await db.updateTranslationRequestStatus(
        input.id,
        "rejected",
        ctx.user.id,
        input.reviewNotes
      );

      // Send email notification to requester
      if (request.requesterEmail) {
        try {
          await sendEmail({
            to: request.requesterEmail,
            subject: `Translation Request Rejected: ${request.currentNameEn}`,
            html: `
              <h2>Translation Request Rejected</h2>
              <p>Your translation request for <strong>${request.currentNameEn}</strong> has been rejected.</p>
              <p><strong>Reason:</strong> ${input.reviewNotes}</p>
              <p>Please review the feedback and submit a new request if needed.</p>
            `,
          });
        } catch (error) {
          console.error("[Translation Request] Failed to send rejection email:", error);
        }
      }

      return {
        success: true,
        message: "Translation request rejected",
      };
    }),

  /**
   * Get pending translation requests count (for admin badge)
   */
  getPendingCount: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      return 0;
    }

    const count = await db.getPendingTranslationRequestsCount();
    return count;
  }),
});
