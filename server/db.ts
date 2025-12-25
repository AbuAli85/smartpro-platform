import { and, desc, eq, like, or, sql, gte, lte, not } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  sanadOffices,
  sanadOfficeStaff,
  sanadOfficeServices,
  documentTemplates,
  generatedDocuments,
  bookings,
  reviews,
  activityLog,
  officeAvailability,
  type SanadOffice,
  type SanadOfficeStaff,
  type SanadOfficeService,
  type DocumentTemplate,
  type Booking,
  type Review,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "avatarUrl"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// SANAD OFFICE MANAGEMENT
// ============================================================================

export async function createSanadOffice(office: Partial<SanadOffice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(sanadOffices).values(office as any);
  return 0; // Return placeholder ID
}

export async function getSanadOfficeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(sanadOffices).where(eq(sanadOffices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSanadOfficeBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(sanadOffices).where(eq(sanadOffices.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listSanadOffices(filters: {
  governorate?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { offices: [], total: 0 };

  let query = db.select().from(sanadOffices);
  let conditions: any[] = [];

  if (filters.governorate) {
    conditions.push(eq(sanadOffices.governorate, filters.governorate));
  }

  if (filters.status) {
    conditions.push(eq(sanadOffices.status, filters.status as any));
  }

  if (filters.search) {
    conditions.push(
      or(
        like(sanadOffices.officeName, `%${filters.search}%`),
        like(sanadOffices.officeNameAr, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const offices = await query
    .orderBy(desc(sanadOffices.createdAt))
    .limit(filters.limit || 20)
    .offset(filters.offset || 0);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(sanadOffices)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    offices,
    total: countResult[0]?.count || 0,
  };
}

export async function updateSanadOffice(id: number, updates: Partial<SanadOffice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(sanadOffices).set(updates).where(eq(sanadOffices.id, id));
}

export async function getSanadOfficesByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sanadOffices)
    .where(eq(sanadOffices.ownerId, ownerId))
    .orderBy(desc(sanadOffices.createdAt));
}

// ============================================================================
// SANAD OFFICE STAFF
// ============================================================================

export async function addSanadOfficeStaff(staff: Partial<SanadOfficeStaff>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(sanadOfficeStaff).values(staff as any);
  return 0; // Return placeholder ID
}

export async function getSanadOfficeStaff(officeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sanadOfficeStaff)
    .where(eq(sanadOfficeStaff.officeId, officeId))
    .orderBy(desc(sanadOfficeStaff.createdAt));
}

export async function getUserOfficeRole(userId: number, officeId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(sanadOfficeStaff)
    .where(and(eq(sanadOfficeStaff.userId, userId), eq(sanadOfficeStaff.officeId, officeId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// SANAD OFFICE SERVICES
// ============================================================================

export async function createSanadOfficeService(service: Partial<SanadOfficeService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(sanadOfficeServices).values(service as any);
  return 0; // Return placeholder ID
}

export async function getSanadOfficeServices(officeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sanadOfficeServices)
    .where(and(eq(sanadOfficeServices.officeId, officeId), eq(sanadOfficeServices.isActive, true)))
    .orderBy(desc(sanadOfficeServices.createdAt));
}

export async function updateSanadOfficeService(id: number, updates: Partial<SanadOfficeService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(sanadOfficeServices).set(updates).where(eq(sanadOfficeServices.id, id));
}

// ============================================================================
// DOCUMENT TEMPLATES
// ============================================================================

export async function listDocumentTemplates(filters: {
  category?: string;
  language?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { templates: [], total: 0 };

  let query = db.select().from(documentTemplates);
  let conditions: any[] = [eq(documentTemplates.isActive, true)];

  if (filters.category) {
    conditions.push(eq(documentTemplates.category, filters.category));
  }

  if (filters.language) {
    conditions.push(eq(documentTemplates.language, filters.language));
  }

  if (filters.search) {
    conditions.push(
      or(
        like(documentTemplates.templateName, `%${filters.search}%`),
        like(documentTemplates.templateNameAr, `%${filters.search}%`)
      )
    );
  }

  const templates = await query
    .where(and(...conditions))
    .orderBy(desc(documentTemplates.usageCount))
    .limit(filters.limit || 20)
    .offset(filters.offset || 0);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(documentTemplates)
    .where(and(...conditions));

  return {
    templates,
    total: countResult[0]?.count || 0,
  };
}

export async function getDocumentTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(documentTemplates).where(eq(documentTemplates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function incrementTemplateUsage(id: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(documentTemplates)
    .set({ usageCount: sql`${documentTemplates.usageCount} + 1` })
    .where(eq(documentTemplates.id, id));
}

// ============================================================================
// GENERATED DOCUMENTS
// ============================================================================

export async function createGeneratedDocument(doc: Partial<typeof generatedDocuments.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(generatedDocuments).values(doc as any);
  return 0; // Return placeholder ID
}

export async function getUserGeneratedDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      document: generatedDocuments,
      template: documentTemplates,
    })
    .from(generatedDocuments)
    .leftJoin(documentTemplates, eq(generatedDocuments.templateId, documentTemplates.id))
    .where(eq(generatedDocuments.userId, userId))
    .orderBy(desc(generatedDocuments.createdAt));
}

// ============================================================================
// BOOKINGS
// ============================================================================

export async function createBooking(booking: Partial<Booking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(bookings).values(booking as any);
  return 0; // Return placeholder ID
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));
}

export async function getOfficeBookings(officeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.officeId, officeId))
    .orderBy(desc(bookings.createdAt));
}

export async function updateBooking(id: number, updates: Partial<Booking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bookings).set(updates).where(eq(bookings.id, id));
}

// ============================================================================
// REVIEWS
// ============================================================================

export async function createReview(review: Partial<Review>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(reviews).values(review as any);
  
  // Update office rating
  await updateOfficeRating(review.officeId!);
  
  return 0; // Return placeholder ID
}

export async function getOfficeReviews(officeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.officeId, officeId), eq(reviews.isVisible, true)))
    .orderBy(desc(reviews.createdAt));
}

async function updateOfficeRating(officeId: number) {
  const db = await getDb();
  if (!db) return;

  const reviewsList = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.officeId, officeId), eq(reviews.isVisible, true)));

  if (reviewsList.length === 0) return;

  const totalRating = reviewsList.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalRating / reviewsList.length;

  await db
    .update(sanadOffices)
    .set({
      averageRating: avgRating.toFixed(2),
      totalReviews: reviewsList.length,
    })
    .where(eq(sanadOffices.id, officeId));
}

// ============================================================================
// ACTIVITY LOG
// ============================================================================

export async function logActivity(activity: Partial<typeof activityLog.$inferInsert>) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(activityLog).values(activity as any);
  } catch (error) {
    console.error("[Database] Failed to log activity:", error);
  }
}


// ============================================================================
// OFFICE AVAILABILITY
// ============================================================================

export async function getOfficeAvailability(officeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(officeAvailability)
    .where(and(
      eq(officeAvailability.officeId, officeId),
      eq(officeAvailability.isActive, true)
    ))
    .orderBy(officeAvailability.dayOfWeek);
}

export async function setOfficeAvailability(data: {
  officeId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(officeAvailability).values(data as any);
}

// ============================================================================
// BOOKING HELPERS
// ============================================================================

export async function getAvailableTimeSlots(officeId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const dayOfWeek = date.getDay();
  
  // Get office availability for this day
  const availability = await db
    .select()
    .from(officeAvailability)
    .where(and(
      eq(officeAvailability.officeId, officeId),
      eq(officeAvailability.dayOfWeek, dayOfWeek),
      eq(officeAvailability.isActive, true)
    ))
    .limit(1);
  
  if (availability.length === 0) return [];
  
  const { startTime, endTime, slotDuration } = availability[0];
  
  // Get existing bookings for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingBookings = await db
    .select()
    .from(bookings)
    .where(and(
      eq(bookings.officeId, officeId),
      gte(bookings.scheduledDate, startOfDay),
      lte(bookings.scheduledDate, endOfDay),
      not(eq(bookings.status, "cancelled"))
    ));
  
  // Generate time slots
  const slots = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  let currentTime = startHour * 60 + startMinute; // Convert to minutes
  const endTimeMinutes = endHour * 60 + endMinute;
  
  while (currentTime < endTimeMinutes) {
    const hour = Math.floor(currentTime / 60);
    const minute = currentTime % 60;
    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    
    // Check if this slot is already booked
    const isBooked = existingBookings.some(booking => booking.scheduledTime === timeStr);
    
    slots.push({
      time: timeStr,
      available: !isBooked,
    });
    
    currentTime += slotDuration;
  }
  
  return slots;
}

export async function updateBookingStatus(bookingId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(bookings)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));
}

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;

  const [
    totalOffices,
    activeOffices,
    totalUsers,
    totalDocuments,
    totalBookings,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(sanadOffices),
    db.select({ count: sql<number>`count(*)` }).from(sanadOffices).where(eq(sanadOffices.status, "active")),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(generatedDocuments),
    db.select({ count: sql<number>`count(*)` }).from(bookings),
  ]);

  return {
    totalOffices: Number(totalOffices[0]?.count || 0),
    activeOffices: Number(activeOffices[0]?.count || 0),
    totalUsers: Number(totalUsers[0]?.count || 0),
    totalDocuments: Number(totalDocuments[0]?.count || 0),
    totalBookings: Number(totalBookings[0]?.count || 0),
    newUsersThisMonth: 0, // TODO: Calculate
    documentsThisMonth: 0, // TODO: Calculate
    bookingsThisMonth: 0, // TODO: Calculate
  };
}

export async function getPendingOffices() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sanadOffices)
    .where(eq(sanadOffices.status, "pending"))
    .orderBy(desc(sanadOffices.createdAt));
}

export async function updateOfficeStatus(officeId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(sanadOffices)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(sanadOffices.id, officeId));
}


// ============================================================================
// OFFICE DASHBOARD HELPERS
// ============================================================================

/**
 * Get statistics for an office dashboard
 */
export async function getOfficeStatistics(officeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all bookings for this office
  const allBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.officeId, officeId));

  // Calculate statistics
  const totalBookings = allBookings.length;
  const pendingBookings = allBookings.filter(b => b.status === "pending").length;
  const monthlyBookings = allBookings.filter(b => 
    b.createdAt >= firstDayOfMonth
  ).length;
  const uniqueCustomers = new Set(allBookings.map(b => b.userId)).size;

  return {
    totalBookings,
    pendingBookings,
    monthlyBookings,
    uniqueCustomers,
  };
}
