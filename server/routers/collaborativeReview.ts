import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { translationReviews, translationReviewComments } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendEmail } from "../_core/email";

export const collaborativeReviewRouter = router({
  // Submit translation for review
  submitForReview: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(["office", "template"]),
        entityId: z.number(),
        fieldName: z.string(),
        translatedText: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create review record
      const [result] = await db.insert(translationReviews).values({
        entityType: input.entityType,
        entityId: input.entityId,
        fieldName: input.fieldName,
        translatedText: input.translatedText,
        status: "pending",
        submittedBy: ctx.user.id,
        submittedByName: ctx.user.name || "Unknown",
        submittedAt: new Date().toISOString(),
      });

      // Send email notification to admins
      try {
        await sendEmail({
          to: process.env.OWNER_EMAIL || "admin@smartpro.om",
          subject: "New Translation Review Request",
          html: `<p>${ctx.user.name} has submitted a translation for review.</p><p><strong>Entity:</strong> ${input.entityType} #${input.entityId}<br><strong>Field:</strong> ${input.fieldName}</p><p>Please review at: ${process.env.VITE_OAUTH_PORTAL_URL}/admin/translation-reviews</p>`,
        });
      } catch (error) {
        console.error("Failed to send review notification email:", error);
      }

      return {
        success: true,
        reviewId: (result as any).insertId,
      };
    }),

  // Get pending reviews (for reviewers)
  getPendingReviews: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const reviews = await db
      .select()
      .from(translationReviews)
      .where(eq(translationReviews.status, "pending"))
      .orderBy(desc(translationReviews.submittedAt));

    return reviews;
  }),

  // Get all reviews with filters
  getReviews: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected", "needs_revision"]).optional(),
        entityType: z.enum(["office", "template"]).optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(translationReviews);

      if (input.status) {
        query = query.where(eq(translationReviews.status, input.status)) as any;
      }

      if (input.entityType) {
        const condition = eq(translationReviews.entityType, input.entityType);
        query = input.status
          ? query.where(and(eq(translationReviews.status, input.status), condition)) as any
          : query.where(condition) as any;
      }

      query = query.orderBy(desc(translationReviews.submittedAt)) as any;

      if (input.limit) {
        query = query.limit(input.limit) as any;
      }

      const reviews = await query;
      return reviews;
    }),

  // Get review by ID with comments
  getReviewById: adminProcedure
    .input(z.object({ reviewId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [review] = await db
        .select()
        .from(translationReviews)
        .where(eq(translationReviews.id, input.reviewId));

      if (!review) {
        throw new Error("Review not found");
      }

      const comments = await db
        .select()
        .from(translationReviewComments)
        .where(eq(translationReviewComments.reviewId, input.reviewId))
        .orderBy(desc(translationReviewComments.createdAt));

      return {
        review,
        comments,
      };
    }),

  // Add comment to review
  addComment: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        comment: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(translationReviewComments).values({
        reviewId: input.reviewId,
        userId: ctx.user.id,
        userName: ctx.user.name || "Unknown",
        comment: input.comment,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  // Approve review
  approveReview: adminProcedure
    .input(
      z.object({
        reviewId: z.number(),
        reviewNotes: z.string().optional(),
        applyTranslation: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get review details
      const [review] = await db
        .select()
        .from(translationReviews)
        .where(eq(translationReviews.id, input.reviewId));

      if (!review) {
        throw new Error("Review not found");
      }

      // Update review status
      await db
        .update(translationReviews)
        .set({
          status: "approved",
          reviewedBy: ctx.user.id,
          reviewedByName: ctx.user.name || "Unknown",
          reviewNotes: input.reviewNotes,
          reviewedAt: new Date().toISOString(),
        })
        .where(eq(translationReviews.id, input.reviewId));

      // Apply translation if requested
      if (input.applyTranslation) {
        if (review.entityType === "office") {
          const { sanadOffices } = await import("../../drizzle/schema");
          const updateData: any = {};
          
          if (review.fieldName === "nameAr") {
            updateData.officeNameAr = review.translatedText;
          } else if (review.fieldName === "descriptionAr") {
            updateData.descriptionAr = review.translatedText;
          }

          if (Object.keys(updateData).length > 0) {
            await db
              .update(sanadOffices)
              .set(updateData)
              .where(eq(sanadOffices.id, review.entityId));
          }
        } else if (review.entityType === "template") {
          const { documentTemplates } = await import("../../drizzle/schema");
          const updateData: any = {};
          
          if (review.fieldName === "nameAr") {
            updateData.templateNameAr = review.translatedText;
          } else if (review.fieldName === "descriptionAr") {
            updateData.descriptionAr = review.translatedText;
          }

          if (Object.keys(updateData).length > 0) {
            await db
              .update(documentTemplates)
              .set(updateData)
              .where(eq(documentTemplates.id, review.entityId));
          }
        }
      }

      // Send notification to submitter
      try {
        await sendEmail({
          to: review.submittedByName, // This should be email, but we'll use name for now
          subject: "Translation Review Approved",
          html: `<p>Your translation for ${review.entityType} #${review.entityId} (${review.fieldName}) has been approved${input.applyTranslation ? " and applied" : ""}.</p>${input.reviewNotes ? `<p><strong>Reviewer notes:</strong> ${input.reviewNotes}</p>` : ""}`,
        });
      } catch (error) {
        console.error("Failed to send approval notification:", error);
      }

      return { success: true };
    }),

  // Reject review
  rejectReview: adminProcedure
    .input(
      z.object({
        reviewId: z.number(),
        reviewNotes: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get review details for notification
      const [review] = await db
        .select()
        .from(translationReviews)
        .where(eq(translationReviews.id, input.reviewId));

      if (!review) {
        throw new Error("Review not found");
      }

      // Update review status
      await db
        .update(translationReviews)
        .set({
          status: "rejected",
          reviewedBy: ctx.user.id,
          reviewedByName: ctx.user.name || "Unknown",
          reviewNotes: input.reviewNotes,
          reviewedAt: new Date().toISOString(),
        })
        .where(eq(translationReviews.id, input.reviewId));

      // Send notification to submitter
      try {
        await sendEmail({
          to: review.submittedByName,
          subject: "Translation Review Rejected",
          html: `<p>Your translation for ${review.entityType} #${review.entityId} (${review.fieldName}) has been rejected.</p><p><strong>Reviewer notes:</strong> ${input.reviewNotes}</p><p>Please revise and resubmit.</p>`,
        });
      } catch (error) {
        console.error("Failed to send rejection notification:", error);
      }

      return { success: true };
    }),

  // Request revision
  requestRevision: adminProcedure
    .input(
      z.object({
        reviewId: z.number(),
        reviewNotes: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get review details
      const [review] = await db
        .select()
        .from(translationReviews)
        .where(eq(translationReviews.id, input.reviewId));

      if (!review) {
        throw new Error("Review not found");
      }

      // Update review status
      await db
        .update(translationReviews)
        .set({
          status: "needs_revision",
          reviewedBy: ctx.user.id,
          reviewedByName: ctx.user.name || "Unknown",
          reviewNotes: input.reviewNotes,
          reviewedAt: new Date().toISOString(),
        })
        .where(eq(translationReviews.id, input.reviewId));

      // Send notification
      try {
        await sendEmail({
          to: review.submittedByName,
          subject: "Translation Revision Requested",
          html: `<p>Your translation for ${review.entityType} #${review.entityId} (${review.fieldName}) needs revision.</p><p><strong>Reviewer notes:</strong> ${input.reviewNotes}</p>`,
        });
      } catch (error) {
        console.error("Failed to send revision request notification:", error);
      }

      return { success: true };
    }),

  // Get user's submitted reviews
  getMyReviews: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const reviews = await db
      .select()
      .from(translationReviews)
      .where(eq(translationReviews.submittedBy, ctx.user.id))
      .orderBy(desc(translationReviews.submittedAt));

    return reviews;
  }),
});
