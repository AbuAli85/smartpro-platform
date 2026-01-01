import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { storagePut } from "../storage";
import { sendBilingualEmail, getUserLanguage } from "../_core/emailNotifications";
import { emitDocumentUploaded } from "../_core/socket";

export const bookingDocumentsRouter = router({
  // Upload a document for a booking
  upload: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded file data
        mimeType: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Get booking details
      const booking = await db.getBookingById(input.bookingId);
      
      if (!booking) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      }

      // Verify user is the office owner or staff
      const office = await db.getSanadOfficeById(booking.officeId);
      if (!office || office.ownerId !== user.id) {
        // Check if user is staff member
        const isStaff = await db.isOfficeStaff(booking.officeId, user.id);
        if (!isStaff) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only office owners and staff can upload documents" });
        }
      }

      // Decode base64 file data
      const fileBuffer = Buffer.from(input.fileData, 'base64');
      const fileSize = fileBuffer.length;

      // Validate file size (16MB limit)
      const fileSizeInMB = fileSize / (1024 * 1024);
      if (fileSizeInMB > 16) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "File size exceeds 16MB limit" });
      }

      // Generate unique file key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileExtension = input.fileName.split('.').pop();
      const fileKey = `booking-documents/${booking.officeId}/${input.bookingId}/${timestamp}-${randomSuffix}.${fileExtension}`;

      // Upload to S3
      const uploadResult = await storagePut(fileKey, fileBuffer, input.mimeType);

      if (!uploadResult || !uploadResult.url) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload document" });
      }

      // Save document metadata to database
      const document = await db.createBookingDocument({
        bookingId: input.bookingId,
        officeId: booking.officeId,
        fileName: input.fileName,
        fileUrl: uploadResult.url,
        fileKey: fileKey,
        fileSize: fileSize,
        mimeType: input.mimeType,
        uploadedBy: user.id,
        uploadedByName: user.name || 'Unknown',
        notes: input.notes,
        status: 'approved',
      });

      // Send email notification to customer
      const customer = await db.getUserById(booking.userId);
      if (customer && customer.email) {
        const userLanguage = getUserLanguage(customer.preferredLanguage);
        await sendBilingualEmail(
          customer.email,
          "documentUploaded",
          {
            customerName: customer.name || "User",
            officeName: office?.officeName || "Office",
            documentName: input.fileName,
            bookingId: booking.id.toString(),
          },
          userLanguage
        );
      }

      // Create notification for customer
      await db.createNotification({
        userId: booking.userId,
        type: "booking",
        title: "Document Uploaded",
        message: `${office?.officeName || 'Office'} uploaded a document: ${input.fileName}`,
        bookingId: input.bookingId,
        actionUrl: `/bookings`,
      });

      // Emit WebSocket event for real-time document upload notification
      try {
        emitDocumentUploaded(booking.userId, {
          bookingId: input.bookingId,
          documentName: input.fileName,
          officeName: office?.officeName || "Office",
        });
      } catch (error) {
        console.error("Failed to emit document upload event:", error);
      }

      return { success: true, document };
    }),

  // Get documents for a booking
  getByBooking: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Get booking details
      const booking = await db.getBookingById(input.bookingId);
      
      if (!booking) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      }

      // Verify user is either the customer or office owner/staff
      const office = await db.getSanadOfficeById(booking.officeId);
      const isOfficeOwner = office && office.ownerId === user.id;
      const isCustomer = booking.userId === user.id;
      const isStaff = await db.isOfficeStaff(booking.officeId, user.id);

      if (!isOfficeOwner && !isCustomer && !isStaff && user.role !== 'admin') {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const documents = await db.getBookingDocuments(input.bookingId);
      return documents;
    }),

  // Get all documents for an office (for office dashboard)
  getByOffice: protectedProcedure
    .input(z.object({ officeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Verify user is the office owner or staff
      const office = await db.getSanadOfficeById(input.officeId);
      if (!office || office.ownerId !== user.id) {
        const isStaff = await db.isOfficeStaff(input.officeId, user.id);
        if (!isStaff && user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
      }

      const documents = await db.getOfficeBookingDocuments(input.officeId);
      return documents;
    }),

  // Delete a document
  delete: protectedProcedure
    .input(z.object({ documentId: z.number(), officeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!;

      // Verify user is the office owner or staff
      const office = await db.getSanadOfficeById(input.officeId);
      if (!office || office.ownerId !== user.id) {
        const isStaff = await db.isOfficeStaff(input.officeId, user.id);
        if (!isStaff && user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only office owners and staff can delete documents" });
        }
      }

      // Delete from database
      const success = await db.deleteBookingDocument(input.documentId, input.officeId);

      if (!success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete document" });
      }

      // TODO: Also delete from S3 storage using storageDelete if available

      return { success: true };
    }),
});
