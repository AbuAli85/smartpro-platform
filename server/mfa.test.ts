import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";
import * as mfa from "./_core/mfa";

/**
 * Multi-Factor Authentication Tests
 * 
 * Tests the MFA system including:
 * - Secret generation
 * - Token verification
 * - Backup codes
 * - Enable/disable flow
 */

describe("MFA System", () => {
  let testUser: User;
  let testContext: TrpcContext;

  beforeAll(async () => {
    testUser = {
      id: 997,
      openId: "test-mfa-user-openid",
      name: "Test MFA User",
      email: "mfa@test.com",
      phone: null,
      loginMethod: "email",
      role: "user",
      avatarUrl: null,
      preferredLanguage: "en",
      notificationPreferences: null,
      whatsappEnabled: false,
      referralCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    testContext = {
      req: {} as any,
      res: {} as any,
      user: testUser,
      language: "en",
    };
  });

  describe("MFA Helper Functions", () => {
    it("should generate MFA secret and QR code", async () => {
      const setup = await mfa.generateMFASecret("test@example.com");

      expect(setup).toHaveProperty("secret");
      expect(setup).toHaveProperty("qrCodeUrl");
      expect(setup).toHaveProperty("backupCodes");
      
      expect(setup.secret).toBeTruthy();
      expect(setup.qrCodeUrl).toContain("data:image/png;base64");
      expect(setup.backupCodes).toHaveLength(10);
    });

    it("should generate valid backup codes", () => {
      const codes = mfa.generateBackupCodes(10);
      
      expect(codes).toHaveLength(10);
      codes.forEach(code => {
        expect(code).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
      });
    });

    it("should hash backup codes consistently", () => {
      const code = "ABCD-1234";
      const hash1 = mfa.hashBackupCode(code);
      const hash2 = mfa.hashBackupCode(code);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex
    });

    it("should verify backup codes correctly", () => {
      const code = "ABCD-1234";
      const hashedCode = mfa.hashBackupCode(code);
      
      expect(mfa.verifyBackupCode(code, [hashedCode])).toBe(true);
      expect(mfa.verifyBackupCode("WRONG-CODE", [hashedCode])).toBe(false);
    });

    it("should remove used backup codes", () => {
      const codes = ["ABCD-1234", "EFGH-5678"];
      const hashedCodes = codes.map(c => mfa.hashBackupCode(c));
      
      const remaining = mfa.removeUsedBackupCode(codes[0], hashedCodes);
      
      expect(remaining).toHaveLength(1);
      expect(mfa.verifyBackupCode(codes[0], remaining)).toBe(false);
      expect(mfa.verifyBackupCode(codes[1], remaining)).toBe(true);
    });
  });

  describe("MFA Setup Flow", () => {
    let generatedSecret: string;
    let generatedBackupCodes: string[];

    it("should allow users to generate MFA setup", async () => {
      const caller = appRouter.createCaller(testContext);
      
      const setup = await caller.mfa.generateSetup();
      
      expect(setup).toHaveProperty("qrCodeUrl");
      expect(setup).toHaveProperty("secret");
      expect(setup).toHaveProperty("backupCodes");
      
      generatedSecret = setup.secret;
      generatedBackupCodes = setup.backupCodes;
    });

    it("should verify TOTP tokens", () => {
      // Generate a valid token for the current time
      const speakeasy = require("speakeasy");
      const token = speakeasy.totp({
        secret: generatedSecret,
        encoding: "base32",
      });
      
      const isValid = mfa.verifyMFAToken(token, generatedSecret);
      expect(isValid).toBe(true);
    });

    it("should reject invalid TOTP tokens", () => {
      const isValid = mfa.verifyMFAToken("000000", generatedSecret);
      expect(isValid).toBe(false);
    });
  });

  describe("MFA Status", () => {
    it("should return MFA status for user", async () => {
      const caller = appRouter.createCaller(testContext);
      
      const status = await caller.mfa.getStatus();
      
      expect(status).toHaveProperty("enabled");
      expect(status).toHaveProperty("enabledAt");
      expect(status).toHaveProperty("backupCodesCount");
      expect(typeof status.enabled).toBe("boolean");
    });
  });

  describe("MFA Verification", () => {
    it("should fail verification when MFA is not enabled", async () => {
      const caller = appRouter.createCaller(testContext);
      
      await expect(
        caller.mfa.verify({ token: "123456" })
      ).rejects.toThrow();
    });
  });

  describe("Backup Code Management", () => {
    it("should hash backup codes before storage", () => {
      const codes = mfa.generateBackupCodes(5);
      const hashedCodes = codes.map(code => mfa.hashBackupCode(code));
      
      // Hashed codes should be different from original
      hashedCodes.forEach((hashed, index) => {
        expect(hashed).not.toBe(codes[index]);
        expect(hashed).toHaveLength(64);
      });
    });

    it("should verify backup codes against hashed storage", () => {
      const originalCodes = mfa.generateBackupCodes(3);
      const hashedCodes = originalCodes.map(code => mfa.hashBackupCode(code));
      
      // Should verify correctly
      expect(mfa.verifyBackupCode(originalCodes[0], hashedCodes)).toBe(true);
      expect(mfa.verifyBackupCode(originalCodes[1], hashedCodes)).toBe(true);
      expect(mfa.verifyBackupCode(originalCodes[2], hashedCodes)).toBe(true);
      
      // Should reject wrong codes
      expect(mfa.verifyBackupCode("WRONG-CODE", hashedCodes)).toBe(false);
    });

    it("should handle backup code removal correctly", () => {
      const codes = mfa.generateBackupCodes(5);
      const hashedCodes = codes.map(code => mfa.hashBackupCode(code));
      
      // Use first code
      const remaining = mfa.removeUsedBackupCode(codes[0], hashedCodes);
      
      expect(remaining).toHaveLength(4);
      expect(mfa.verifyBackupCode(codes[0], remaining)).toBe(false);
      expect(mfa.verifyBackupCode(codes[1], remaining)).toBe(true);
    });
  });

  describe("Security Considerations", () => {
    it("should generate unique secrets each time", async () => {
      const setup1 = await mfa.generateMFASecret("test@example.com");
      const setup2 = await mfa.generateMFASecret("test@example.com");
      
      expect(setup1.secret).not.toBe(setup2.secret);
    });

    it("should generate unique backup codes each time", () => {
      const codes1 = mfa.generateBackupCodes(10);
      const codes2 = mfa.generateBackupCodes(10);
      
      // Should not have any duplicates between sets
      const intersection = codes1.filter(c => codes2.includes(c));
      expect(intersection).toHaveLength(0);
    });

    it("should not have duplicate codes within a set", () => {
      const codes = mfa.generateBackupCodes(10);
      const uniqueCodes = [...new Set(codes)];
      
      expect(uniqueCodes).toHaveLength(codes.length);
    });
  });
});
