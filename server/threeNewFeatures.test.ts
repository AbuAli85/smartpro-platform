/**
 * Tests for Three New Features:
 * 1. Review System UI Components
 * 2. Booking Cancellation Policy
 * 3. Advanced Search Page
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../server/routers";
import * as db from "../server/db";
import type { TrpcContext } from "../server/_core/context";

// Mock context for testing
const mockContext: TrpcContext = {
  user: {
    id: 1,
    openId: "test-user-123",
    name: "Test User",
    email: "test@example.com",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  language: "en",
};

const caller = appRouter.createCaller(mockContext);

describe("Review System", () => {
  let testOfficeId: number;
  let testBookingId: number;
  let testReviewId: number;

  beforeAll(async () => {
    // Create test office
    testOfficeId = await db.createSanadOffice({
      officeName: "Test Review Office",
      slug: "test-review-office-" + Date.now(),
      commercialRegistration: "CR-TEST-REV-" + Date.now(),
      email: "review@test.com",
      phone: "+96812345678",
      governorate: "Muscat",
      wilayat: "Muscat",
      addressLine1: "Test Address",
      ownerId: 1,
      status: "active",
      verificationStatus: "verified",
      createdBy: 1,
    });

    // Create test booking
    testBookingId = await db.createBooking({
      officeId: testOfficeId,
      userId: 1,
      serviceDescription: "Test service for review",
      status: "completed",
      completedDate: new Date(),
    });
  });

  it("should create a review with rating and text", async () => {
    const result = await caller.booking.createReview({
      officeId: testOfficeId,
      bookingId: testBookingId,
      rating: 5,
      reviewText: "Excellent service! Very professional and efficient.",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    testReviewId = result.id;
  });

  it("should retrieve office reviews with vote counts", async () => {
    const reviews = await caller.booking.getOfficeReviews({
      officeId: testOfficeId,
    });

    expect(reviews).toBeDefined();
    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBeGreaterThan(0);

    const review = reviews[0];
    expect(review).toHaveProperty("rating");
    expect(review).toHaveProperty("reviewText");
    expect(review).toHaveProperty("voteCounts");
    expect(review.voteCounts).toHaveProperty("helpful");
    expect(review.voteCounts).toHaveProperty("notHelpful");
  });

  it("should allow voting on reviews", async () => {
    const result = await caller.booking.voteOnReview({
      reviewId: testReviewId,
      voteType: "helpful",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should upload review photos", async () => {
    // Create a simple base64 test image (1x1 red pixel PNG)
    const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

    const result = await caller.booking.uploadReviewPhoto({
      reviewId: testReviewId,
      photoBase64: testImageBase64,
      mimeType: "image/png",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.url).toContain("http");
  });

  it("should prevent duplicate reviews for same booking", async () => {
    await expect(
      caller.booking.createReview({
        officeId: testOfficeId,
        bookingId: testBookingId,
        rating: 4,
        reviewText: "Another review",
      })
    ).rejects.toThrow();
  });

  it("should validate rating range (1-5)", async () => {
    await expect(
      caller.booking.createReview({
        officeId: testOfficeId,
        rating: 6, // Invalid rating
        reviewText: "Test",
      })
    ).rejects.toThrow();
  });
});

describe("Booking Cancellation Policy", () => {
  let testOfficeId: number;

  beforeAll(async () => {
    // Create test office with cancellation policy
    testOfficeId = await db.createSanadOffice({
      officeName: "Test Cancellation Office",
      slug: "test-cancel-office-" + Date.now(),
      commercialRegistration: "CR-TEST-CANCEL-" + Date.now(),
      email: "cancel@test.com",
      phone: "+96812345679",
      governorate: "Muscat",
      wilayat: "Muscat",
      addressLine1: "Test Address",
      ownerId: 1,
      status: "active",
      verificationStatus: "verified",
      cancellationWindowHours: 48,
      cancellationPenaltyPercent: 10,
      createdBy: 1,
    });
  });

  it("should calculate cancellation with penalty", async () => {
    // Create booking for this test
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 72);

    const testBookingId = await db.createBooking({
      officeId: testOfficeId,
      userId: 1,
      serviceDescription: "Test service for cancellation calc",
      status: "confirmed",
      scheduledDate: futureDate,
      price: "100.000",
    });

    const result = await caller.booking.calculateCancellation({
      bookingId: testBookingId,
    });

    expect(result).toBeDefined();
    expect(result.allowed).toBe(true);
    expect(result.refundAmount).toBe(90); // 100 - 10% penalty
    expect(result.penaltyAmount).toBe(10);
    expect(result.penaltyPercent).toBe(10);
  });

  it("should allow cancellation within policy window", async () => {
    // Create booking for this test
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 72);

    const testBookingId = await db.createBooking({
      officeId: testOfficeId,
      userId: 1,
      serviceDescription: "Test service for cancellation",
      status: "confirmed",
      scheduledDate: futureDate,
      price: "100.000",
    });

    const result = await caller.booking.cancelBooking({
      bookingId: testBookingId,
      reason: "Change of plans - need to reschedule for next month",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.message).toContain("cancelled");
  });

  it("should prevent cancellation of already cancelled booking", async () => {
    // Create and cancel a booking
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 72);

    const testBookingId = await db.createBooking({
      officeId: testOfficeId,
      userId: 1,
      serviceDescription: "Test booking to cancel twice",
      status: "confirmed",
      scheduledDate: futureDate,
      price: "100.000",
    });

    // Cancel it first time
    await caller.booking.cancelBooking({
      bookingId: testBookingId,
      reason: "First cancellation",
    });

    // Try to cancel again
    await expect(
      caller.booking.cancelBooking({
        bookingId: testBookingId,
        reason: "Trying to cancel again",
      })
    ).rejects.toThrow();
  });

  it("should reject cancellation too close to appointment", async () => {
    // Create booking scheduled 12 hours in the future (within 48h window)
    const nearFutureDate = new Date();
    nearFutureDate.setHours(nearFutureDate.getHours() + 12);

    const nearBookingId = await db.createBooking({
      officeId: testOfficeId,
      userId: 1,
      serviceDescription: "Test near-future booking",
      status: "confirmed",
      scheduledDate: nearFutureDate,
      price: "50.000",
    });

    const result = await caller.booking.calculateCancellation({
      bookingId: nearBookingId,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("48 hours");
  });

  it("should allow full refund for unscheduled bookings", async () => {
    const unscheduledBookingId = await db.createBooking({
      officeId: testOfficeId,
      userId: 1,
      serviceDescription: "Unscheduled booking",
      status: "confirmed",
      price: "75.000",
    });

    const result = await caller.booking.calculateCancellation({
      bookingId: unscheduledBookingId,
    });

    expect(result.allowed).toBe(true);
    expect(result.refundAmount).toBe(75);
    expect(result.penaltyAmount).toBe(0);
  });
});

describe("Advanced Search", () => {
  let testOfficeId1: number;
  let testOfficeId2: number;

  beforeAll(async () => {
    // Create test offices with different attributes
    testOfficeId1 = await db.createSanadOffice({
      officeName: "Premium Legal Services",
      slug: "premium-legal-" + Date.now(),
      commercialRegistration: "CR-SEARCH-1-" + Date.now(),
      email: "premium@test.com",
      phone: "+96812345680",
      governorate: "Muscat",
      wilayat: "Bousher",
      addressLine1: "Test Address 1",
      ownerId: 1,
      status: "active",
      verificationStatus: "verified",
      averageRating: "4.5",
      totalReviews: 25,
      createdBy: 1,
    });

    testOfficeId2 = await db.createSanadOffice({
      officeName: "Budget Accounting Office",
      slug: "budget-accounting-" + Date.now(),
      commercialRegistration: "CR-SEARCH-2-" + Date.now(),
      email: "budget@test.com",
      phone: "+96812345681",
      governorate: "Dhofar",
      wilayat: "Salalah",
      addressLine1: "Test Address 2",
      ownerId: 1,
      status: "active",
      verificationStatus: "verified",
      averageRating: "3.8",
      totalReviews: 12,
      createdBy: 1,
    });
  });

  it("should list all active offices", async () => {
    const result = await caller.sanadOffice.list({
      page: 1,
      limit: 20,
    });

    expect(result).toBeDefined();
    expect(result.offices).toBeDefined();
    expect(Array.isArray(result.offices)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  });

  it("should filter by governorate", async () => {
    const result = await caller.sanadOffice.list({
      page: 1,
      limit: 20,
      governorate: "Muscat",
    });

    expect(result.offices).toBeDefined();
    const muscatOffices = result.offices.filter(
      (o: any) => o.governorate === "Muscat"
    );
    expect(muscatOffices.length).toBeGreaterThan(0);
  });

  it("should filter by wilayat", async () => {
    const result = await caller.sanadOffice.list({
      page: 1,
      limit: 20,
      governorate: "Muscat",
      wilayat: "Bousher",
    });

    expect(result.offices).toBeDefined();
    const bousherOffices = result.offices.filter(
      (o: any) => o.wilayat === "Bousher"
    );
    expect(bousherOffices.length).toBeGreaterThan(0);
  });

  it("should filter by minimum rating", async () => {
    const result = await caller.sanadOffice.list({
      page: 1,
      limit: 20,
      minRating: 4.0,
    });

    expect(result.offices).toBeDefined();
    result.offices.forEach((office: any) => {
      const rating = parseFloat(office.averageRating || "0");
      expect(rating).toBeGreaterThanOrEqual(4.0);
    });
  });

  it("should search by office name", async () => {
    const result = await caller.sanadOffice.list({
      page: 1,
      limit: 20,
      search: "Legal",
    });

    expect(result.offices).toBeDefined();
    const hasLegalOffice = result.offices.some((o: any) =>
      o.officeName.toLowerCase().includes("legal")
    );
    expect(hasLegalOffice).toBe(true);
  });

  it("should sort by rating (highest first)", async () => {
    const result = await caller.sanadOffice.list({
      page: 1,
      limit: 20,
      sortBy: "rating",
    });

    expect(result.offices).toBeDefined();
    if (result.offices.length > 1) {
      const firstRating = parseFloat(result.offices[0].averageRating || "0");
      const secondRating = parseFloat(result.offices[1].averageRating || "0");
      expect(firstRating).toBeGreaterThanOrEqual(secondRating);
    }
  });

  it("should sort by name (alphabetical)", async () => {
    const result = await caller.sanadOffice.list({
      page: 1,
      limit: 20,
      sortBy: "name",
    });

    expect(result.offices).toBeDefined();
    if (result.offices.length > 1) {
      const firstName = result.offices[0].officeName;
      const secondName = result.offices[1].officeName;
      expect(firstName.localeCompare(secondName)).toBeLessThanOrEqual(0);
    }
  });

  it("should handle pagination correctly", async () => {
    const page1 = await caller.sanadOffice.list({
      page: 1,
      limit: 5,
    });

    const page2 = await caller.sanadOffice.list({
      page: 2,
      limit: 5,
    });

    expect(page1.offices).toBeDefined();
    expect(page2.offices).toBeDefined();
    expect(page1.page).toBe(1);
    expect(page2.page).toBe(2);

    // Ensure different results (if enough data exists)
    if (page1.total > 5) {
      expect(page1.offices[0].id).not.toBe(page2.offices[0].id);
    }
  });

  it("should filter by price range", async () => {
    const result = await caller.sanadOffice.list({
      page: 1,
      limit: 20,
      minPrice: 0,
      maxPrice: 5000,
    });

    expect(result).toBeDefined();
    expect(result.offices).toBeDefined();
  });

  it("should combine multiple filters", async () => {
    const result = await caller.sanadOffice.list({
      page: 1,
      limit: 20,
      governorate: "Muscat",
      minRating: 4.0,
      sortBy: "rating",
    });

    expect(result).toBeDefined();
    expect(result.offices).toBeDefined();

    result.offices.forEach((office: any) => {
      expect(office.governorate).toBe("Muscat");
      const rating = parseFloat(office.averageRating || "0");
      expect(rating).toBeGreaterThanOrEqual(4.0);
    });
  });
});

describe("Integration Tests", () => {
  it("should complete full booking-review-cancellation flow", async () => {
    // 1. Create office
    const officeId = await db.createSanadOffice({
      officeName: "Integration Test Office",
      slug: "integration-test-" + Date.now(),
      commercialRegistration: "CR-INT-" + Date.now(),
      email: "integration@test.com",
      phone: "+96812345682",
      governorate: "Muscat",
      wilayat: "Muscat",
      addressLine1: "Test Address",
      ownerId: 1,
      status: "active",
      verificationStatus: "verified",
      cancellationWindowHours: 24,
      cancellationPenaltyPercent: 5,
      createdBy: 1,
    });

    // 2. Create booking
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 48);

    const bookingId = await db.createBooking({
      officeId,
      userId: 1,
      serviceDescription: "Integration test service",
      status: "confirmed",
      scheduledDate: futureDate,
      price: "200.000",
    });

    // 3. Check cancellation eligibility
    const cancellationInfo = await caller.booking.calculateCancellation({
      bookingId,
    });
    expect(cancellationInfo.allowed).toBe(true);

    // 4. Cancel booking
    const cancelResult = await caller.booking.cancelBooking({
      bookingId,
      reason: "Integration test cancellation",
    });
    expect(cancelResult.success).toBe(true);

    // 5. Update booking to completed for review
    await db.updateBookingStatus(bookingId, "completed");

    // 6. Create review
    const review = await caller.booking.createReview({
      officeId,
      bookingId,
      rating: 5,
      reviewText: "Great service despite cancellation!",
    });
    expect(review.id).toBeGreaterThan(0);

    // 7. Search for the office
    const searchResult = await caller.sanadOffice.list({
      page: 1,
      limit: 20,
      search: "Integration Test",
    });
    expect(searchResult.offices.length).toBeGreaterThan(0);
  });
});
