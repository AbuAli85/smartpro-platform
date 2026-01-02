import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { randomBytes } from "crypto";
import * as db from "../db";

export const draftFormsRouter = router({
  /**
   * Save a draft form (authenticated or anonymous)
   */
  saveDraft: publicProcedure
    .input(
      z.object({
        formType: z.string(),
        formData: z.record(z.any()),
        metadata: z.record(z.any()).optional(),
        expiresInDays: z.number().min(1).max(30).default(7),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate unique draft ID
      const draftId = randomBytes(16).toString("hex");
      
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
      
      // Insert draft
      await ctx.db.insert(ctx.schema.draftForms).values({
        draftId,
        userId: ctx.user?.id || null,
        formType: input.formType,
        formData: input.formData,
        metadata: input.metadata || {},
        expiresAt: expiresAt.toISOString(),
        isExpired: 0,
      });
      
      // Return shareable link
      const baseUrl = process.env.VITE_APP_URL || `https://${ctx.req.headers.host}`;
      const shareableLink = `${baseUrl}/resume-form/${draftId}`;
      
      return {
        draftId,
        shareableLink,
        expiresAt: expiresAt.toISOString(),
      };
    }),

  /**
   * Load a draft by ID
   */
  loadDraft: publicProcedure
    .input(z.object({ draftId: z.string() }))
    .query(async ({ ctx, input }) => {
      const drafts = await ctx.db
        .select()
        .from(ctx.schema.draftForms)
        .where(ctx.eq(ctx.schema.draftForms.draftId, input.draftId))
        .limit(1);
      
      if (!drafts || drafts.length === 0) {
        throw new Error("Draft not found");
      }
      
      const draft = drafts[0];
      
      // Check if expired
      const now = new Date();
      const expiresAt = new Date(draft.expiresAt);
      
      if (now > expiresAt || draft.isExpired) {
        throw new Error("This draft has expired");
      }
      
      return {
        draftId: draft.draftId,
        formType: draft.formType,
        formData: draft.formData,
        metadata: draft.metadata,
        expiresAt: draft.expiresAt,
        createdAt: draft.createdAt,
      };
    }),

  /**
   * Update an existing draft
   */
  updateDraft: publicProcedure
    .input(
      z.object({
        draftId: z.string(),
        formData: z.record(z.any()),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if draft exists and not expired
      const drafts = await ctx.db
        .select()
        .from(ctx.schema.draftForms)
        .where(ctx.eq(ctx.schema.draftForms.draftId, input.draftId))
        .limit(1);
      
      if (!drafts || drafts.length === 0) {
        throw new Error("Draft not found");
      }
      
      const draft = drafts[0];
      const now = new Date();
      const expiresAt = new Date(draft.expiresAt);
      
      if (now > expiresAt || draft.isExpired) {
        throw new Error("This draft has expired");
      }
      
      // Update draft
      await ctx.db
        .update(ctx.schema.draftForms)
        .set({
          formData: input.formData,
          metadata: input.metadata || draft.metadata,
        })
        .where(ctx.eq(ctx.schema.draftForms.draftId, input.draftId));
      
      return { success: true };
    }),

  /**
   * Delete a draft
   */
  deleteDraft: protectedProcedure
    .input(z.object({ draftId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;
      
      // Check if draft belongs to user
      const drafts = await ctx.db
        .select()
        .from(ctx.schema.draftForms)
        .where(ctx.eq(ctx.schema.draftForms.draftId, input.draftId))
        .limit(1);
      
      if (!drafts || drafts.length === 0) {
        throw new Error("Draft not found");
      }
      
      const draft = drafts[0];
      
      if (draft.userId !== user.id) {
        throw new Error("You don't have permission to delete this draft");
      }
      
      // Delete draft
      await ctx.db
        .delete(ctx.schema.draftForms)
        .where(ctx.eq(ctx.schema.draftForms.draftId, input.draftId));
      
      return { success: true };
    }),

  /**
   * Get user's saved drafts
   */
  getMyDrafts: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    
    const drafts = await ctx.db
      .select()
      .from(ctx.schema.draftForms)
      .where(
        ctx.and(
          ctx.eq(ctx.schema.draftForms.userId, user.id),
          ctx.eq(ctx.schema.draftForms.isExpired, 0)
        )
      )
      .orderBy(ctx.desc(ctx.schema.draftForms.updatedAt));
    
    // Filter out expired drafts
    const now = new Date();
    const validDrafts = drafts.filter((draft) => {
      const expiresAt = new Date(draft.expiresAt);
      return now <= expiresAt;
    });
    
    return validDrafts.map((draft) => ({
      draftId: draft.draftId,
      formType: draft.formType,
      metadata: draft.metadata,
      expiresAt: draft.expiresAt,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    }));
  }),

  /**
   * Mark expired drafts (cleanup job)
   */
  markExpiredDrafts: publicProcedure.mutation(async ({ ctx }) => {
    const now = new Date().toISOString();
    
    await ctx.db
      .update(ctx.schema.draftForms)
      .set({ isExpired: 1 })
      .where(
        ctx.and(
          ctx.lt(ctx.schema.draftForms.expiresAt, now),
          ctx.eq(ctx.schema.draftForms.isExpired, 0)
        )
      );
    
    return { success: true };
  }),
});
