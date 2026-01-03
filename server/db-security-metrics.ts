import { getDb } from "./db";
import { users, authAuditLog, activeSessions } from "../drizzle/schema";
import { sql, and, eq, gte, desc, count } from "drizzle-orm";

/**
 * Security Metrics Database Functions
 * 
 * Provides aggregated security statistics for the admin dashboard
 */

/**
 * Get MFA enrollment statistics
 */
export async function getMFAStats(): Promise<{
  totalUsers: number;
  mfaEnabled: number;
  mfaDisabled: number;
  enrollmentRate: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [totalUsersResult] = await db
    .select({ count: count() })
    .from(users);

  const [mfaEnabledResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.mfaEnabled, true));

  const totalUsers = totalUsersResult?.count || 0;
  const mfaEnabled = mfaEnabledResult?.count || 0;
  const mfaDisabled = totalUsers - mfaEnabled;
  const enrollmentRate = totalUsers > 0 ? (mfaEnabled / totalUsers) * 100 : 0;

  return {
    totalUsers,
    mfaEnabled,
    mfaDisabled,
    enrollmentRate: Math.round(enrollmentRate * 100) / 100,
  };
}

/**
 * Get recent MFA enrollments
 */
export async function getRecentMFAEnrollments(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select({
      id: authAuditLog.id,
      userId: authAuditLog.userId,
      openId: authAuditLog.openId,
      timestamp: authAuditLog.createdAt,
      ipAddress: authAuditLog.ipAddress,
      userAgent: authAuditLog.userAgent,
    })
    .from(authAuditLog)
    .where(eq(authAuditLog.eventType, "mfa_enabled"))
    .orderBy(desc(authAuditLog.createdAt))
    .limit(limit);
}

/**
 * Get password reset statistics
 */
export async function getPasswordResetStats(days: number = 30): Promise<{
  totalRequests: number;
  completedResets: number;
  completionRate: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [requestsResult] = await db
    .select({ count: count() })
    .from(authAuditLog)
    .where(
      and(
        eq(authAuditLog.eventType, "password_reset_requested"),
        gte(authAuditLog.createdAt, since.toISOString())
      )
    );

  const [completedResult] = await db
    .select({ count: count() })
    .from(authAuditLog)
    .where(
      and(
        eq(authAuditLog.eventType, "password_reset_completed"),
        gte(authAuditLog.createdAt, since.toISOString())
      )
    );

  const totalRequests = requestsResult?.count || 0;
  const completedResets = completedResult?.count || 0;
  const completionRate = totalRequests > 0 ? (completedResets / totalRequests) * 100 : 0;

  return {
    totalRequests,
    completedResets,
    completionRate: Math.round(completionRate * 100) / 100,
  };
}

/**
 * Get recent password reset requests
 */
export async function getRecentPasswordResets(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select({
      id: authAuditLog.id,
      userId: authAuditLog.userId,
      openId: authAuditLog.openId,
      eventType: authAuditLog.eventType,
      timestamp: authAuditLog.createdAt,
      ipAddress: authAuditLog.ipAddress,
      success: authAuditLog.success,
    })
    .from(authAuditLog)
    .where(
      sql`${authAuditLog.eventType} IN ('password_reset_requested', 'password_reset_completed')`
    )
    .orderBy(desc(authAuditLog.createdAt))
    .limit(limit);
}

/**
 * Get suspicious activity (failed logins, permission denied, etc.)
 */
export async function getSuspiciousActivity(limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select({
      id: authAuditLog.id,
      userId: authAuditLog.userId,
      openId: authAuditLog.openId,
      eventType: authAuditLog.eventType,
      timestamp: authAuditLog.createdAt,
      ipAddress: authAuditLog.ipAddress,
      userAgent: authAuditLog.userAgent,
      severity: authAuditLog.severity,
      metadata: authAuditLog.metadata,
    })
    .from(authAuditLog)
    .where(
      sql`${authAuditLog.eventType} IN ('login_failure', 'permission_denied', 'mfa_failed', 'account_locked') OR ${authAuditLog.severity} IN ('warning', 'critical')`
    )
    .orderBy(desc(authAuditLog.createdAt))
    .limit(limit);
}

/**
 * Get active sessions statistics
 */
export async function getActiveSessionsStats(): Promise<{
  totalActiveSessions: number;
  uniqueUsers: number;
  mobileDevices: number;
  desktopDevices: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [totalResult] = await db
    .select({ count: count() })
    .from(activeSessions);

  const [uniqueUsersResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${activeSessions.userId})` })
    .from(activeSessions);

  const [mobileResult] = await db
    .select({ count: count() })
    .from(activeSessions)
    .where(sql`JSON_EXTRACT(${activeSessions.deviceInfo}, '$.isMobile') = true`);

  const totalActiveSessions = totalResult?.count || 0;
  const uniqueUsers = Number(uniqueUsersResult?.count) || 0;
  const mobileDevices = mobileResult?.count || 0;
  const desktopDevices = totalActiveSessions - mobileDevices;

  return {
    totalActiveSessions,
    uniqueUsers,
    mobileDevices,
    desktopDevices,
  };
}

/**
 * Get security events timeline (for charts)
 */
export async function getSecurityEventsTrend(days: number = 30): Promise<
  Array<{
    date: string;
    loginSuccess: number;
    loginFailure: number;
    mfaEnabled: number;
    passwordReset: number;
  }>
> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const results = await db
    .select({
      date: sql<string>`DATE(${authAuditLog.createdAt})`,
      eventType: authAuditLog.eventType,
      count: count(),
    })
    .from(authAuditLog)
    .where(gte(authAuditLog.createdAt, since.toISOString()))
    .groupBy(sql`DATE(${authAuditLog.createdAt})`, authAuditLog.eventType)
    .orderBy(sql`DATE(${authAuditLog.createdAt})`);

  // Transform into timeline format
  const timeline = new Map<string, any>();

  for (const row of results) {
    if (!timeline.has(row.date)) {
      timeline.set(row.date, {
        date: row.date,
        loginSuccess: 0,
        loginFailure: 0,
        mfaEnabled: 0,
        passwordReset: 0,
      });
    }

    const entry = timeline.get(row.date);
    if (row.eventType === "login_success") entry.loginSuccess = row.count;
    if (row.eventType === "login_failure") entry.loginFailure = row.count;
    if (row.eventType === "mfa_enabled") entry.mfaEnabled = row.count;
    if (row.eventType === "password_reset_completed") entry.passwordReset = row.count;
  }

  return Array.from(timeline.values());
}

/**
 * Get audit log summary with filtering
 */
export async function getAuditLogSummary(params: {
  limit?: number;
  eventType?: string;
  userId?: number;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { limit = 50, eventType, userId, severity, startDate, endDate } = params;

  const conditions = [];
  if (eventType) conditions.push(eq(authAuditLog.eventType, eventType as any));
  if (userId) conditions.push(eq(authAuditLog.userId, userId));
  if (severity) conditions.push(eq(authAuditLog.severity, severity as any));
  if (startDate) conditions.push(gte(authAuditLog.createdAt, startDate));
  if (endDate) conditions.push(sql`${authAuditLog.createdAt} <= ${endDate}`);

  return await db
    .select({
      id: authAuditLog.id,
      userId: authAuditLog.userId,
      openId: authAuditLog.openId,
      eventType: authAuditLog.eventType,
      timestamp: authAuditLog.createdAt,
      ipAddress: authAuditLog.ipAddress,
      userAgent: authAuditLog.userAgent,
      success: authAuditLog.success,
      severity: authAuditLog.severity,
      metadata: authAuditLog.metadata,
    })
    .from(authAuditLog)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(authAuditLog.createdAt))
    .limit(limit);
}
