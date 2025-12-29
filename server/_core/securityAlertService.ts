import * as db from "../db";
import { notifyOwner } from "./notification";
import { lookupIPLocation, isSuspiciousLocationChange, type LocationData } from "./ipGeolocation";

/**
 * Security Alert Service
 * 
 * Detects and creates security alerts for suspicious activity
 */

export interface AlertContext {
  userId?: number;
  openId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: LocationData | null;
  metadata?: Record<string, any>;
}

/**
 * Create a security alert and optionally notify admins
 */
async function createAlert(
  alertType: string,
  severity: "low" | "medium" | "high" | "critical",
  title: string,
  description: string,
  context: AlertContext,
  notifyAdmin: boolean = true
): Promise<number> {
  const alertId = await db.createSecurityAlert({
    alertType: alertType as any,
    severity,
    status: "new",
    userId: context.userId,
    openId: context.openId,
    sessionId: context.sessionId,
    title,
    description,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    location: context.location || undefined,
    metadata: context.metadata,
    notificationSent: false,
  });

  // Send notification to owner if enabled
  if (notifyAdmin) {
    try {
      await notifyOwner({
        title: `🚨 Security Alert: ${title}`,
        content: `${description}\n\nSeverity: ${severity.toUpperCase()}\nAlert ID: ${alertId}`,
      });
      
      await db.markSecurityAlertNotificationSent(alertId);
    } catch (error) {
      console.error("[Security Alerts] Failed to send notification:", error);
    }
  }

  return alertId;
}

/**
 * Check for multiple failed login attempts
 */
export async function checkFailedLoginAttempts(
  openId: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  // Get recent failed login attempts (last 15 minutes)
  const recentFailures = await db.getRecentAuthEvents({
    openId,
    eventType: "login_failure",
    since: new Date(Date.now() - 15 * 60 * 1000),
  });

  if (recentFailures.length >= 5) {
    const location = lookupIPLocation(ipAddress);
    
    await createAlert(
      "multiple_failed_logins",
      "high",
      "Multiple Failed Login Attempts",
      `${recentFailures.length} failed login attempts detected for user ${openId} in the last 15 minutes.`,
      {
        openId,
        ipAddress,
        userAgent,
        location,
        metadata: {
          failedAttempts: recentFailures.length,
          timeWindow: "15 minutes",
        },
      },
      true
    );
  }
}

/**
 * Check for suspicious location changes
 */
export async function checkSuspiciousLocation(
  userId: number,
  openId: string,
  currentIpAddress: string,
  sessionId: string,
  userAgent?: string
): Promise<void> {
  // Get previous session for this user
  const sessions = await db.getActiveSessions(userId);
  if (sessions.length <= 1) {
    // First session, no comparison needed
    return;
  }

  // Find most recent previous session (excluding current one)
  const previousSession = sessions
    .filter((s) => s.sessionId !== sessionId)
    .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())[0];

  if (!previousSession || !previousSession.location) {
    return;
  }

  const currentLocation = lookupIPLocation(currentIpAddress);
  if (!currentLocation) {
    return;
  }

  const timeDifference = Math.floor(
    (Date.now() - new Date(previousSession.lastActive).getTime()) / 1000 / 60
  ); // minutes

  const suspiciousCheck = isSuspiciousLocationChange(
    previousSession.location as LocationData,
    currentLocation,
    timeDifference
  );

  if (suspiciousCheck.suspicious) {
    let alertType: string;
    let severity: "low" | "medium" | "high" | "critical";
    let title: string;

    if (suspiciousCheck.reason?.includes("Impossible travel")) {
      alertType = "impossible_travel";
      severity = "critical";
      title = "Impossible Travel Detected";
    } else if (suspiciousCheck.reason?.includes("Very fast travel")) {
      alertType = "fast_travel";
      severity = "high";
      title = "Very Fast Travel Detected";
    } else {
      alertType = "country_change";
      severity = "medium";
      title = "Suspicious Country Change";
    }

    await createAlert(
      alertType,
      severity,
      title,
      `User ${openId} logged in from ${currentLocation.formatted} shortly after being in ${(previousSession.location as LocationData).formatted}. ${suspiciousCheck.reason}`,
      {
        userId,
        openId,
        sessionId,
        ipAddress: currentIpAddress,
        userAgent,
        location: currentLocation,
        metadata: {
          previousLocation: previousSession.location,
          currentLocation,
          timeDifference,
          reason: suspiciousCheck.reason,
        },
      },
      true
    );
  }
}

/**
 * Check for MFA failures
 */
export async function checkMFAFailures(
  userId: number,
  openId: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  // Get recent MFA failure events (last 30 minutes)
  const recentFailures = await db.getRecentAuthEvents({
    userId,
    eventType: "mfa_verification_failed",
    since: new Date(Date.now() - 30 * 60 * 1000),
  });

  if (recentFailures.length >= 3) {
    const location = lookupIPLocation(ipAddress);
    
    await createAlert(
      "mfa_failure",
      "high",
      "Multiple MFA Verification Failures",
      `${recentFailures.length} MFA verification failures detected for user ${openId} in the last 30 minutes.`,
      {
        userId,
        openId,
        ipAddress,
        userAgent,
        location,
        metadata: {
          failedAttempts: recentFailures.length,
          timeWindow: "30 minutes",
        },
      },
      true
    );
  }
}

/**
 * Check for password reset abuse
 */
export async function checkPasswordResetAbuse(
  email: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  // Get recent password reset requests (last hour)
  const recentResets = await db.getRecentAuthEvents({
    eventType: "password_reset_requested",
    since: new Date(Date.now() - 60 * 60 * 1000),
    metadata: { email },
  });

  if (recentResets.length >= 5) {
    const location = lookupIPLocation(ipAddress);
    
    await createAlert(
      "password_reset_abuse",
      "medium",
      "Excessive Password Reset Requests",
      `${recentResets.length} password reset requests detected for ${email} in the last hour.`,
      {
        ipAddress,
        userAgent,
        location,
        metadata: {
          email,
          resetAttempts: recentResets.length,
          timeWindow: "1 hour",
        },
      },
      true
    );
  }
}

/**
 * Check for brute force attempts
 */
export async function checkBruteForceAttempt(
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  // Get all failed login attempts from this IP (last 10 minutes)
  const recentFailures = await db.getRecentAuthEvents({
    eventType: "login_failure",
    since: new Date(Date.now() - 10 * 60 * 1000),
    ipAddress,
  });

  if (recentFailures.length >= 10) {
    const location = lookupIPLocation(ipAddress);
    
    await createAlert(
      "brute_force_attempt",
      "critical",
      "Brute Force Attack Detected",
      `${recentFailures.length} failed login attempts detected from IP ${ipAddress} in the last 10 minutes.`,
      {
        ipAddress,
        userAgent,
        location,
        metadata: {
          failedAttempts: recentFailures.length,
          timeWindow: "10 minutes",
          uniqueAccounts: new Set(recentFailures.map((f) => f.openId).filter(Boolean)).size,
        },
      },
      true
    );
  }
}
