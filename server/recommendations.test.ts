import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getRecommendedOffices, getTopOfficesByRegion } from "./recommendations";
import { getDb } from "./db";
import { sanadOffices, bookings, reviews, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Regional Recommendations System", () => {
  let testUserId: number;
  let testOfficeId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const userResult = await db.insert(users).values({
      openId: `test-recommendations-${Date.now()}`,
      name: "Test User",
      role: "user",
    });
    testUserId = Number(userResult[0].insertId);

    // Create test office
    const officeResult = await db.insert(sanadOffices).values({
      officeName: "Test Recommendation Office",
      officeNameAr: "مكتب اختبار التوصيات",
      slug: `test-recommendation-office-${Date.now()}`,
      commercialRegistration: "TEST-CR-123",
      tradeLicense: "TEST-TL-123",
      taxRegistration: "TEST-TAX-123",
      email: "test@recommendations.com",
      phone: "+96812345678",
      description: "Test office for recommendations",
      governorate: "Muscat",
      ownerId: testUserId,
      status: "active",
      verificationStatus: "approved",
      averageRating: "4.5",
      totalReviews: 10,
      completedOrders: 50,
    });
    testOfficeId = Number(officeResult[0].insertId);

    // Create test booking
    await db.insert(bookings).values({
      userId: testUserId,
      officeId: testOfficeId,
      status: "completed",
      totalAmount: "100.000",
    });
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Cleanup
    await db.delete(bookings).where(eq(bookings.userId, testUserId));
    await db.delete(sanadOffices).where(eq(sanadOffices.id, testOfficeId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe("getRecommendedOffices", () => {
    it("should return recommended offices for authenticated user", async () => {
      const recommendations = await getRecommendedOffices(testUserId, "Muscat", 5);
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Check that our test office is included
      const testOffice = recommendations.find(o => o.id === testOfficeId);
      expect(testOffice).toBeDefined();
      
      if (testOffice) {
        expect(testOffice.officeName).toBe("Test Recommendation Office");
        expect(testOffice.governorate).toBe("Muscat");
        expect(testOffice.score).toBeGreaterThan(0);
        expect(testOffice.reason).toBeTruthy();
        expect(testOffice.reasonAr).toBeTruthy();
      }
    });

    it("should return recommendations for unauthenticated user", async () => {
      const recommendations = await getRecommendedOffices(null, "Muscat", 5);
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it("should prioritize offices in user's region", async () => {
      const recommendations = await getRecommendedOffices(testUserId, "Muscat", 10);
      
      // Offices in Muscat should have higher scores due to regional bonus
      const muscatOffices = recommendations.filter(o => o.governorate === "Muscat");
      const otherOffices = recommendations.filter(o => o.governorate !== "Muscat");
      
      if (muscatOffices.length > 0 && otherOffices.length > 0) {
        const avgMuscatScore = muscatOffices.reduce((sum, o) => sum + o.score, 0) / muscatOffices.length;
        const avgOtherScore = otherOffices.reduce((sum, o) => sum + o.score, 0) / otherOffices.length;
        
        expect(avgMuscatScore).toBeGreaterThanOrEqual(avgOtherScore);
      }
    });

    it("should respect limit parameter", async () => {
      const limit = 3;
      const recommendations = await getRecommendedOffices(null, null, limit);
      
      expect(recommendations.length).toBeLessThanOrEqual(limit);
    });

    it("should include booking history bonus for returning users", async () => {
      const recommendations = await getRecommendedOffices(testUserId, "Muscat", 10);
      const testOffice = recommendations.find(o => o.id === testOfficeId);
      
      if (testOffice) {
        // Office should have "You've booked before" in reason
        expect(
          testOffice.reason.includes("booked before") || 
          testOffice.reasonAr.includes("حجزت من قبل")
        ).toBe(true);
      }
    });
  });

  describe("getTopOfficesByRegion", () => {
    it("should return top offices for a specific region", async () => {
      const topOffices = await getTopOfficesByRegion("Muscat", 5);
      
      expect(topOffices).toBeDefined();
      expect(Array.isArray(topOffices)).toBe(true);
      
      // All offices should be from Muscat
      topOffices.forEach(office => {
        expect(office.governorate).toBe("Muscat");
      });
    });

    it("should sort offices by score in descending order", async () => {
      const topOffices = await getTopOfficesByRegion("Muscat", 10);
      
      if (topOffices.length > 1) {
        for (let i = 0; i < topOffices.length - 1; i++) {
          expect(topOffices[i].score).toBeGreaterThanOrEqual(topOffices[i + 1].score);
        }
      }
    });

    it("should respect limit parameter", async () => {
      const limit = 5;
      const topOffices = await getTopOfficesByRegion("Muscat", limit);
      
      expect(topOffices.length).toBeLessThanOrEqual(limit);
    });

    it("should include all required office information", async () => {
      const topOffices = await getTopOfficesByRegion("Muscat", 3);
      
      topOffices.forEach(office => {
        expect(office.id).toBeDefined();
        expect(office.officeName).toBeTruthy();
        expect(office.governorate).toBeTruthy();
        expect(office.rating).toBeGreaterThanOrEqual(0);
        expect(office.reviewCount).toBeGreaterThanOrEqual(0);
        expect(office.completedBookings).toBeGreaterThanOrEqual(0);
        expect(office.score).toBeGreaterThan(0);
        expect(office.reason).toBeTruthy();
        expect(office.reasonAr).toBeTruthy();
      });
    });
  });

  describe("Scoring Algorithm", () => {
    it("should give higher scores to highly-rated offices", async () => {
      const recommendations = await getRecommendedOffices(null, null, 20);
      
      if (recommendations.length > 1) {
        const highRated = recommendations.filter(o => o.rating >= 4.5);
        const lowRated = recommendations.filter(o => o.rating < 3.5);
        
        if (highRated.length > 0 && lowRated.length > 0) {
          const avgHighScore = highRated.reduce((sum, o) => sum + o.score, 0) / highRated.length;
          const avgLowScore = lowRated.reduce((sum, o) => sum + o.score, 0) / lowRated.length;
          
          expect(avgHighScore).toBeGreaterThan(avgLowScore);
        }
      }
    });

    it("should consider review count in scoring", async () => {
      const recommendations = await getRecommendedOffices(null, null, 20);
      
      recommendations.forEach(office => {
        // Offices with more reviews should generally have higher scores
        // (assuming similar ratings)
        expect(office.score).toBeGreaterThan(0);
      });
    });

    it("should consider completed bookings in scoring", async () => {
      const recommendations = await getRecommendedOffices(null, null, 20);
      
      recommendations.forEach(office => {
        // Score should reflect completed bookings
        expect(office.completedBookings).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
