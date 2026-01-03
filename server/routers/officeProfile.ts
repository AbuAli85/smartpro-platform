import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const officeProfileRouter = router({
  // ============================================================================
  // VERSION CONTROL
  // ============================================================================

  /**
   * Get all versions for an office
   */
  getVersionHistory: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Check if user owns this office or is staff
      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const isOwner = office.ownerId === user.id;
      const isStaff = await db.isOfficeStaff(input.officeId, user.id);

      if (!isOwner && !isStaff && user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view version history" });
      }

      const versions = await db.getOfficeProfileVersions(input.officeId);
      return versions;
    }),

  /**
   * Get a specific version by ID
   */
  getVersionById: protectedProcedure
    .input(z.object({ versionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;

      const version = await db.getOfficeProfileVersionById(input.versionId);
      if (!version) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
      }

      // Check authorization
      const office = await db.getSanadOfficeById(version.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const isOwner = office.ownerId === user.id;
      const isStaff = await db.isOfficeStaff(version.officeId, user.id);

      if (!isOwner && !isStaff && user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this version" });
      }

      return version;
    }),

  /**
   * Revert office to a previous version
   */
  revertToVersion: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        versionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Check authorization
      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const isOwner = office.ownerId === user.id;
      const isStaff = await db.isOfficeStaff(input.officeId, user.id);

      if (!isOwner && !isStaff && user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to revert office profile" });
      }

      await db.revertOfficeToVersion(
        input.officeId,
        input.versionId,
        user.id,
        user.name || "Unknown User"
      );

      return { success: true, message: "Office profile reverted successfully" };
    }),

  /**
   * Create a version snapshot (usually called before making changes)
   */
  createVersionSnapshot: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        versionLabel: z.string().optional(),
        changeDescription: z.string().optional(),
        changedFields: z.array(z.string()).optional(),
        previousValues: z.record(z.any()).optional(),
        newValues: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Check authorization
      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const isOwner = office.ownerId === user.id;
      const isStaff = await db.isOfficeStaff(input.officeId, user.id);

      if (!isOwner && !isStaff && user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to create version snapshot" });
      }

      const result = await db.createOfficeProfileVersion({
        officeId: input.officeId,
        changedBy: user.id,
        changedByName: user.name || "Unknown User",
        versionLabel: input.versionLabel,
        changeDescription: input.changeDescription,
        snapshotData: office,
        changedFields: input.changedFields,
        previousValues: input.previousValues,
        newValues: input.newValues,
      });

      return { success: true, versionNumber: result.versionNumber, versionId: result.id };
    }),

  // ============================================================================
  // PREVIEW MODE
  // ============================================================================

  /**
   * Get office profile for preview (returns current data)
   */
  getProfilePreview: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;

      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const isOwner = office.ownerId === user.id;
      const isStaff = await db.isOfficeStaff(input.officeId, user.id);

      if (!isOwner && !isStaff && user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to preview this office" });
      }

      return office;
    }),

  /**
   * Generate preview with proposed changes (doesn't save to database)
   */
  generatePreview: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        changes: z.record(z.any()), // Object with field names and new values
      })
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;

      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const isOwner = office.ownerId === user.id;
      const isStaff = await db.isOfficeStaff(input.officeId, user.id);

      if (!isOwner && !isStaff && user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to preview changes" });
      }

      // Merge current office data with proposed changes
      const previewData = { ...office, ...input.changes };

      return {
        current: office,
        preview: previewData,
        changes: input.changes,
      };
    }),

  // ============================================================================
  // PHOTO GALLERY BULK OPERATIONS
  // ============================================================================

  /**
   * Get all images for an office
   */
  getImages: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;

      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const isOwner = office.ownerId === user.id;
      const isStaff = await db.isOfficeStaff(input.officeId, user.id);

      if (!isOwner && !isStaff && user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view images" });
      }

      const images = await db.getOfficeImages(input.officeId);
      return images;
    }),

  /**
   * Bulk delete images
   */
  bulkDeleteImages: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        imageIndices: z.array(z.number()), // Array of indices to delete
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const isOwner = office.ownerId === user.id;
      const isStaff = await db.isOfficeStaff(input.officeId, user.id);

      if (!isOwner && !isStaff && user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete images" });
      }

      // Get current images
      const currentImages = (await db.getOfficeImages(input.officeId)) as any[];

      // Create version snapshot before making changes
      await db.createOfficeProfileVersion({
        officeId: input.officeId,
        changedBy: user.id,
        changedByName: user.name || "Unknown User",
        versionLabel: "Bulk image deletion",
        changeDescription: `Deleted ${input.imageIndices.length} images`,
        snapshotData: office,
        changedFields: ["images"],
        previousValues: { images: currentImages },
        newValues: { images: currentImages.filter((_, idx) => !input.imageIndices.includes(idx)) },
      });

      // Filter out the images at the specified indices
      const updatedImages = currentImages.filter((_, idx) => !input.imageIndices.includes(idx));

      // Update the office with the new images array
      await db.updateOfficeImages(input.officeId, updatedImages);

      return { success: true, deletedCount: input.imageIndices.length, remainingCount: updatedImages.length };
    }),

  /**
   * Bulk apply crop settings to multiple images
   */
  bulkApplyCropSettings: protectedProcedure
    .input(
      z.object({
        officeId: z.number(),
        imageIndices: z.array(z.number()),
        cropSettings: z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
          aspectRatio: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      const office = await db.getSanadOfficeById(input.officeId);
      if (!office) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
      }

      const isOwner = office.ownerId === user.id;
      const isStaff = await db.isOfficeStaff(input.officeId, user.id);

      if (!isOwner && !isStaff && user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to modify images" });
      }

      // Get current images
      const currentImages = (await db.getOfficeImages(input.officeId)) as any[];

      // Create version snapshot before making changes
      await db.createOfficeProfileVersion({
        officeId: input.officeId,
        changedBy: user.id,
        changedByName: user.name || "Unknown User",
        versionLabel: "Bulk crop settings applied",
        changeDescription: `Applied crop settings to ${input.imageIndices.length} images`,
        snapshotData: office,
        changedFields: ["images"],
        previousValues: { images: currentImages },
        newValues: { images: currentImages.map((img, idx) =>
          input.imageIndices.includes(idx) ? { ...img, cropSettings: input.cropSettings } : img
        )},
      });

      // Apply crop settings to specified images
      const updatedImages = currentImages.map((img, idx) => {
        if (input.imageIndices.includes(idx)) {
          return { ...img, cropSettings: input.cropSettings };
        }
        return img;
      });

      // Update the office with the modified images array
      await db.updateOfficeImages(input.officeId, updatedImages);

      return { success: true, updatedCount: input.imageIndices.length };
    }),
});
