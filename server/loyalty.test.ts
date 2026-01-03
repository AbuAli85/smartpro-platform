import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Loyalty Program", () => {
  let testUserId: number = 1; // Assuming user ID 1 exists

  it("should create loyalty account if it doesn't exist", async () => {
    const loyalty = await db.getUserLoyalty(testUserId);
    
    expect(loyalty).toBeDefined();
    expect(loyalty).toHaveProperty("userId");
    expect(loyalty).toHaveProperty("totalPoints");
    expect(loyalty).toHaveProperty("availablePoints");
    expect(loyalty).toHaveProperty("redeemedPoints");
  });

  it("should award points to user", async () => {
    const initialLoyalty = await db.getUserLoyalty(testUserId);
    const initialPoints = initialLoyalty?.availablePoints || 0;

    const result = await db.awardPoints({
      userId: testUserId,
      points: 10,
      reason: "Test booking completion",
    });

    expect(result).toBe(true);

    const updatedLoyalty = await db.getUserLoyalty(testUserId);
    expect(updatedLoyalty?.availablePoints).toBe(initialPoints + 10);
  });

  it("should fetch loyalty transactions", async () => {
    const transactions = await db.getLoyaltyTransactions(testUserId, 10);
    
    expect(Array.isArray(transactions)).toBe(true);
    
    if (transactions.length > 0) {
      const transaction = transactions[0];
      expect(transaction).toHaveProperty("id");
      expect(transaction).toHaveProperty("userId");
      expect(transaction).toHaveProperty("type");
      expect(transaction).toHaveProperty("points");
      expect(transaction).toHaveProperty("reason");
    }
  });

  it("should redeem points successfully", async () => {
    // First ensure user has enough points
    await db.awardPoints({
      userId: testUserId,
      points: 100,
      reason: "Test points for redemption",
    });

    const beforeRedemption = await db.getUserLoyalty(testUserId);
    const availablePoints = beforeRedemption?.availablePoints || 0;

    if (availablePoints >= 100) {
      const result = await db.redeemPoints({
        userId: testUserId,
        points: 100,
        reason: "Test redemption for 5 OMR discount",
      });

      expect(result).toBe(true);

      const afterRedemption = await db.getUserLoyalty(testUserId);
      expect(afterRedemption?.availablePoints).toBe(availablePoints - 100);
      expect(afterRedemption?.redeemedPoints).toBe((beforeRedemption?.redeemedPoints || 0) + 100);
    }
  });

  it("should fail to redeem points if insufficient balance", async () => {
    const loyalty = await db.getUserLoyalty(testUserId);
    const availablePoints = loyalty?.availablePoints || 0;

    // Try to redeem more points than available
    const excessivePoints = availablePoints + 1000;

    await expect(
      db.redeemPoints({
        userId: testUserId,
        points: excessivePoints,
        reason: "Test excessive redemption",
      })
    ).rejects.toThrow("Insufficient points");
  });
});
