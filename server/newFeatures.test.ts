import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Referral System", () => {
  let testUserId: number;
  let referralCode: string;
  const referrerOpenId = `test-referrer-${Date.now()}`;

  beforeAll(async () => {
    // Create a test user
    await db.upsertUser({
      openId: referrerOpenId,
      name: "Test Referrer",
      email: `referrer-${Date.now()}@test.com`,
    });
    const user = await db.getUserByOpenId(referrerOpenId);
    testUserId = user!.id;
  });

  it("should generate unique referral code for user", async () => {
    referralCode = await db.getUserReferralCode(testUserId);
    
    expect(referralCode).toBeDefined();
    expect(referralCode.length).toBe(8);
    expect(referralCode).toMatch(/^[A-Z0-9]+$/);
  });

  it("should return same referral code on subsequent calls", async () => {
    const code1 = await db.getUserReferralCode(testUserId);
    const code2 = await db.getUserReferralCode(testUserId);
    
    expect(code1).toBe(code2);
  });

  it("should get referral stats for user", async () => {
    const stats = await db.getReferralStats(testUserId);
    
    expect(stats).toBeDefined();
    expect(stats.totalReferrals).toBeGreaterThanOrEqual(0);
    expect(stats.successfulReferrals).toBeGreaterThanOrEqual(0);
    expect(stats.pendingReferrals).toBeGreaterThanOrEqual(0);
    expect(stats.pointsEarned).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(stats.referrals)).toBe(true);
  });

  it("should track referral when new user signs up", async () => {
    // Create referred user
    const referredOpenId = `test-referred-${Date.now()}`;
    await db.upsertUser({
      openId: referredOpenId,
      name: "Test Referred",
      email: `referred-${Date.now()}@test.com`,
    });
    const referredUser = await db.getUserByOpenId(referredOpenId);
    
    const success = await db.trackReferral(referralCode, referredUser!.id);
    expect(success).toBe(true);
    
    // Verify stats updated
    const stats = await db.getReferralStats(testUserId);
    expect(stats.totalReferrals).toBeGreaterThan(0);
  });
});

describe("Points Redemption", () => {
  let testUserId: number;
  const pointsUserOpenId = `test-points-user-${Date.now()}`;

  beforeAll(async () => {
    await db.upsertUser({
      openId: pointsUserOpenId,
      name: "Test Points User",
      email: `points-${Date.now()}@test.com`,
    });
    const user = await db.getUserByOpenId(pointsUserOpenId);
    testUserId = user!.id;
  });

  it("should award points to user", async () => {
    const initialLoyalty = await db.getUserLoyalty(testUserId);
    const initialPoints = initialLoyalty.availablePoints;

    await db.awardPoints({
      userId: testUserId,
      points: 100,
      reason: "Test points award",
    });

    const updatedLoyalty = await db.getUserLoyalty(testUserId);
    expect(updatedLoyalty.availablePoints).toBe(initialPoints + 100);
    expect(updatedLoyalty.totalPoints).toBe(initialLoyalty.totalPoints + 100);
  });

  it("should redeem points successfully when sufficient balance", async () => {
    const loyalty = await db.getUserLoyalty(testUserId);
    
    if (loyalty.availablePoints < 100) {
      await db.awardPoints({
        userId: testUserId,
        points: 100,
        reason: "Ensure sufficient balance",
      });
    }

    const beforeRedemption = await db.getUserLoyalty(testUserId);
    
    await db.redeemPoints({
      userId: testUserId,
      points: 100,
      reason: "Test redemption",
    });

    const afterRedemption = await db.getUserLoyalty(testUserId);
    expect(afterRedemption.availablePoints).toBe(beforeRedemption.availablePoints - 100);
    expect(afterRedemption.redeemedPoints).toBe(beforeRedemption.redeemedPoints + 100);
  });

  it("should fail to redeem points when insufficient balance", async () => {
    const loyalty = await db.getUserLoyalty(testUserId);
    const excessivePoints = loyalty.availablePoints + 1000;

    await expect(
      db.redeemPoints({
        userId: testUserId,
        points: excessivePoints,
        reason: "Test insufficient balance",
      })
    ).rejects.toThrow("Insufficient points");
  });

  it("should track loyalty transactions", async () => {
    const transactions = await db.getLoyaltyTransactions(testUserId, 10);
    
    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBeGreaterThan(0);
    
    const earnTransaction = transactions.find(t => t.type === "earn");
    const redeemTransaction = transactions.find(t => t.type === "redeem");
    
    expect(earnTransaction).toBeDefined();
    expect(redeemTransaction).toBeDefined();
  });
});

describe("Notification System", () => {
  let testUserId: number;
  const notifUserOpenId = `test-notif-user-${Date.now()}`;

  beforeAll(async () => {
    await db.upsertUser({
      openId: notifUserOpenId,
      name: "Test Notification User",
      email: `notif-${Date.now()}@test.com`,
    });
    const user = await db.getUserByOpenId(notifUserOpenId);
    testUserId = user!.id;
  });

  it("should create notification for user", async () => {
    await db.createNotification({
      userId: testUserId,
      type: "system",
      title: "Test Notification",
      message: "This is a test notification",
    });

    const notifications = await db.getUserNotifications(testUserId, 10);
    expect(notifications.length).toBeGreaterThan(0);
    
    const testNotif = notifications.find(n => n.title === "Test Notification");
    expect(testNotif).toBeDefined();
    expect(testNotif!.isRead).toBe(false);
  });

  it("should get unread notifications", async () => {
    const unreadNotifications = await db.getUnreadNotifications(testUserId);
    
    expect(Array.isArray(unreadNotifications)).toBe(true);
    unreadNotifications.forEach(notif => {
      expect(notif.isRead).toBe(false);
    });
  });

  it("should get unread notification count", async () => {
    const count = await db.getUnreadNotificationCount(testUserId);
    
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("should mark notification as read", async () => {
    const unreadNotifications = await db.getUnreadNotifications(testUserId);
    
    if (unreadNotifications.length > 0) {
      const notificationId = unreadNotifications[0].id;
      
      await db.markNotificationAsRead(notificationId);
      
      const allNotifications = await db.getUserNotifications(testUserId, 50);
      const markedNotif = allNotifications.find(n => n.id === notificationId);
      
      expect(markedNotif!.isRead).toBe(true);
      expect(markedNotif!.readAt).toBeDefined();
    }
  });

  it("should mark all notifications as read", async () => {
    // Create multiple unread notifications
    await db.createNotification({
      userId: testUserId,
      type: "system",
      title: "Test Notification 1",
      message: "Test message 1",
    });
    await db.createNotification({
      userId: testUserId,
      type: "system",
      title: "Test Notification 2",
      message: "Test message 2",
    });

    await db.markAllNotificationsAsRead(testUserId);

    const unreadCount = await db.getUnreadNotificationCount(testUserId);
    expect(unreadCount).toBe(0);
  });

  it("should create notifications for different types", async () => {
    const types: Array<"booking" | "points" | "system" | "review" | "referral"> = [
      "booking",
      "points",
      "review",
      "referral",
    ];

    for (const type of types) {
      await db.createNotification({
        userId: testUserId,
        type,
        title: `Test ${type} notification`,
        message: `This is a ${type} notification`,
      });
    }

    const notifications = await db.getUserNotifications(testUserId, 50);
    
    types.forEach(type => {
      const typeNotif = notifications.find(n => n.type === type);
      expect(typeNotif).toBeDefined();
    });
  });
});

describe("Integration: Referral + Points + Notifications", () => {
  it("should award points and create notification when referral is completed", async () => {
    // Create referrer
    const referrerOpenId = `test-integration-referrer-${Date.now()}`;
    await db.upsertUser({
      openId: referrerOpenId,
      name: "Integration Referrer",
      email: `int-referrer-${Date.now()}@test.com`,
    });
    const referrer = await db.getUserByOpenId(referrerOpenId);
    
    // Get referral code
    const referralCode = await db.getUserReferralCode(referrer!.id);
    
    // Create referred user
    const referredOpenId = `test-integration-referred-${Date.now()}`;
    await db.upsertUser({
      openId: referredOpenId,
      name: "Integration Referred",
      email: `int-referred-${Date.now()}@test.com`,
    });
    const referred = await db.getUserByOpenId(referredOpenId);
    
    // Track referral
    await db.trackReferral(referralCode, referred!.id);
    
    // Get initial points
    const initialLoyalty = await db.getUserLoyalty(referrer!.id);
    const initialPoints = initialLoyalty.availablePoints;
    
    // Complete referral (simulating first booking)
    const bookingId = 99999; // Mock booking ID
    const completed = await db.completeReferral(referred!.id, bookingId);
    
    expect(completed).toBe(true);
    
    // Verify points awarded
    const updatedLoyalty = await db.getUserLoyalty(referrer!.id);
    expect(updatedLoyalty.availablePoints).toBe(initialPoints + 25);
    
    // Verify notification created
    const notifications = await db.getUserNotifications(referrer!.id, 10);
    const referralNotif = notifications.find(n => n.type === "referral");
    expect(referralNotif).toBeDefined();
    expect(referralNotif!.title).toContain("Referral");
  });
});
