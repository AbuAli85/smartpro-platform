import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Booking Documents", () => {
  let testBookingId: number;
  let testOfficeId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Use existing test data
    testUserId = 1;
    testOfficeId = 1;
    
    // Create a test booking
    testBookingId = await db.createBooking({
      officeId: testOfficeId,
      userId: testUserId,
      serviceDescription: "Test service for document tests",
      status: "confirmed",
    });
  });

  it("should create a booking document", async () => {
    const document = await db.createBookingDocument({
      bookingId: testBookingId,
      officeId: testOfficeId,
      fileName: "test-license.pdf",
      fileUrl: "https://example.com/test-license.pdf",
      fileKey: "booking-documents/1/1/test-license.pdf",
      fileSize: 1024000,
      mimeType: "application/pdf",
      uploadedBy: testUserId,
      uploadedByName: "Test User",
      notes: "Test document upload",
      status: "approved",
    });

    expect(document).toBeDefined();
  });

  it("should retrieve documents for a booking", async () => {
    const documents = await db.getBookingDocuments(testBookingId);

    expect(documents).toBeDefined();
    expect(Array.isArray(documents)).toBe(true);
    expect(documents.length).toBeGreaterThan(0);
    
    const doc = documents[0];
    expect(doc.bookingId).toBe(testBookingId);
    expect(doc.fileName).toBe("test-license.pdf");
  });

  it("should retrieve documents for an office", async () => {
    const documents = await db.getOfficeBookingDocuments(testOfficeId);

    expect(documents).toBeDefined();
    expect(Array.isArray(documents)).toBe(true);
    expect(documents.length).toBeGreaterThan(0);
  });

  it("should handle empty document list for non-existent booking", async () => {
    const nonExistentBookingId = 999999;
    const documents = await db.getBookingDocuments(nonExistentBookingId);

    expect(documents).toBeDefined();
    expect(Array.isArray(documents)).toBe(true);
    expect(documents.length).toBe(0);
  });

  it("should delete a booking document", async () => {
    // Create a document to delete
    const docToDelete = await db.createBookingDocument({
      bookingId: testBookingId,
      officeId: testOfficeId,
      fileName: "temp-document.pdf",
      fileUrl: "https://example.com/temp.pdf",
      fileKey: "booking-documents/1/1/temp.pdf",
      uploadedBy: testUserId,
      uploadedByName: "Test User",
    });

    expect(docToDelete).toBeDefined();

    // Get all documents before deletion
    const beforeDelete = await db.getBookingDocuments(testBookingId);
    const beforeCount = beforeDelete.length;

    // Delete the document
    const deleted = await db.deleteBookingDocument(docToDelete.id, testOfficeId);
    expect(deleted).toBe(true);

    // Verify deletion
    const afterDelete = await db.getBookingDocuments(testBookingId);
    expect(afterDelete.length).toBe(beforeCount - 1);
  });

  it("should fail to delete document with wrong office ID", async () => {
    // Create a document
    const doc = await db.createBookingDocument({
      bookingId: testBookingId,
      officeId: testOfficeId,
      fileName: "protected-document.pdf",
      fileUrl: "https://example.com/protected.pdf",
      fileKey: "booking-documents/1/1/protected.pdf",
      uploadedBy: testUserId,
      uploadedByName: "Test User",
    });

    // Try to delete with wrong office ID
    const wrongOfficeId = 999;
    const deleted = await db.deleteBookingDocument(doc.id, wrongOfficeId);
    
    expect(deleted).toBe(false);
  });

  it("should store document metadata correctly", async () => {
    const metadata = {
      bookingId: testBookingId,
      officeId: testOfficeId,
      fileName: "business-license.pdf",
      fileUrl: "https://s3.example.com/documents/license.pdf",
      fileKey: "booking-documents/1/1/1234567890-abc123.pdf",
      fileSize: 2048000,
      mimeType: "application/pdf",
      uploadedBy: testUserId,
      uploadedByName: "Office Manager",
      notes: "Official business license",
      status: "approved" as const,
    };

    const document = await db.createBookingDocument(metadata);

    expect(document).toBeDefined();

    // Retrieve and verify all metadata
    const documents = await db.getBookingDocuments(testBookingId);
    const savedDoc = documents.find(d => d.fileName === "business-license.pdf");

    expect(savedDoc).toBeDefined();
    expect(savedDoc?.fileSize).toBe(metadata.fileSize);
    expect(savedDoc?.mimeType).toBe(metadata.mimeType);
    expect(savedDoc?.notes).toBe(metadata.notes);
    expect(savedDoc?.status).toBe(metadata.status);
  });
});
