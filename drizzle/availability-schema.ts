import { int, mysqlTable, varchar, boolean, timestamp, index } from "drizzle-orm/mysql-core";

/**
 * Office Availability Schema
 * Defines when Sanad offices are available for bookings
 */

export const officeAvailability = mysqlTable("office_availability", {
  id: int("id").autoincrement().primaryKey(),
  officeId: int("officeId").notNull(),
  
  // Day of week (0 = Sunday, 6 = Saturday)
  dayOfWeek: int("dayOfWeek").notNull(), // 0-6
  
  // Time slots
  startTime: varchar("startTime", { length: 10 }).notNull(), // e.g., "09:00"
  endTime: varchar("endTime", { length: 10 }).notNull(), // e.g., "17:00"
  
  // Slot configuration
  slotDuration: int("slotDuration").default(60).notNull(), // Minutes per slot
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Audit
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  officeIdx: index("office_idx").on(table.officeId),
  dayIdx: index("day_idx").on(table.dayOfWeek),
}));

export type OfficeAvailability = typeof officeAvailability.$inferSelect;
export type InsertOfficeAvailability = typeof officeAvailability.$inferInsert;
