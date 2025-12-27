import { and, desc, eq, like, or, sql, gte, lte, not, isNull } from "drizzle-orm";
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
  referrals,
  notifications,
  type SanadOffice,
  type SanadOfficeStaff,
  type SanadOfficeService,
  type DocumentTemplate,
  type Booking,
  type Review,
  scheduledFollowups,
  type ScheduledFollowup,
  translationRequests,
  translationActivityLog,
  translationMemory,
  translationVersions,
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
  category?: string;
  minRating?: number;
  availableToday?: boolean;
  availableThisWeek?: boolean;
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

  if (filters.minRating !== undefined) {
    conditions.push(gte(sanadOffices.averageRating, filters.minRating.toString()));
  }

  // Note: Category filter requires joining with services table
  // Availability filters require checking booking slots
  // These will be implemented in the query below

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

// Service management functions for office profile editor
export async function getServiceById(serviceId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const [service] = await db
    .select()
    .from(sanadOfficeServices)
    .where(eq(sanadOfficeServices.id, serviceId))
    .limit(1);

  return service;
}

export async function addOfficeService(data: {
  officeId: number;
  serviceName: string;
  serviceNameAr: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  estimatedDays: number;
  isActive: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(sanadOfficeServices)
    .values({
      officeId: data.officeId,
      serviceName: data.serviceName,
      serviceNameAr: data.serviceNameAr,
      category: "general", // Default category
      description: data.description,
      descriptionAr: data.descriptionAr,
      price: data.price.toString(),
      estimatedDeliveryDays: data.estimatedDays,
      isActive: data.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  return { success: true };
}

export async function updateOfficeService(data: {
  serviceId: number;
  serviceName?: string;
  serviceNameAr?: string;
  description?: string;
  descriptionAr?: string;
  price?: number;
  estimatedDays?: number;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.serviceName !== undefined) updateData.serviceName = data.serviceName;
  if (data.serviceNameAr !== undefined) updateData.serviceNameAr = data.serviceNameAr;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.descriptionAr !== undefined) updateData.descriptionAr = data.descriptionAr;
  if (data.price !== undefined) updateData.price = data.price.toString();
  if (data.estimatedDays !== undefined) updateData.estimatedDeliveryDays = data.estimatedDays;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  await db
    .update(sanadOfficeServices)
    .set(updateData)
    .where(eq(sanadOfficeServices.id, data.serviceId));

  return { success: true };
}

export async function deleteOfficeService(serviceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(sanadOfficeServices)
    .where(eq(sanadOfficeServices.id, serviceId));

  return { success: true };
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
  
  // Use UTC to avoid timezone issues
  const dayOfWeek = date.getUTCDay();
  
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

/**
 * Get availability by ID
 */
export async function getAvailabilityById(availabilityId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const [availability] = await db
    .select()
    .from(officeAvailability)
    .where(eq(officeAvailability.id, availabilityId))
    .limit(1);

  return availability;
}

/**
 * Upsert office availability (used by profile editor)
 * This function either updates existing availability for a day or creates new one
 */
export async function upsertOfficeAvailability(data: {
  officeId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isAvailable?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if availability exists for this day
  const [existing] = await db
    .select()
    .from(officeAvailability)
    .where(
      and(
        eq(officeAvailability.officeId, data.officeId),
        eq(officeAvailability.dayOfWeek, data.dayOfWeek)
      )
    )
    .limit(1);

  if (existing) {
    // Update existing
    await db
      .update(officeAvailability)
      .set({
        startTime: data.startTime,
        endTime: data.endTime,
        slotDuration: data.slotDuration,
        isActive: data.isAvailable ?? true,
        updatedAt: new Date(),
      })
      .where(eq(officeAvailability.id, existing.id));

    return { success: true, id: existing.id };
  } else {
    // Insert new
    await db
      .insert(officeAvailability)
      .values({
        officeId: data.officeId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        slotDuration: data.slotDuration,
        isActive: data.isAvailable ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    return { success: true };
  }
}

/**
 * Update office basic information
 */
export async function updateOfficeInfo(data: {
  officeId: number;
  officeName: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  region?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.officeName) updateData.officeName = data.officeName;
  if (data.description) updateData.description = data.description;
  if (data.contactEmail) updateData.email = data.contactEmail;
  if (data.contactPhone) updateData.phone = data.contactPhone;
  if (data.address) updateData.addressLine1 = data.address;
  if (data.city) updateData.wilayat = data.city;
  if (data.region) updateData.governorate = data.region;

  await db
    .update(sanadOffices)
    .set(updateData)
    .where(eq(sanadOffices.id, data.officeId));

  return { success: true };
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
    .innerJoin(users, eq(bookings.userId, users.id))
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


// ============================================================================
// REFERRAL SYSTEM
// ============================================================================

/**
 * Generate a unique referral code
 */
async function generateReferralCode(): Promise<string> {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referralCode, code))
    .limit(1);
  
  if (existing.length > 0) {
    return generateReferralCode();
  }
  
  return code;
}

/**
 * Get or create referral code for a user
 */
export async function getUserReferralCode(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const user = await db
    .select({ referralCode: users.referralCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (user[0]?.referralCode) {
    return user[0].referralCode;
  }
  
  const code = await generateReferralCode();
  
  await db
    .update(users)
    .set({ referralCode: code })
    .where(eq(users.id, userId));
  
  await db.insert(referrals).values({
    referrerId: userId,
    referralCode: code,
    status: "pending",
  });
  
  return code;
}

/**
 * Track a referral when a new user signs up with a code
 */
export async function trackReferral(referralCode: string, newUserId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    const referral = await db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referralCode, referralCode),
          eq(referrals.status, "pending"),
          isNull(referrals.referredId)
        )
      )
      .limit(1);
    
    if (referral.length === 0) {
      return false;
    }
    
    await db
      .update(referrals)
      .set({
        referredId: newUserId,
        updatedAt: new Date(),
      })
      .where(eq(referrals.id, referral[0].id));
    
    return true;
  } catch (error) {
    console.error("Error tracking referral:", error);
    return false;
  }
}

/**
 * Complete a referral and award points when referred user completes first booking
 */
export async function completeReferral(referredUserId: number, bookingId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    const referral = await db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referredId, referredUserId),
          eq(referrals.status, "pending"),
          eq(referrals.pointsAwarded, false)
        )
      )
      .limit(1);
    
    if (referral.length === 0) {
      return false;
    }
    
    const ref = referral[0];
    
    await db
      .update(referrals)
      .set({
        status: "completed",
        pointsAwarded: true,
        firstBookingId: bookingId,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(referrals.id, ref.id));
    
    await awardPoints({
      userId: ref.referrerId,
      points: 25,
      reason: "Successful referral - friend completed first booking",
      referralId: ref.id,
    });

    // Create notification for referrer
    await createNotification({
      userId: ref.referrerId,
      type: "referral",
      title: "Referral Bonus Earned!",
      message: "Your friend completed their first booking! You earned 25 loyalty points.",
      referralId: ref.id,
      actionUrl: `/refer`,
    });
    
    return true;
  } catch (error) {
    console.error("Error completing referral:", error);
    return false;
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: number) {
  const db = await getDb();
  if (!db) return {
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    pointsEarned: 0,
    referrals: [],
  };
  
  const allReferrals = await db
    .select({
      id: referrals.id,
      referralCode: referrals.referralCode,
      referredId: referrals.referredId,
      status: referrals.status,
      pointsAwarded: referrals.pointsAwarded,
      completedAt: referrals.completedAt,
      createdAt: referrals.createdAt,
      referredUserName: users.name,
      referredUserEmail: users.email,
    })
    .from(referrals)
    .leftJoin(users, eq(referrals.referredId, users.id))
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(referrals.createdAt));
  
  return {
    totalReferrals: allReferrals.filter(r => r.referredId !== null).length,
    successfulReferrals: allReferrals.filter(r => r.status === "completed").length,
    pendingReferrals: allReferrals.filter(r => r.status === "pending" && r.referredId !== null).length,
    pointsEarned: allReferrals.filter(r => r.pointsAwarded).length * 25,
    referrals: allReferrals,
  };
}

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

/**
 * Create a notification for a user
 */
export async function createNotification(params: {
  userId: number;
  type: "booking" | "points" | "system" | "review" | "referral";
  title: string;
  message: string;
  bookingId?: number;
  reviewId?: number;
  referralId?: number;
  actionUrl?: string;
}) {
  const db = await getDb();
  if (!db) return 0;
  
  await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    bookingId: params.bookingId,
    reviewId: params.reviewId,
    referralId: params.referralId,
    actionUrl: params.actionUrl,
    isRead: false,
  });
  
  return 0;
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(eq(notifications.id, notificationId));
  
  return true;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  
  return true;
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  
  return result[0]?.count || 0;
}


// ============================================================================
// ANALYTICS
// ============================================================================

export async function getBookingTrends(params: {
  startDate: Date;
  endDate: Date;
  groupBy: "day" | "week" | "month";
}) {
  const db = await getDb();
  if (!db) return [];

  const { startDate, endDate, groupBy } = params;

  // MySQL date format based on grouping
  const dateFormat = {
    day: "%Y-%m-%d",
    week: "%Y-%u", // Year-Week
    month: "%Y-%m",
  }[groupBy];

  const results = await db
    .select({
      period: sql<string>`DATE_FORMAT(${bookings.createdAt}, ${dateFormat})`.as('period'),
      totalBookings: sql<number>`COUNT(*)`.as('totalBookings'),
      confirmedBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'confirmed' THEN 1 ELSE 0 END)`.as('confirmedBookings'),
      completedBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'completed' THEN 1 ELSE 0 END)`.as('completedBookings'),
      cancelledBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'cancelled' THEN 1 ELSE 0 END)`.as('cancelledBookings'),
    })
    .from(bookings)
    .where(and(gte(bookings.createdAt, startDate), lte(bookings.createdAt, endDate)))
    .groupBy(sql`period`)
    .orderBy(sql`period`);

  return results;
}

export async function getPopularServicesAnalytics(params: {
  startDate: Date;
  endDate: Date;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const { startDate, endDate, limit = 10 } = params;

  const results = await db
    .select({
      serviceId: sanadOfficeServices.id,
      serviceName: sanadOfficeServices.serviceName,
      category: sanadOfficeServices.category,
      bookingCount: sql<number>`COUNT(${bookings.id})`,
      totalRevenue: sql<number>`SUM(CAST(${sanadOfficeServices.price} AS DECIMAL(10,2)))`,
    })
    .from(bookings)
    .innerJoin(sanadOfficeServices, eq(bookings.serviceId, sanadOfficeServices.id))
    .where(
      and(
        gte(bookings.createdAt, startDate),
        lte(bookings.createdAt, endDate),
        // Filter out cancelled bookings
        not(eq(bookings.status, "cancelled"))
      )
    )
    .groupBy(sanadOfficeServices.id, sanadOfficeServices.serviceName, sanadOfficeServices.category)
    .orderBy(desc(sql`COUNT(${bookings.id})`))
    .limit(limit);

  return results;
}

export async function getPeakBookingTimesAnalytics(params: {
  startDate: Date;
  endDate: Date;
}) {
  const db = await getDb();
  if (!db) return [];

  const { startDate, endDate } = params;

  // Get booking count by hour of day
  const results = await db
    .select({
      hour: sql<number>`HOUR(${bookings.scheduledTime})`.as('hour'),
      bookingCount: sql<number>`COUNT(*)`.as('bookingCount'),
    })
    .from(bookings)
    .where(
      and(
        gte(bookings.createdAt, startDate),
        lte(bookings.createdAt, endDate),
        not(isNull(bookings.scheduledTime))
      )
    )
    .groupBy(sql`hour`)
    .orderBy(sql`hour`);

  return results;
}

export async function getRevenueMetricsAnalytics(params: {
  startDate: Date;
  endDate: Date;
  previousPeriodStartDate: Date;
  previousPeriodEndDate: Date;
}) {
  const db = await getDb();
  if (!db) return {
    currentRevenue: 0,
    previousRevenue: 0,
    growthPercentage: 0,
    totalBookings: 0,
    completedBookings: 0,
    averageBookingValue: 0,
  };

  const { startDate, endDate, previousPeriodStartDate, previousPeriodEndDate } = params;

  // Current period metrics
  const currentPeriod = await db
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(CAST(${sanadOfficeServices.price} AS DECIMAL(10,2))), 0)`,
      totalBookings: sql<number>`COUNT(*)`,
      completedBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'completed' THEN 1 ELSE 0 END)`,
    })
    .from(bookings)
    .leftJoin(sanadOfficeServices, eq(bookings.serviceId, sanadOfficeServices.id))
    .where(
      and(
        gte(bookings.createdAt, startDate),
        lte(bookings.createdAt, endDate)
      )
    );

  // Previous period metrics
  const previousPeriod = await db
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(CAST(${sanadOfficeServices.price} AS DECIMAL(10,2))), 0)`,
    })
    .from(bookings)
    .leftJoin(sanadOfficeServices, eq(bookings.serviceId, sanadOfficeServices.id))
    .where(
      and(
        gte(bookings.createdAt, previousPeriodStartDate),
        lte(bookings.createdAt, previousPeriodEndDate)
      )
    );

  const currentRevenue = currentPeriod[0]?.totalRevenue || 0;
  const previousRevenue = previousPeriod[0]?.totalRevenue || 0;
  const totalBookings = currentPeriod[0]?.totalBookings || 0;
  const completedBookings = currentPeriod[0]?.completedBookings || 0;

  const growthPercentage = previousRevenue > 0
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
    : 0;

  const averageBookingValue = totalBookings > 0 ? currentRevenue / totalBookings : 0;

  return {
    currentRevenue,
    previousRevenue,
    growthPercentage,
    totalBookings,
    completedBookings,
    averageBookingValue,
  };
}


// ============================================================================
// SCHEDULED FOLLOW-UPS
// ============================================================================

export async function createScheduledFollowup(data: {
  conversationId: number;
  officeId: number;
  scheduledFor: Date;
  triggerType: "24h" | "48h" | "manual";
  messageTemplate: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not initialized");
  const [result] = await database.insert(scheduledFollowups).values(data);
  return result;
}

export async function getPendingFollowups() {
  const database = await getDb();
  if (!database) throw new Error("Database not initialized");
  return database
    .select()
    .from(scheduledFollowups)
    .where(
      and(
        eq(scheduledFollowups.status, "pending"),
        lte(scheduledFollowups.scheduledFor, new Date())
      )
    );
}

export async function getFollowupsByConversation(conversationId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not initialized");
  return database
    .select()
    .from(scheduledFollowups)
    .where(eq(scheduledFollowups.conversationId, conversationId))
    .orderBy(desc(scheduledFollowups.createdAt));
}

export async function markFollowupAsSent(followupId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not initialized");
  await database
    .update(scheduledFollowups)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(scheduledFollowups.id, followupId));
}

export async function cancelFollowup(followupId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not initialized");
  await database
    .update(scheduledFollowups)
    .set({ status: "cancelled" })
    .where(eq(scheduledFollowups.id, followupId));
}

// ============================================================================
// CHAT ANALYTICS
// ============================================================================

/**
 * Get office performance metrics for admin dashboard
 */
export async function getOfficePerformanceMetrics(params: {
  startDate: Date;
  endDate: Date;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const { startDate, endDate, limit = 20 } = params;

  const results = await db
    .select({
      officeId: sanadOffices.id,
      officeName: sanadOffices.officeName,
      governorate: sanadOffices.governorate,
      totalBookings: sql<number>`COUNT(${bookings.id})`.as('totalBookings'),
      completedBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'completed' THEN 1 ELSE 0 END)`.as('completedBookings'),
      totalRevenue: sql<string>`SUM(CASE WHEN ${bookings.status} = 'completed' THEN COALESCE(${bookings.price}, 0) ELSE 0 END)`.as('totalRevenue'),
      averageRating: sanadOffices.averageRating,
      totalReviews: sanadOffices.totalReviews,
    })
    .from(sanadOffices)
    .leftJoin(bookings, eq(bookings.officeId, sanadOffices.id))
    .where(
      and(
        eq(sanadOffices.status, "active"),
        or(
          isNull(bookings.createdAt),
          and(
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        )
      )
    )
    .groupBy(sanadOffices.id, sanadOffices.officeName, sanadOffices.governorate, sanadOffices.averageRating, sanadOffices.totalReviews)
    .orderBy(desc(sql`totalBookings`))
    .limit(limit);

  return results.map(r => ({
    ...r,
    completionRate: r.totalBookings > 0 ? ((r.completedBookings / r.totalBookings) * 100).toFixed(1) : "0",
  }));
}

/**
 * Get user growth statistics
 */
export async function getUserGrowthStats(params: {
  startDate: Date;
  endDate: Date;
  groupBy: "day" | "week" | "month";
}) {
  const db = await getDb();
  if (!db) return [];

  const { startDate, endDate, groupBy } = params;

  const dateFormat = {
    day: "%Y-%m-%d",
    week: "%Y-%u",
    month: "%Y-%m",
  }[groupBy];

  const results = await db
    .select({
      period: sql<string>`DATE_FORMAT(${users.createdAt}, ${dateFormat})`.as('period'),
      newUsers: sql<number>`COUNT(*)`.as('newUsers'),
    })
    .from(users)
    .where(and(gte(users.createdAt, startDate), lte(users.createdAt, endDate)))
    .groupBy(sql`period`)
    .orderBy(sql`period`);

  return results;
}

/**
 * Get revenue breakdown by governorate
 */
export async function getRevenueByGovernorate(params: {
  startDate: Date;
  endDate: Date;
}) {
  const db = await getDb();
  if (!db) return [];

  const { startDate, endDate } = params;

  const results = await db
    .select({
      governorate: sanadOffices.governorate,
      totalRevenue: sql<string>`SUM(CASE WHEN ${bookings.status} = 'completed' THEN COALESCE(${bookings.price}, 0) ELSE 0 END)`.as('totalRevenue'),
      totalBookings: sql<number>`COUNT(${bookings.id})`.as('totalBookings'),
      completedBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'completed' THEN 1 ELSE 0 END)`.as('completedBookings'),
    })
    .from(sanadOffices)
    .leftJoin(bookings, eq(bookings.officeId, sanadOffices.id))
    .where(
      and(
        eq(sanadOffices.status, "active"),
        or(
          isNull(bookings.createdAt),
          and(
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        )
      )
    )
    .groupBy(sanadOffices.governorate)
    .orderBy(desc(sql`totalRevenue`));

  return results;
}

/**
 * Get platform health metrics
 */
export async function getPlatformHealthMetrics() {
  const db = await getDb();
  if (!db) return {
    totalUsers: 0,
    activeOffices: 0,
    pendingOffices: 0,
    totalBookings: 0,
    completedBookings: 0,
  };

  const [userCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users);

  const [officeStats] = await db
    .select({
      active: sql<number>`SUM(CASE WHEN ${sanadOffices.status} = 'active' THEN 1 ELSE 0 END)`,
      pending: sql<number>`SUM(CASE WHEN ${sanadOffices.status} = 'pending' THEN 1 ELSE 0 END)`,
    })
    .from(sanadOffices);

  const [bookingStats] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      completed: sql<number>`SUM(CASE WHEN ${bookings.status} = 'completed' THEN 1 ELSE 0 END)`,
    })
    .from(bookings);

  return {
    totalUsers: userCount?.count || 0,
    activeOffices: officeStats?.active || 0,
    pendingOffices: officeStats?.pending || 0,
    totalBookings: bookingStats?.total || 0,
    completedBookings: bookingStats?.completed || 0,
  };
}


// ============================================================================
// Office Owner Functions
// ============================================================================

export async function getOfficesByOwner(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(sanadOffices)
    .where(eq(sanadOffices.ownerId, ownerId));
}

export async function getOfficeBookingsForOwner(officeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      id: bookings.id,
      userId: bookings.userId,
      customerName: users.name,
      customerEmail: users.email,
      customerPhone: users.phone,
      scheduledDate: bookings.scheduledDate,
      scheduledTime: bookings.scheduledTime,
      status: bookings.status,
      serviceDescription: bookings.serviceDescription,
      price: bookings.price,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(eq(bookings.officeId, officeId))
    .orderBy(desc(bookings.createdAt));
}

export async function toggleOfficeStatus(
  officeId: number,
  isAvailable: boolean
) {
  const db = await getDb();
  if (!db) return null;
  
  await db
    .update(sanadOffices)
    .set({ 
      status: isAvailable ? "active" : "inactive",
      updatedAt: new Date()
    })
    .where(eq(sanadOffices.id, officeId));
    
  return { success: true };
}

export async function getOwnerOfficeMetrics(officeId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [metrics] = await db
    .select({
      totalBookings: sql<number>`count(${bookings.id})`,
      completedBookings: sql<number>`sum(case when ${bookings.status} = 'completed' then 1 else 0 end)`,
      pendingBookings: sql<number>`sum(case when ${bookings.status} = 'pending' then 1 else 0 end)`,
      cancelledBookings: sql<number>`sum(case when ${bookings.status} = 'cancelled' then 1 else 0 end)`,
      totalRevenue: sql<number>`sum(case when ${bookings.status} = 'completed' then ${bookings.price} else 0 end)`,
    })
    .from(bookings)
    .where(eq(bookings.officeId, officeId));
    
  const [reviewMetrics] = await db
    .select({
      totalReviews: sql<number>`count(${reviews.id})`,
      averageRating: sql<number>`avg(${reviews.rating})`,
    })
    .from(reviews)
    .where(eq(reviews.officeId, officeId));
    
  return {
    ...metrics,
    ...reviewMetrics,
    completionRate: metrics.totalBookings > 0 
      ? ((metrics.completedBookings / metrics.totalBookings) * 100).toFixed(1)
      : "0",
  };
}

export async function addOwnerResponseToReview(
  reviewId: number,
  response: string
) {
  const db = await getDb();
  if (!db) return null;
  
  await db
    .update(reviews)
    .set({ 
      responseText: response,
      respondedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(reviews.id, reviewId));
    
  return { success: true };
}


export async function getReviewById(reviewId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);
    
  return review || null;
}


// ============================================================================
// DOCUMENT TEMPLATE MANAGEMENT (Extended)
// ============================================================================

export async function createDocumentTemplateByOwner(data: {
  templateName: string;
  templateNameAr?: string;
  category: string;
  description?: string;
  templateContent: string;
  variables?: any;
  language?: string;
  isOfficial?: boolean;
  isPremium?: boolean;
  price?: string;
  fileUrl?: string;
  fileKey?: string;
  fileSize?: number;
  mimeType?: string;
  createdBy: number;
  officeId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(documentTemplates).values(data as any);
  return result.insertId;
}

export async function updateDocumentTemplateByOwner(id: number, data: Partial<{
  templateName: string;
  templateNameAr: string;
  category: string;
  description: string;
  templateContent: string;
  variables: any;
  price: string;
  fileUrl: string;
  fileKey: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(documentTemplates).set(data).where(eq(documentTemplates.id, id));
}

export async function deleteDocumentTemplateByOwner(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(documentTemplates).where(eq(documentTemplates.id, id));
}

export async function getDocumentTemplatesByOfficeId(officeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(documentTemplates)
    .where(eq(documentTemplates.createdBy, officeId))
    .orderBy(desc(documentTemplates.createdAt));
}

export async function trackTemplateDownload(templateId: number, userId: number, metadata?: {
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) return;
  
  const { templateDownloads } = await import("../drizzle/schema");
  
  // Record download
  await db.insert(templateDownloads).values({
    templateId,
    userId,
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
  } as any);
  
  // Increment usage count
  await db.update(documentTemplates)
    .set({ usageCount: sql`${documentTemplates.usageCount} + 1` })
    .where(eq(documentTemplates.id, templateId));
}

export async function getTemplateDownloadStats(templateId: number) {
  const db = await getDb();
  if (!db) return { totalDownloads: 0, uniqueUsers: 0 };
  
  const { templateDownloads } = await import("../drizzle/schema");
  
  const downloads = await db.select({
    totalDownloads: sql<number>`COUNT(*)`,
    uniqueUsers: sql<number>`COUNT(DISTINCT ${templateDownloads.userId})`,
  })
  .from(templateDownloads)
  .where(eq(templateDownloads.templateId, templateId));
  
  return downloads[0] || { totalDownloads: 0, uniqueUsers: 0 };
}

// ============================================================================
// CHAT SYSTEM
// ============================================================================

export async function createChatConversation(data: {
  userId: number;
  officeId: number;
  bookingId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { chatConversations } = await import("../drizzle/schema");
  
  // Check if conversation already exists
  const existing = await db.select().from(chatConversations)
    .where(and(
      eq(chatConversations.userId, data.userId),
      eq(chatConversations.officeId, data.officeId),
      eq(chatConversations.status, "active")
    ))
    .limit(1);
    
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  const [result] = await db.insert(chatConversations).values(data as any);
  return result.insertId;
}

export async function getChatConversationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { chatConversations } = await import("../drizzle/schema");
  
  const [conversation] = await db.select().from(chatConversations)
    .where(eq(chatConversations.id, id))
    .limit(1);
    
  return conversation || null;
}

export async function getUserChatConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { chatConversations } = await import("../drizzle/schema");
  
  return await db.select({
    conversation: chatConversations,
    office: sanadOffices,
  })
  .from(chatConversations)
  .leftJoin(sanadOffices, eq(chatConversations.officeId, sanadOffices.id))
  .where(eq(chatConversations.userId, userId))
  .orderBy(desc(chatConversations.lastMessageAt));
}

export async function getOfficeChatConversations(officeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { chatConversations } = await import("../drizzle/schema");
  
  return await db.select({
    conversation: chatConversations,
    user: users,
  })
  .from(chatConversations)
  .leftJoin(users, eq(chatConversations.userId, users.id))
  .where(eq(chatConversations.officeId, officeId))
  .orderBy(desc(chatConversations.lastMessageAt));
}

export async function createChatMessage(data: {
  conversationId: number;
  senderId: number;
  senderType: "user" | "office";
  message: string;
  messageType?: "text" | "file" | "system";
  fileUrl?: string;
  fileName?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { chatMessages, chatConversations } = await import("../drizzle/schema");
  
  const [result] = await db.insert(chatMessages).values(data as any);
  
  // Update conversation last message
  if (data.senderType === "office") {
    await db.update(chatConversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: data.message.substring(0, 255),
        unreadByUser: sql`${chatConversations.unreadByUser} + 1`,
      })
      .where(eq(chatConversations.id, data.conversationId));
  } else {
    await db.update(chatConversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: data.message.substring(0, 255),
        unreadByOffice: sql`${chatConversations.unreadByOffice} + 1`,
      })
      .where(eq(chatConversations.id, data.conversationId));
  }
    
  return result.insertId;
}

export async function getChatMessages(conversationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const { chatMessages } = await import("../drizzle/schema");
  
  return await db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}

export async function markMessagesAsRead(conversationId: number, readerType: "user" | "office") {
  const db = await getDb();
  if (!db) return;
  
  const { chatConversations } = await import("../drizzle/schema");
  
  if (readerType === "user") {
    await db.update(chatConversations)
      .set({ unreadByUser: 0 })
      .where(eq(chatConversations.id, conversationId));
  } else {
    await db.update(chatConversations)
      .set({ unreadByOffice: 0 })
      .where(eq(chatConversations.id, conversationId));
  }
}

// Chat message search
export async function searchChatMessages(params: {
  userId: number;
  query: string;
  conversationId?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const { chatMessages, chatConversations } = await import("../drizzle/schema");
  const { userId, query, conversationId, startDate, endDate } = params;

  let conditions: any[] = [
    like(chatMessages.message, `%${query}%`),
  ];

  if (conversationId) {
    conditions.push(eq(chatMessages.conversationId, conversationId));
  }

  if (startDate) {
    conditions.push(gte(chatMessages.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(chatMessages.createdAt, endDate));
  }

  // Get conversations where user is the participant
  const userConversations = await db
    .select({ id: chatConversations.id })
    .from(chatConversations)
    .where(eq(chatConversations.userId, userId));

  const conversationIds = userConversations.map(c => c.id);

  if (conversationIds.length > 0) {
    // Only search in user's conversations
    const conversationCondition = or(
      ...conversationIds.map(id => eq(chatMessages.conversationId, id))
    );
    if (conversationCondition) {
      conditions.push(conversationCondition);
    }
  } else {
    // No conversations, return empty
    return [];
  }

  const results = await db
    .select()
    .from(chatMessages)
    .where(and(...conditions))
    .orderBy(desc(chatMessages.createdAt))
    .limit(100);

  return results;
}

// Chat analytics
export async function getChatAnalytics(params: {
  officeId?: number;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const { chatConversations, chatMessages } = await import("../drizzle/schema");
  const { officeId, userId, startDate, endDate } = params;

  let conditions: any[] = [];

  if (officeId) {
    conditions.push(eq(chatConversations.officeId, officeId));
  }

  if (userId) {
    conditions.push(eq(chatConversations.userId, userId));
  }

  if (startDate) {
    conditions.push(gte(chatConversations.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(chatConversations.createdAt, endDate));
  }

  // Get total conversations
  const conversationsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(chatConversations)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const totalConversations = conversationsResult[0]?.count || 0;

  // Get closed conversations (status = 'closed')
  const closedResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(chatConversations)
    .where(
      conditions.length > 0
        ? and(...conditions, eq(chatConversations.status, "closed"))
        : eq(chatConversations.status, "closed")
    );

  const closedConversations = closedResult[0]?.count || 0;

  // Get average response time (time between user message and next office message)
  // This is a simplified calculation - in production you'd want more sophisticated logic
  const avgResponseResult = await db
    .select({
      avgMinutes: sql<number>`AVG(TIMESTAMPDIFF(MINUTE, ${chatMessages.createdAt}, 
        (SELECT MIN(m2.created_at) FROM chat_messages m2 
         WHERE m2.conversation_id = ${chatMessages.conversationId} 
         AND m2.sender_type = 'office' 
         AND m2.created_at > ${chatMessages.createdAt})))`,
    })
    .from(chatMessages)
    .where(eq(chatMessages.senderType, "user"));

  const avgResponseTimeMinutes = avgResponseResult[0]?.avgMinutes || 0;

  // Get busiest hours (messages per hour)
  const busiestHoursResult = await db
    .select({
      hour: sql<number>`HOUR(${chatMessages.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(chatMessages)
    .groupBy(sql`HOUR(${chatMessages.createdAt})`)
    .orderBy(desc(sql`count(*)`))
    .limit(24);

  return {
    totalConversations,
    closedConversations,
    resolutionRate: totalConversations > 0 ? (closedConversations / totalConversations) * 100 : 0,
    avgResponseTimeMinutes: Math.round(avgResponseTimeMinutes),
    busiestHours: busiestHoursResult,
  };
}

// Template Variable Processing
export async function processTemplateVariables(
  template: string,
  context: {
    customerName?: string;
    officeName?: string;
    staffName?: string;
    userId?: number;
    officeId?: number;
  }
): Promise<string> {
  let processed = template;
  
  // Replace customer name
  if (context.customerName) {
    processed = processed.replace(/\{\{customer_name\}\}/gi, context.customerName);
  } else if (context.userId) {
    const db = await getDb();
    if (db) {
      const { users } = await import("../drizzle/schema");
      const user = await db.select().from(users).where(eq(users.id, context.userId)).limit(1);
      if (user[0]?.name) {
        processed = processed.replace(/\{\{customer_name\}\}/gi, user[0].name);
      }
    }
  }
  
  // Replace office name
  if (context.officeName) {
    processed = processed.replace(/\{\{office_name\}\}/gi, context.officeName);
  } else if (context.officeId) {
    const db = await getDb();
    if (db) {
      const { sanadOffices } = await import("../drizzle/schema");
      const office = await db.select().from(sanadOffices).where(eq(sanadOffices.id, context.officeId)).limit(1);
      if (office[0]?.officeName) {
        processed = processed.replace(/\{\{office_name\}\}/gi, office[0].officeName);
      }
    }
  }
  
  // Replace staff name
  if (context.staffName) {
    processed = processed.replace(/\{\{staff_name\}\}/gi, context.staffName);
  }
  
  // Replace date and time
  const now = new Date();
  processed = processed.replace(/\{\{date\}\}/gi, now.toLocaleDateString());
  processed = processed.replace(/\{\{time\}\}/gi, now.toLocaleTimeString());
  
  return processed;
}

// Canned Responses
export async function getCannedResponsesByOffice(officeId: number, category?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const { cannedResponses } = await import("../drizzle/schema");
  
  if (category) {
    return await db
      .select()
      .from(cannedResponses)
      .where(and(
        eq(cannedResponses.officeId, officeId),
        eq(cannedResponses.category, category as any)
      ))
      .orderBy(desc(cannedResponses.createdAt));
  }
  
  return await db
    .select()
    .from(cannedResponses)
    .where(eq(cannedResponses.officeId, officeId))
    .orderBy(desc(cannedResponses.createdAt));
}

export async function createCannedResponse(data: {
  officeId: number;
  title: string;
  content: string;
  shortcut?: string;
  category: "greeting" | "faq" | "closing" | "pricing" | "hours" | "services" | "general";
}) {
  const db = await getDb();
  if (!db) return null;
  
  const { cannedResponses } = await import("../drizzle/schema");
  
  const [response] = await db
    .insert(cannedResponses)
    .values(data)
    .$returningId();
  
  return response;
}

export async function updateCannedResponse(id: number, data: {
  title?: string;
  content?: string;
  shortcut?: string;
  category?: "greeting" | "faq" | "closing" | "pricing" | "hours" | "services" | "general";
}) {
  const db = await getDb();
  if (!db) return null;
  
  const { cannedResponses } = await import("../drizzle/schema");
  
  await db
    .update(cannedResponses)
    .set(data)
    .where(eq(cannedResponses.id, id));
  
  return { id };
}

export async function deleteCannedResponse(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { cannedResponses } = await import("../drizzle/schema");
  
  await db
    .delete(cannedResponses)
    .where(eq(cannedResponses.id, id));
  
  return { id };
}

// Office Staff
export async function getOfficeStaff(officeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { officeStaff, users } = await import("../drizzle/schema");
  
  return await db
    .select({
      id: officeStaff.id,
      userId: officeStaff.userId,
      userName: users.name,
      userEmail: users.email,
      role: officeStaff.role,
      isActive: officeStaff.isActive,
      createdAt: officeStaff.createdAt,
    })
    .from(officeStaff)
    .leftJoin(users, eq(officeStaff.userId, users.id))
    .where(and(
      eq(officeStaff.officeId, officeId),
      eq(officeStaff.isActive, true)
    ))
    .orderBy(desc(officeStaff.createdAt));
}

export async function addOfficeStaff(data: {
  officeId: number;
  userId: number;
  role: "owner" | "manager" | "agent";
}) {
  const db = await getDb();
  if (!db) return null;
  
  const { officeStaff } = await import("../drizzle/schema");
  
  const [staff] = await db
    .insert(officeStaff)
    .values(data)
    .$returningId();
  
  return staff;
}

export async function updateOfficeStaff(staffId: number, data: {
  role?: "owner" | "manager" | "agent";
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const { officeStaff } = await import("../drizzle/schema");
  
  await db
    .update(officeStaff)
    .set(data)
    .where(eq(officeStaff.id, staffId));
  
  return { id: staffId };
}

export async function removeOfficeStaff(staffId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { officeStaff } = await import("../drizzle/schema");
  
  // Soft delete by setting isActive to false
  await db
    .update(officeStaff)
    .set({ isActive: false })
    .where(eq(officeStaff.id, staffId));
  
  return { id: staffId };
}

export async function updateStaffAvailability(staffId: number, status: "online" | "offline" | "busy") {
  const db = await getDb();
  if (!db) return null;
  
  const { officeStaff } = await import("../drizzle/schema");
  
  await db
    .update(officeStaff)
    .set({ 
      availabilityStatus: status,
      lastActiveAt: new Date(),
    })
    .where(eq(officeStaff.id, staffId));
  
  return { id: staffId, status };
}

export async function getAvailableStaff(officeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { officeStaff, users } = await import("../drizzle/schema");
  
  return await db
    .select({
      id: officeStaff.id,
      userId: officeStaff.userId,
      userName: users.name,
      userEmail: users.email,
      role: officeStaff.role,
      availabilityStatus: officeStaff.availabilityStatus,
      expertiseTags: officeStaff.expertiseTags,
    })
    .from(officeStaff)
    .leftJoin(users, eq(officeStaff.userId, users.id))
    .where(and(
      eq(officeStaff.officeId, officeId),
      eq(officeStaff.isActive, true),
      eq(officeStaff.availabilityStatus, "online")
    ))
    .orderBy(desc(officeStaff.lastActiveAt));
}

export async function getStaffWorkload(officeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { officeStaff, chatAssignments, chatConversations } = await import("../drizzle/schema");
  
  // Get all active staff
  const staff = await db
    .select({
      staffId: officeStaff.id,
      userId: officeStaff.userId,
    })
    .from(officeStaff)
    .where(and(
      eq(officeStaff.officeId, officeId),
      eq(officeStaff.isActive, true)
    ));
  
  // Count active conversations per staff member
  const workload = await Promise.all(
    staff.map(async (s) => {
      const assignments = await db
        .select({ count: sql<number>`count(*)` })
        .from(chatAssignments)
        .leftJoin(chatConversations, eq(chatAssignments.conversationId, chatConversations.id))
        .where(and(
          eq(chatAssignments.assignedToUserId, s.userId),
          eq(chatConversations.status, "active")
        ));
      
      return {
        staffId: s.staffId,
        userId: s.userId,
        activeConversations: assignments[0]?.count || 0,
      };
    })
  );
  
  return workload;
}

export async function getStaffPerformanceMetrics(officeId: number, staffUserId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { officeStaff, chatAssignments, chatMessages, chatConversations, users, chatRatings } = await import("../drizzle/schema");
  
  // Get staff members to analyze
  const staffQuery = db
    .select({
      staffId: officeStaff.id,
      userId: officeStaff.userId,
      userName: users.name,
      userEmail: users.email,
      role: officeStaff.role,
    })
    .from(officeStaff)
    .leftJoin(users, eq(officeStaff.userId, users.id))
    .where(and(
      eq(officeStaff.officeId, officeId),
      eq(officeStaff.isActive, true),
      staffUserId ? eq(officeStaff.userId, staffUserId) : sql`1=1`
    ));
  
  const staff = await staffQuery;
  
  // Calculate metrics for each staff member
  const metrics = await Promise.all(
    staff.map(async (s) => {
      // Get all assigned conversations
      const assignments = await db
        .select({
          conversationId: chatAssignments.conversationId,
          assignedAt: chatAssignments.assignedAt,
          status: chatConversations.status,
        })
        .from(chatAssignments)
        .leftJoin(chatConversations, eq(chatAssignments.conversationId, chatConversations.id))
        .where(eq(chatAssignments.assignedToUserId, s.userId));
      
      const totalConversations = assignments.length;
      const activeConversations = assignments.filter(a => a.status === "active").length;
      const closedConversations = assignments.filter(a => a.status === "closed").length;
      
      // Calculate average response time
      let totalResponseTime = 0;
      let responseCount = 0;
      
      for (const assignment of assignments) {
        const messages = await db
          .select({
            createdAt: chatMessages.createdAt,
            senderType: chatMessages.senderType,
          })
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, assignment.conversationId))
          .orderBy(chatMessages.createdAt);
        
        // Find pairs of user message followed by office response
        for (let i = 0; i < messages.length - 1; i++) {
          if (messages[i].senderType === "user" && messages[i + 1].senderType === "office") {
            const responseTime = new Date(messages[i + 1].createdAt).getTime() - new Date(messages[i].createdAt).getTime();
            totalResponseTime += responseTime;
            responseCount++;
          }
        }
      }
      
      const avgResponseTimeMs = responseCount > 0 ? totalResponseTime / responseCount : 0;
      const avgResponseTimeMinutes = Math.round(avgResponseTimeMs / 1000 / 60);
      
      // Calculate resolution rate (closed / total)
      const resolutionRate = totalConversations > 0 
        ? Math.round((closedConversations / totalConversations) * 100) 
        : 0;
      
      // Calculate average satisfaction score
      const ratings = await db
        .select()
        .from(chatRatings)
        .where(eq(chatRatings.staffUserId, s.userId));
      
      const avgSatisfaction = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : null;
      
      return {
        staffId: s.staffId,
        userId: s.userId,
        userName: s.userName || s.userEmail || "Unknown",
        role: s.role,
        totalConversations,
        activeConversations,
        closedConversations,
        avgResponseTimeMinutes,
        resolutionRate,
        avgSatisfaction: avgSatisfaction ? parseFloat(avgSatisfaction) : null,
        totalRatings: ratings.length,
      };
    })
  );
  
  return metrics;
}

export async function getStaffPerformanceTrends(officeId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const { officeStaff, chatAssignments, chatMessages, chatConversations, users, chatRatings } = await import("../drizzle/schema");
  
  // Calculate start date
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get staff members
  const staff = await db
    .select({
      userId: officeStaff.userId,
      userName: users.name,
    })
    .from(officeStaff)
    .leftJoin(users, eq(officeStaff.userId, users.id))
    .where(and(
      eq(officeStaff.officeId, officeId),
      eq(officeStaff.isActive, true)
    ));
  
  // Generate daily data points
  const trends = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Calculate metrics for this day
    let totalResponseTime = 0;
    let responseCount = 0;
    let totalConversations = 0;
    let closedConversations = 0;
    
    for (const s of staff) {
      // Get assignments for this day
      const assignments = await db
        .select({
          conversationId: chatAssignments.conversationId,
          status: chatConversations.status,
        })
        .from(chatAssignments)
        .leftJoin(chatConversations, eq(chatAssignments.conversationId, chatConversations.id))
        .where(and(
          eq(chatAssignments.assignedToUserId, s.userId),
          sql`${chatAssignments.assignedAt} >= ${date}`,
          sql`${chatAssignments.assignedAt} < ${nextDate}`
        ));
      
      totalConversations += assignments.length;
      closedConversations += assignments.filter(a => a.status === "closed").length;
      
      // Calculate response times for this day
      for (const assignment of assignments) {
        const messages = await db
          .select({
            createdAt: chatMessages.createdAt,
            senderType: chatMessages.senderType,
          })
          .from(chatMessages)
          .where(and(
            eq(chatMessages.conversationId, assignment.conversationId),
            sql`${chatMessages.createdAt} >= ${date}`,
            sql`${chatMessages.createdAt} < ${nextDate}`
          ))
          .orderBy(chatMessages.createdAt);
        
        // Find pairs of user message followed by office response
        for (let j = 0; j < messages.length - 1; j++) {
          if (messages[j].senderType === "user" && messages[j + 1].senderType === "office") {
            const responseTime = new Date(messages[j + 1].createdAt).getTime() - new Date(messages[j].createdAt).getTime();
            totalResponseTime += responseTime;
            responseCount++;
          }
        }
      }
    }
    
    const avgResponseTimeMinutes = responseCount > 0 ? Math.round(totalResponseTime / responseCount / 1000 / 60) : 0;
    const resolutionRate = totalConversations > 0 ? Math.round((closedConversations / totalConversations) * 100) : 0;
    
    trends.push({
      date: date.toISOString().split('T')[0],
      avgResponseTime: avgResponseTimeMinutes,
      resolutionRate,
      totalConversations,
    });
  }
  
  return trends;
}

// Chat Tags
export async function updateConversationTags(conversationId: number, tags: string[]) {
  const db = await getDb();
  if (!db) return null;
  
  const { chatConversations } = await import("../drizzle/schema");
  
  // Use raw SQL to update JSON field
  await db.execute(
    sql`UPDATE ${chatConversations} SET tags = ${JSON.stringify(tags)} WHERE id = ${conversationId}`
  );
  
  return { conversationId, tags };
}

export async function getConversationsByTags(officeId: number, tags: string[]) {
  const db = await getDb();
  if (!db) return [];
  
  const { chatConversations } = await import("../drizzle/schema");
  
  // Get all conversations for the office
  const conversations = await db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.officeId, officeId));
  
  // Filter conversations that have at least one of the requested tags
  return conversations.filter((conv: any) => {
    const convTags = (conv.tags as string[]) || [];
    return tags.some(tag => convTags.includes(tag));
  });
}

// Close conversation
export async function closeConversation(conversationId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { chatConversations } = await import("../drizzle/schema");
  
  await db
    .update(chatConversations)
    .set({ status: "closed" })
    .where(eq(chatConversations.id, conversationId));
  
  return { id: conversationId };
}

// Chat Transfer
export async function createChatTransfer(data: {
  conversationId: number;
  fromUserId: number;
  toUserId: number;
  contextNotes?: string;
  isEscalation: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const { chatTransferHistory, chatAssignments } = await import("../drizzle/schema");
  
  // Create transfer record
  await db.insert(chatTransferHistory).values({
    conversationId: data.conversationId,
    fromUserId: data.fromUserId,
    toUserId: data.toUserId,
    contextNotes: data.contextNotes,
    isEscalation: data.isEscalation,
  });
  
  // Update assignment
  await db
    .update(chatAssignments)
    .set({ assignedToUserId: data.toUserId })
    .where(eq(chatAssignments.conversationId, data.conversationId));
  
  return { success: true };
}

export async function getTransferHistory(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { chatTransferHistory, users } = await import("../drizzle/schema");
  
  const transfers = await db
    .select({
      id: chatTransferHistory.id,
      conversationId: chatTransferHistory.conversationId,
      fromUserId: chatTransferHistory.fromUserId,
      toUserId: chatTransferHistory.toUserId,
      contextNotes: chatTransferHistory.contextNotes,
      isEscalation: chatTransferHistory.isEscalation,
      transferredAt: chatTransferHistory.transferredAt,
      fromUserName: sql<string>`from_user.name`,
      toUserName: sql<string>`to_user.name`,
    })
    .from(chatTransferHistory)
    .leftJoin(sql`${users} as from_user`, eq(chatTransferHistory.fromUserId, sql`from_user.id`))
    .leftJoin(sql`${users} as to_user`, eq(chatTransferHistory.toUserId, sql`to_user.id`))
    .where(eq(chatTransferHistory.conversationId, conversationId))
    .orderBy(desc(chatTransferHistory.transferredAt));
  
  return transfers;
}

// Chat Ratings
export async function getSatisfactionTrends(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const { chatRatings, chatAssignments, officeStaff, users } = await import("../drizzle/schema");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get daily satisfaction scores grouped by date
  const trends = await db
    .select({
      date: sql<string>`DATE(${chatRatings.createdAt})`,
      avgRating: sql<number>`AVG(${chatRatings.rating})`,
      totalRatings: sql<number>`COUNT(${chatRatings.id})`,
    })
    .from(chatRatings)
    .where(gte(chatRatings.createdAt, startDate))
    .groupBy(sql`DATE(${chatRatings.createdAt})`)
    .orderBy(sql`DATE(${chatRatings.createdAt})`);
  
  return trends;
}

export async function createChatRating(data: {
  conversationId: number;
  rating: number;
  feedback?: string;
  staffUserId?: number;
  userId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const { chatRatings } = await import("../drizzle/schema");
  
  const [rating] = await db
    .insert(chatRatings)
    .values(data)
    .$returningId();
  
  return rating;
}

export async function getChatRatingByConversation(conversationId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { chatRatings } = await import("../drizzle/schema");
  
  const [rating] = await db
    .select()
    .from(chatRatings)
    .where(eq(chatRatings.conversationId, conversationId));
  
  return rating;
}

export async function getStaffRatings(staffUserId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { chatRatings } = await import("../drizzle/schema");
  
  return await db
    .select()
    .from(chatRatings)
    .where(eq(chatRatings.staffUserId, staffUserId));
}

export async function getAverageStaffRating(staffUserId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const ratings = await getStaffRatings(staffUserId);
  if (ratings.length === 0) return 0;
  
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return sum / ratings.length;
}

// Chat Assignments
export async function assignConversation(data: {
  conversationId: number;
  assignedToUserId: number;
  assignedByUserId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const { chatAssignments } = await import("../drizzle/schema");
  
  const [assignment] = await db
    .insert(chatAssignments)
    .values(data)
    .$returningId();
  
  return assignment;
}

export async function getConversationAssignment(conversationId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { chatAssignments, users } = await import("../drizzle/schema");
  
  const [assignment] = await db
    .select({
      id: chatAssignments.id,
      conversationId: chatAssignments.conversationId,
      assignedToUserId: chatAssignments.assignedToUserId,
      assignedToUserName: users.name,
      assignedByUserId: chatAssignments.assignedByUserId,
      assignedAt: chatAssignments.assignedAt,
    })
    .from(chatAssignments)
    .leftJoin(users, eq(chatAssignments.assignedToUserId, users.id))
    .where(eq(chatAssignments.conversationId, conversationId))
    .orderBy(desc(chatAssignments.assignedAt))
    .limit(1);
  
  return assignment;
}

export async function getAssignedConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { chatAssignments, chatConversations } = await import("../drizzle/schema");
  
  return await db
    .select({
      conversationId: chatAssignments.conversationId,
      assignedAt: chatAssignments.assignedAt,
      conversation: chatConversations,
    })
    .from(chatAssignments)
    .leftJoin(chatConversations, eq(chatAssignments.conversationId, chatConversations.id))
    .where(eq(chatAssignments.assignedToUserId, userId))
    .orderBy(desc(chatAssignments.assignedAt));
}


// ============================================================================
// CHAT FILE ATTACHMENTS
// ============================================================================

export async function uploadChatAttachment(file: Buffer, fileName: string, mimeType: string) {
  const { storagePut } = await import("./storage");
  
  // Generate unique file key
  const fileExtension = fileName.split('.').pop();
  const uniqueKey = `chat-attachments/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
  
  // Upload to S3
  const { url } = await storagePut(uniqueKey, file, mimeType);
  
  return {
    fileUrl: url,
    fileKey: uniqueKey,
    fileName,
  };
}

export async function sendFileMessage(data: {
  conversationId: number;
  senderId: number;
  senderType: "user" | "office";
  fileUrl: string;
  fileName: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { chatMessages, chatConversations } = await import("../drizzle/schema");
  
  const [message] = await db
    .insert(chatMessages)
    .values({
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderType: data.senderType,
      message: `Sent a file: ${data.fileName}`,
      messageType: "file",
      fileUrl: data.fileUrl,
      fileName: data.fileName,
    })
    .$returningId();
  
  // Update conversation's last message
  await db
    .update(chatConversations)
    .set({
      lastMessageAt: new Date(),
      lastMessagePreview: `📎 ${data.fileName}`,
    })
    .where(eq(chatConversations.id, data.conversationId));
  
  return message;
}

// Chat Export
export async function getConversationsForExport(filters: {
  officeId: number;
  startDate?: string;
  endDate?: string;
  staffUserId?: number;
  tags?: string[];
  status?: "active" | "closed" | "archived";
}) {
  const db = await getDb();
  if (!db) return [];

  const { chatConversations, chatAssignments, chatMessages } = await import("../drizzle/schema");

  // Build base query
  let query = db
    .select({
      id: chatConversations.id,
      status: chatConversations.status,
      tags: chatConversations.tags,
      createdAt: chatConversations.createdAt,
      lastMessageAt: chatConversations.lastMessageAt,
      customerName: users.name,
      customerEmail: users.email,
      assignedStaffName: sql<string>`(SELECT name FROM user WHERE id = ${chatAssignments.assignedToUserId})`,
      messageCount: sql<number>`(SELECT COUNT(*) FROM chat_messages WHERE conversation_id = ${chatConversations.id})`,
      resolutionTimeHours: sql<number>`CASE WHEN ${chatConversations.status} = 'closed' THEN TIMESTAMPDIFF(HOUR, ${chatConversations.createdAt}, ${chatConversations.lastMessageAt}) ELSE NULL END`,
    })
    .from(chatConversations)
    .leftJoin(users, eq(chatConversations.userId, users.id))
    .leftJoin(chatAssignments, eq(chatConversations.id, chatAssignments.conversationId));

  // Apply filters
  const conditions: any[] = [eq(chatConversations.officeId, filters.officeId)];

  if (filters.startDate) {
    conditions.push(gte(chatConversations.createdAt, new Date(filters.startDate)));
  }

  if (filters.endDate) {
    conditions.push(lte(chatConversations.createdAt, new Date(filters.endDate)));
  }

  if (filters.staffUserId) {
    conditions.push(eq(chatAssignments.assignedToUserId, filters.staffUserId));
  }

  if (filters.status) {
    conditions.push(eq(chatConversations.status, filters.status));
  }

  const results = await query.where(and(...conditions));

  // Filter by tags if provided (since tags is a JSON field)
  if (filters.tags && filters.tags.length > 0) {
    return results.filter((conv: any) => {
      if (!conv.tags) return false;
      const convTags = typeof conv.tags === 'string' ? JSON.parse(conv.tags) : conv.tags;
      return filters.tags!.some(tag => convTags.includes(tag));
    });
  }

  return results;
}


// Update user language preference
export async function updateUserLanguagePreference(userId: number, language: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update language preference: database not available");
    return;
  }

  try {
    await db
      .update(users)
      .set({ preferredLanguage: language })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update language preference:", error);
    throw error;
  }
}


// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export async function updateUserNotificationPreferences(
  userId: number,
  preferences: {
    email: boolean;
    sms: boolean;
    confirmations: boolean;
    reminders: boolean;
    marketing: boolean;
  }
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update notification preferences: database not available");
    return;
  }

  try {
    await db
      .update(users)
      .set({ notificationPreferences: preferences })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update notification preferences:", error);
    throw error;
  }
}


// ============================================================================
// TRANSLATION MANAGEMENT
// ============================================================================

export async function updateOfficeTranslation(
  officeId: number,
  translations: { officeNameAr?: string; descriptionAr?: string },
  metadata?: {
    changedBy?: number;
    changedByName?: string;
    source?: "manual" | "bulk_import" | "request_approval" | "auto_translate";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current values for version history
  const [office] = await db
    .select()
    .from(sanadOffices)
    .where(eq(sanadOffices.id, officeId))
    .limit(1);

  if (!office) throw new Error("Office not found");

  // Save version history and add to translation memory if metadata provided
  if (metadata?.changedBy && metadata?.changedByName) {
    if (translations.officeNameAr !== undefined && translations.officeNameAr !== office.officeNameAr) {
      await saveTranslationVersion({
        entityType: "office",
        entityId: officeId,
        fieldName: "nameAr",
        oldValue: office.officeNameAr,
        newValue: translations.officeNameAr,
        changedBy: metadata.changedBy,
        changedByName: metadata.changedByName,
        source: metadata.source,
      });

      // Add to translation memory
      if (office.officeName && translations.officeNameAr) {
        await addToTranslationMemory({
          sourceText: office.officeName,
          translatedText: translations.officeNameAr,
          context: "office_name",
          createdBy: metadata.changedBy,
        });
      }
    }

    if (translations.descriptionAr !== undefined && translations.descriptionAr !== office.descriptionAr) {
      await saveTranslationVersion({
        entityType: "office",
        entityId: officeId,
        fieldName: "descriptionAr",
        oldValue: office.descriptionAr,
        newValue: translations.descriptionAr,
        changedBy: metadata.changedBy,
        changedByName: metadata.changedByName,
        source: metadata.source,
      });

      // Add to translation memory (split into sentences)
      if (office.description && translations.descriptionAr) {
        const sourceSentences = office.description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const translatedSentences = translations.descriptionAr.split(/[.!?؟]+/).filter(s => s.trim().length > 10);
        
        const pairCount = Math.min(sourceSentences.length, translatedSentences.length, 5);
        for (let i = 0; i < pairCount; i++) {
          await addToTranslationMemory({
            sourceText: sourceSentences[i].trim(),
            translatedText: translatedSentences[i].trim(),
            context: "office_description",
            createdBy: metadata.changedBy,
          });
        }
      }
    }
  }

  await db
    .update(sanadOffices)
    .set(translations)
    .where(eq(sanadOffices.id, officeId));
}

export async function updateTemplateTranslation(
  templateId: number,
  translations: { templateNameAr?: string; descriptionAr?: string },
  metadata?: {
    changedBy?: number;
    changedByName?: string;
    source?: "manual" | "bulk_import" | "request_approval" | "auto_translate";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current values for version history
  const [template] = await db
    .select()
    .from(documentTemplates)
    .where(eq(documentTemplates.id, templateId))
    .limit(1);

  if (!template) throw new Error("Template not found");

  // Save version history and add to translation memory if metadata provided
  if (metadata?.changedBy && metadata?.changedByName) {
    if (translations.templateNameAr !== undefined && translations.templateNameAr !== template.templateNameAr) {
      await saveTranslationVersion({
        entityType: "template",
        entityId: templateId,
        fieldName: "nameAr",
        oldValue: template.templateNameAr,
        newValue: translations.templateNameAr,
        changedBy: metadata.changedBy,
        changedByName: metadata.changedByName,
        source: metadata.source,
      });

      // Add to translation memory
      if (template.templateName && translations.templateNameAr) {
        await addToTranslationMemory({
          sourceText: template.templateName,
          translatedText: translations.templateNameAr,
          context: "template_name",
          createdBy: metadata.changedBy,
        });
      }
    }

    if (translations.descriptionAr !== undefined && translations.descriptionAr !== template.descriptionAr) {
      await saveTranslationVersion({
        entityType: "template",
        entityId: templateId,
        fieldName: "descriptionAr",
        oldValue: template.descriptionAr,
        newValue: translations.descriptionAr,
        changedBy: metadata.changedBy,
        changedByName: metadata.changedByName,
        source: metadata.source,
      });

      // Add to translation memory (split into sentences)
      if (template.description && translations.descriptionAr) {
        const sourceSentences = template.description.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const translatedSentences = translations.descriptionAr.split(/[.!?؟]+/).filter(s => s.trim().length > 10);
        
        const pairCount = Math.min(sourceSentences.length, translatedSentences.length, 5);
        for (let i = 0; i < pairCount; i++) {
          await addToTranslationMemory({
            sourceText: sourceSentences[i].trim(),
            translatedText: translatedSentences[i].trim(),
            context: "template_description",
            createdBy: metadata.changedBy,
          });
        }
      }
    }
  }

  await db
    .update(documentTemplates)
    .set(translations)
    .where(eq(documentTemplates.id, templateId));
}

// ============================================================================
// TRANSLATION REQUESTS & WORKFLOW
// ============================================================================

export async function createTranslationRequest(data: {
  entityType: "office" | "template";
  entityId: number;
  requesterId: number;
  requesterName: string;
  requesterEmail?: string;
  currentNameEn: string;
  currentDescriptionEn?: string;
  proposedNameAr?: string;
  proposedDescriptionAr?: string;
  notes?: string;
  priority?: "low" | "medium" | "high";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(translationRequests).values(data as any);
  return result.insertId;
}

export async function getTranslationRequestById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(translationRequests)
    .where(eq(translationRequests.id, id))
    .limit(1);
  
  return result[0] || null;
}

export async function listTranslationRequests(filters: {
  status?: "pending" | "approved" | "rejected" | "completed";
  entityType?: "office" | "template";
  requesterId?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(translationRequests);

  const conditions = [];
  if (filters.status) {
    conditions.push(eq(translationRequests.status, filters.status));
  }
  if (filters.entityType) {
    conditions.push(eq(translationRequests.entityType, filters.entityType));
  }
  if (filters.requesterId) {
    conditions.push(eq(translationRequests.requesterId, filters.requesterId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const requests = await query
    .orderBy(desc(translationRequests.createdAt))
    .limit(filters.limit || 50)
    .offset(filters.offset || 0);

  return requests;
}

export async function updateTranslationRequestStatus(
  id: number,
  status: "pending" | "approved" | "rejected" | "completed",
  reviewedBy: number,
  reviewNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(translationRequests)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date(),
      reviewNotes,
    })
    .where(eq(translationRequests.id, id));
}

export async function completeTranslationRequest(
  id: number,
  completedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(translationRequests)
    .set({
      status: "completed",
      completedBy,
      completedAt: new Date(),
    })
    .where(eq(translationRequests.id, id));
}

export async function getPendingTranslationRequestsCount(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(translationRequests)
    .where(eq(translationRequests.status, "pending"));

  return result[0]?.count || 0;
}

// ============================================================================
// TRANSLATION ACTIVITY LOG
// ============================================================================

export async function logTranslationActivity(data: {
  entityType: "office" | "template";
  entityId: number;
  entityName: string;
  translatorId: number;
  translatorName: string;
  actionType: "created" | "updated" | "bulk_import";
  fieldChanged?: string;
  previousValue?: string;
  newValue?: string;
  source?: "manual" | "bulk_import" | "request_approval";
  requestId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(translationActivityLog).values(data as any);
}

export async function getTranslationActivityLog(filters: {
  entityType?: "office" | "template";
  entityId?: number;
  translatorId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(translationActivityLog);

  const conditions = [];
  if (filters.entityType) {
    conditions.push(eq(translationActivityLog.entityType, filters.entityType));
  }
  if (filters.entityId) {
    conditions.push(eq(translationActivityLog.entityId, filters.entityId));
  }
  if (filters.translatorId) {
    conditions.push(eq(translationActivityLog.translatorId, filters.translatorId));
  }
  if (filters.startDate) {
    conditions.push(gte(translationActivityLog.createdAt, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(translationActivityLog.createdAt, filters.endDate));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const activities = await query
    .orderBy(desc(translationActivityLog.createdAt))
    .limit(filters.limit || 100)
    .offset(filters.offset || 0);

  return activities;
}

export async function getTranslatorLeaderboard(params: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];
  if (params.startDate) {
    conditions.push(gte(translationActivityLog.createdAt, params.startDate));
  }
  if (params.endDate) {
    conditions.push(lte(translationActivityLog.createdAt, params.endDate));
  }

  let query = db
    .select({
      translatorId: translationActivityLog.translatorId,
      translatorName: translationActivityLog.translatorName,
      totalTranslations: sql<number>`count(*)`,
      officeTranslations: sql<number>`sum(case when ${translationActivityLog.entityType} = 'office' then 1 else 0 end)`,
      templateTranslations: sql<number>`sum(case when ${translationActivityLog.entityType} = 'template' then 1 else 0 end)`,
      lastActivity: sql<Date>`max(${translationActivityLog.createdAt})`,
    })
    .from(translationActivityLog);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const leaderboard = await query
    .groupBy(translationActivityLog.translatorId, translationActivityLog.translatorName)
    .orderBy(sql`count(*) desc`)
    .limit(params.limit || 10);

  return leaderboard;
}

export async function getTranslationCompletionTrends(params: {
  startDate: Date;
  endDate: Date;
  groupBy?: "day" | "week" | "month";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const groupByFormat = params.groupBy === "month" ? "%Y-%m" : 
                        params.groupBy === "week" ? "%Y-%U" : "%Y-%m-%d";

  // Use raw SQL to avoid GROUP BY issues with Drizzle
  const query = `
    SELECT 
      DATE_FORMAT(createdAt, '${groupByFormat}') as period,
      COUNT(*) as totalTranslations,
      SUM(CASE WHEN entityType = 'office' THEN 1 ELSE 0 END) as officeTranslations,
      SUM(CASE WHEN entityType = 'template' THEN 1 ELSE 0 END) as templateTranslations,
      COUNT(DISTINCT translatorId) as uniqueTranslators
    FROM translation_activity_log
    WHERE createdAt >= ? AND createdAt <= ?
    GROUP BY DATE_FORMAT(createdAt, '${groupByFormat}')
    ORDER BY period
  `;

  const [rows] = await (db as any).execute(query, [
    params.startDate,
    params.endDate,
  ]);

  return rows as Array<{
    period: string;
    totalTranslations: number;
    officeTranslations: number;
    templateTranslations: number;
    uniqueTranslators: number;
  }>;
}

export async function getRecentTranslationActivity(limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const activities = await db
    .select()
    .from(translationActivityLog)
    .orderBy(desc(translationActivityLog.createdAt))
    .limit(limit);

  return activities;
}


// ============================================================================
// TRANSLATION MEMORY FUNCTIONS
// ============================================================================

/**
 * Add a translation to memory
 */
export async function addToTranslationMemory(params: {
  sourceText: string;
  translatedText: string;
  context?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if this exact translation already exists
  const existing = await db
    .select()
    .from(translationMemory)
    .where(
      and(
        eq(translationMemory.sourceText, params.sourceText),
        eq(translationMemory.translatedText, params.translatedText)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update usage count
    await db
      .update(translationMemory)
      .set({
        usageCount: existing[0].usageCount + 1,
        lastUsedAt: new Date(),
      })
      .where(eq(translationMemory.id, existing[0].id));
    
    return existing[0].id;
  }

  // Insert new translation memory entry
  const [result] = await db.insert(translationMemory).values({
    sourceText: params.sourceText,
    translatedText: params.translatedText,
    context: params.context,
    usageCount: 1,
    lastUsedAt: new Date(),
    createdBy: params.createdBy,
  });

  return result.insertId;
}

/**
 * Find similar translations using basic text similarity
 */
export async function findSimilarTranslations(params: {
  sourceText: string;
  context?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const limit = params.limit || 5;
  
  // Simple similarity: find translations with matching words
  // For production, consider using full-text search or Levenshtein distance
  const words = params.sourceText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  if (words.length === 0) {
    return [];
  }

  // Build LIKE conditions for each significant word
  const likeConditions = words.map(word => 
    sql`LOWER(${translationMemory.sourceText}) LIKE ${`%${word}%`}`
  );

  let query = db
    .select()
    .from(translationMemory)
    .orderBy(desc(translationMemory.usageCount), desc(translationMemory.lastUsedAt))
    .limit(limit);

  // Add context filter if provided
  if (params.context) {
    query = query.where(
      and(
        eq(translationMemory.context, params.context),
        or(...likeConditions)
      )
    ) as any;
  } else {
    query = query.where(or(...likeConditions)) as any;
  }

  const results = await query;

  // Calculate simple similarity score (number of matching words)
  return results.map(result => {
    const resultWords = result.sourceText.toLowerCase().split(/\s+/);
    const matchingWords = words.filter(w => resultWords.some(rw => rw.includes(w)));
    const similarityScore = matchingWords.length / words.length;

    return {
      ...result,
      similarityScore,
    };
  }).sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Get translation memory statistics
 */
export async function getTranslationMemoryStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [stats] = await db
    .select({
      totalEntries: sql<number>`COUNT(*)`,
      totalUsage: sql<number>`SUM(${translationMemory.usageCount})`,
      avgUsage: sql<number>`AVG(${translationMemory.usageCount})`,
    })
    .from(translationMemory);

  return stats || { totalEntries: 0, totalUsage: 0, avgUsage: 0 };
}

// ============================================================================
// TRANSLATION VERSION HISTORY FUNCTIONS
// ============================================================================

/**
 * Save a translation version before updating
 */
export async function saveTranslationVersion(params: {
  entityType: "office" | "template";
  entityId: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string;
  changedBy: number;
  changedByName: string;
  changeReason?: string;
  source?: "manual" | "bulk_import" | "request_approval" | "auto_translate";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(translationVersions).values({
    entityType: params.entityType,
    entityId: params.entityId,
    fieldName: params.fieldName,
    oldValue: params.oldValue,
    newValue: params.newValue,
    changedBy: params.changedBy,
    changedByName: params.changedByName,
    changeReason: params.changeReason,
    source: params.source || "manual",
  });
}

/**
 * Get version history for an entity
 */
export async function getTranslationVersionHistory(params: {
  entityType: "office" | "template";
  entityId: number;
  fieldName?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [
    eq(translationVersions.entityType, params.entityType),
    eq(translationVersions.entityId, params.entityId),
  ];

  if (params.fieldName) {
    conditions.push(eq(translationVersions.fieldName, params.fieldName));
  }

  let query = db
    .select()
    .from(translationVersions)
    .where(and(...conditions))
    .orderBy(desc(translationVersions.createdAt));

  if (params.limit) {
    query = query.limit(params.limit) as any;
  }

  return await query;
}

/**
 * Rollback to a specific version
 */
export async function rollbackToVersion(versionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the version
  const [version] = await db
    .select()
    .from(translationVersions)
    .where(eq(translationVersions.id, versionId))
    .limit(1);

  if (!version) {
    throw new Error("Version not found");
  }

  // Apply the rollback based on entity type
  if (version.entityType === "office") {
    const updateData: any = {};
    if (version.fieldName === "nameAr") {
      updateData.officeNameAr = version.oldValue;
    } else if (version.fieldName === "descriptionAr") {
      updateData.descriptionAr = version.oldValue;
    }

    await db
      .update(sanadOffices)
      .set(updateData)
      .where(eq(sanadOffices.id, version.entityId));
  } else if (version.entityType === "template") {
    const updateData: any = {};
    if (version.fieldName === "nameAr") {
      updateData.templateNameAr = version.oldValue;
    } else if (version.fieldName === "descriptionAr") {
      updateData.descriptionAr = version.oldValue;
    }

    await db
      .update(documentTemplates)
      .set(updateData)
      .where(eq(documentTemplates.id, version.entityId));
  }

  return version;
}

