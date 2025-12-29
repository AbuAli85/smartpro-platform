import { mysqlTable, int, varchar, text, timestamp, boolean, json, mysqlEnum, index } from "drizzle-orm/mysql-core";

/**
 * Security Alerts Table
 * 
 * Tracks security events and suspicious activity for admin monitoring
 */
export const securityAlerts = mysqlTable("security_alerts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Alert identification
  alertType: mysqlEnum("alertType", [
    "multiple_failed_logins",
    "impossible_travel",
    "fast_travel",
    "country_change",
    "mfa_failure",
    "suspicious_ip",
    "password_reset_abuse",
    "session_hijacking",
    "brute_force_attempt",
    "account_lockout",
  ]).notNull(),
  
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  status: mysqlEnum("status", ["new", "investigating", "resolved", "false_positive"]).default("new").notNull(),
  
  // User and session information
  userId: int("userId"),
  openId: varchar("openId", { length: 64 }),
  sessionId: varchar("sessionId", { length: 255 }),
  
  // Alert details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  
  // Context information
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  location: json("location").$type<{
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    formatted?: string;
  }>(),
  
  // Additional metadata
  metadata: json("metadata").$type<{
    failedAttempts?: number;
    distance?: number;
    timeDifference?: number;
    previousLocation?: any;
    currentLocation?: any;
    reason?: string;
    [key: string]: any;
  }>(),
  
  // Resolution tracking
  resolvedBy: int("resolvedBy"), // Admin user ID who resolved the alert
  resolvedAt: timestamp("resolvedAt"),
  resolutionNotes: text("resolutionNotes"),
  
  // Notification tracking
  notificationSent: boolean("notificationSent").default(false),
  notificationSentAt: timestamp("notificationSentAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  alertTypeIdx: index("alert_type_idx").on(table.alertType),
  severityIdx: index("severity_idx").on(table.severity),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type InsertSecurityAlert = typeof securityAlerts.$inferInsert;
