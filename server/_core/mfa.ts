import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";

/**
 * Multi-Factor Authentication (MFA) Helper
 * Provides TOTP-based 2FA functionality using speakeasy
 */

export interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

/**
 * Generate a new MFA secret and QR code for user setup
 */
export async function generateMFASecret(
  userEmail: string,
  appName: string = "SmartPro Platform"
): Promise<MFASetup> {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `${appName} (${userEmail})`,
    length: 32,
  });

  if (!secret.otpauth_url) {
    throw new Error("Failed to generate OTP auth URL");
  }

  // Generate QR code as data URL
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  // Generate backup codes
  const backupCodes = generateBackupCodes(10);

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes,
  };
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyMFAToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2, // Allow 2 time steps before/after for clock skew
  });
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()
      .match(/.{1,4}/g)
      ?.join("-") || "";
    
    codes.push(code);
  }
  
  return codes;
}

/**
 * Hash a backup code for secure storage
 */
export function hashBackupCode(code: string): string {
  return crypto
    .createHash("sha256")
    .update(code.replace(/-/g, "")) // Remove dashes before hashing
    .digest("hex");
}

/**
 * Verify a backup code against stored hashed codes
 */
export function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): boolean {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.includes(hashedInput);
}

/**
 * Remove a used backup code from the list
 */
export function removeUsedBackupCode(
  code: string,
  hashedCodes: string[]
): string[] {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.filter((c) => c !== hashedInput);
}
