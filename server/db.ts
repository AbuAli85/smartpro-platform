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
  loyaltyPoints,
  loyaltyTransactions,
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

export async function updateUserProfile(
  userId: number,
  updates: { name?: string; email?: string | null; phone?: string | null }
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user profile: database not available");
    return;
  }

  try {
    await db
      .update(users)
      .set({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user profile:", error);
    throw error;
  }
}

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

/**
 * Get office by ID (alias for getSanadOfficeById for consistency)
 */
export async function getOfficeById(id: number) {
  return await getSanadOfficeById(id);
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

/**
 * Update office profile information
 */
export async function updateOfficeProfile(
  officeId: number,
  data: {
    name?: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    region?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Map the simplified field names to actual database column names
  const updates: any = {};
  if (data.name !== undefined) updates.officeName = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.email !== undefined) updates.email = data.email;
  if (data.phone !== undefined) updates.phone = data.phone;
  if (data.address !== undefined) updates.address = data.address;
  if (data.region !== undefined) updates.governorate = data.region;

  await db
    .update(sanadOffices)
    .set(updates)
    .where(eq(sanadOffices.id, officeId));
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
  
  let currentTime = startHour * 60 + startMinute;
  const endTimeMinutes = endHour * 60 + endMinute;
  
  while (currentTime + slotDuration <= endTimeMinutes) {
    const slotHour = Math.floor(currentTime / 60);
    const slotMinute = currentTime % 60;
    const slotTime = `${String(slotHour).padStart(2, "0")}:${String(slotMinute).padStart(2, "0")}`;
    
    // Check if this slot is already booked
    const isBooked = existingBookings.some((booking) => {
      const bookingTime = booking.scheduledTime;
      return bookingTime === slotTime;
    });
    
    if (!isBooked) {
      slots.push({
        time: slotTime,
        available: true,
      });
    }
    
    currentTime += slotDuration;
  }
  
  return slots;
}

// ============================================================================
// ADMIN HELPERS
// ============================================================================

export async function getPlatformStatistics() {
  const db = await getDb();
  if (!db) return {
    totalOffices: 0,
    totalUsers: 0,
    totalDocuments: 0,
    totalBookings: 0,
    pendingOffices: 0,
    activeOffices: 0,
  };

  const [
    officesCount,
    usersCount,
    documentsCount,
    bookingsCount,
    pendingOfficesCount,
    activeOfficesCount,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(sanadOffices),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(generatedDocuments),
    db.select({ count: sql<number>`count(*)` }).from(bookings),
    db.select({ count: sql<number>`count(*)` }).from(sanadOffices).where(eq(sanadOffices.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(sanadOffices).where(eq(sanadOffices.status, "active")),
  ]);

  return {
    totalOffices: officesCount[0]?.count || 0,
    totalUsers: usersCount[0]?.count || 0,
    totalDocuments: documentsCount[0]?.count || 0,
    totalBookings: bookingsCount[0]?.count || 0,
    pendingOffices: pendingOfficesCount[0]?.count || 0,
    activeOffices: activeOfficesCount[0]?.count || 0,
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

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(users)
    .orderBy(desc(users.lastSignedIn));
}

export async function getRecentActivity(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

/**
 * Get office statistics for office dashboard
 */
export async function getOfficeStatistics(officeId: number) {
  const db = await getDb();
  if (!db) return {
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
  };

  const office = await getSanadOfficeById(officeId);
  const officeBookings = await getOfficeBookings(officeId);

  const completedBookings = officeBookings.filter((b) => b.status === "completed").length;
  const cancelledBookings = officeBookings.filter((b) => b.status === "cancelled").length;
  const totalRevenue = officeBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + parseFloat(b.price || "0"), 0);

  return {
    totalBookings: officeBookings.length,
    completedBookings,
    cancelledBookings,
    totalRevenue,
    averageRating: parseFloat(office?.averageRating || "0"),
    totalReviews: office?.totalReviews || 0,
  };
}

/**
 * Create office availability schedule
 */
export async function createOfficeAvailability(data: {
  officeId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(officeAvailability).values(data as any);
  return 0;
}

/**
 * Update office availability schedule
 */
export async function updateOfficeAvailability(id: number, updates: Partial<typeof officeAvailability.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(officeAvailability)
    .set(updates as any)
    .where(eq(officeAvailability.id, id));
}

/**
 * Delete office availability schedule
 */
export async function deleteOfficeAvailability(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(officeAvailability).where(eq(officeAvailability.id, id));
}

// ============================================================================
// NOTIFICATION COUNTS
// ============================================================================

export async function getPendingBookingsCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pending bookings count: database not available");
    return 0;
  }

  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, userId),
          eq(bookings.status, "pending")
        )
      );
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error("[Database] Error getting pending bookings count:", error);
    return 0;
  }
}

// ============================================================================
// OFFICE ANALYTICS
// ============================================================================

export async function getOfficeAnalytics(officeId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get office analytics: database not available");
    return null;
  }

  try {
    // Get total bookings
    const totalBookingsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.officeId, officeId),
          gte(bookings.scheduledDate, startDate),
          lte(bookings.scheduledDate, endDate)
        )
      );
    
    // Get revenue (sum of prices for completed bookings)
    const revenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${bookings.price} AS DECIMAL(10,2))), 0)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.officeId, officeId),
          eq(bookings.status, "completed"),
          gte(bookings.scheduledDate, startDate),
          lte(bookings.scheduledDate, endDate)
        )
      );
    
    // Get average rating
    const ratingsResult = await db
      .select({ 
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        count: sql<number>`count(*)`
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.officeId, officeId),
          gte(reviews.createdAt, startDate),
          lte(reviews.createdAt, endDate)
        )
      );
    
    // Get bookings by status
    const statusBreakdown = await db
      .select({ 
        status: bookings.status,
        count: sql<number>`count(*)`
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.officeId, officeId),
          gte(bookings.scheduledDate, startDate),
          lte(bookings.scheduledDate, endDate)
        )
      )
      .groupBy(bookings.status);
    
    // Get daily bookings for trend chart
    const dailyBookings = await db
      .select({
        date: sql<string>`DATE(${bookings.scheduledDate})`,
        count: sql<number>`count(*)`
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.officeId, officeId),
          gte(bookings.scheduledDate, startDate),
          lte(bookings.scheduledDate, endDate)
        )
      )
      .groupBy(sql`DATE(${bookings.scheduledDate})`)
      .orderBy(sql`DATE(${bookings.scheduledDate})`);
    
    return {
      totalBookings: totalBookingsResult[0]?.count || 0,
      revenue: revenueResult[0]?.total || 0,
      averageRating: ratingsResult[0]?.avgRating || 0,
      totalReviews: ratingsResult[0]?.count || 0,
      statusBreakdown: statusBreakdown.map(s => ({
        status: s.status,
        count: s.count
      })),
      dailyBookings: dailyBookings.map(d => ({
        date: d.date,
        count: d.count
      }))
    };
  } catch (error) {
    console.error("[Database] Error getting office analytics:", error);
    return null;
  }
}

export async function getPopularServices(officeId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get popular services: database not available");
    return [];
  }

  try {
    const result = await db
      .select({
        serviceDescription: bookings.serviceDescription,
        count: sql<number>`count(*)`
      })
      .from(bookings)
      .where(eq(bookings.officeId, officeId))
      .groupBy(bookings.serviceDescription)
      .orderBy(sql`count(*) DESC`)
      .limit(limit);
    
    return result.map(r => ({
      service: r.serviceDescription,
      count: r.count
    }));
  } catch (error) {
    console.error("[Database] Error getting popular services:", error);
    return [];
  }
}

// ============================================================================
// Booking Reminders
// ============================================================================

export async function getBookingsNeedingReminder(
  targetTime: Date,
  windowEnd: Date,
  reminderType: "24h" | "1h"
) {
  const db = await getDb();
  if (!db) return [];
  
  const reminderField = reminderType === "24h" ? "reminder24hSent" : "reminder1hSent";
  
  return await db
    .select({
      id: bookings.id,
      customerName: users.name,
      customerEmail: users.email,
      customerPhone: users.phone,
      officeName: sanadOffices.officeName,
      scheduledDate: bookings.scheduledDate,
      scheduledTime: bookings.scheduledTime,
      serviceDescription: bookings.serviceDescription,
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.openId))
    .innerJoin(sanadOffices, eq(bookings.officeId, sanadOffices.id))
    .where(
      and(
        eq(bookings.status, "confirmed"),
        gte(bookings.scheduledDate, targetTime),
        lte(bookings.scheduledDate, windowEnd),
        eq(bookings[reminderField], false)
      )
    );
}

export async function markReminderSent(bookingId: number, reminderType: "24h" | "1h") {
  const db = await getDb();
  if (!db) return;
  
  const updateField = reminderType === "24h" 
    ? { reminder24hSent: true }
    : { reminder1hSent: true };
    
  await db
    .update(bookings)
    .set(updateField)
    .where(eq(bookings.id, bookingId));
}

// ============================================================================
// SANAD OFFICE SERVICES
// ============================================================================


// ============================================================================
// LOYALTY PROGRAM
// ============================================================================

export async function getUserLoyalty(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(loyaltyPoints)
    .where(eq(loyaltyPoints.userId, userId))
    .limit(1);

  if (result.length === 0) {
    // Create loyalty account if it doesn't exist
    await db.insert(loyaltyPoints).values({
      userId,
      totalPoints: 0,
      availablePoints: 0,
      redeemedPoints: 0,
    });

    return {
      id: 0,
      userId,
      totalPoints: 0,
      availablePoints: 0,
      redeemedPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return result[0];
}

export async function getLoyaltyTransactions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(loyaltyTransactions)
    .where(eq(loyaltyTransactions.userId, userId))
    .orderBy(desc(loyaltyTransactions.createdAt))
    .limit(limit);
}

export async function awardPoints(params: {
  userId: number;
  points: number;
  reason: string;
  bookingId?: number;
  reviewId?: number;
  referralId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get or create loyalty account
  const loyalty = await getUserLoyalty(params.userId);
  if (!loyalty) throw new Error("Failed to get loyalty account");

  // Add transaction
  await db.insert(loyaltyTransactions).values({
    userId: params.userId,
    type: "earn",
    points: params.points,
    reason: params.reason,
    bookingId: params.bookingId,
    reviewId: params.reviewId,
    referralId: params.referralId,
  });

  // Update loyalty points
  await db
    .update(loyaltyPoints)
    .set({
      totalPoints: loyalty.totalPoints + params.points,
      availablePoints: loyalty.availablePoints + params.points,
    })
    .where(eq(loyaltyPoints.userId, params.userId));

  return true;
}

export async function redeemPoints(params: {
  userId: number;
  points: number;
  reason: string;
  bookingId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get loyalty account
  const loyalty = await getUserLoyalty(params.userId);
  if (!loyalty) throw new Error("Loyalty account not found");

  // Check if user has enough points
  if (loyalty.availablePoints < params.points) {
    throw new Error("Insufficient points");
  }

  // Add transaction
  await db.insert(loyaltyTransactions).values({
    userId: params.userId,
    type: "redeem",
    points: params.points,
    reason: params.reason,
    bookingId: params.bookingId,
  });

  // Update loyalty points
  await db
    .update(loyaltyPoints)
    .set({
      availablePoints: loyalty.availablePoints - params.points,
      redeemedPoints: loyalty.redeemedPoints + params.points,
    })
    .where(eq(loyaltyPoints.userId, params.userId));

  return true;
}
