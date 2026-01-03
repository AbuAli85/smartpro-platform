/**
 * Database helper functions for Client Management System
 */

import { getDb } from "./db";
import { clients, clientDocuments, clientNotes } from "../drizzle/schema";
import { eq, and, or, like, desc, asc, sql } from "drizzle-orm";

// ============================================================================
// CLIENT CRUD OPERATIONS
// ============================================================================

export async function createClient(data: {
  officeId: number;
  userId?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  dateOfBirth?: string;
  nationalId?: string;
  notes?: string;
  tags?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(clients).values({
    ...data,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    status: "active",
    totalBookings: 0,
    totalSpent: "0.00",
  });
  return result.insertId;
}

export async function getClientById(clientId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId));
  
  if (client && client.tags) {
    return {
      ...client,
      tags: typeof client.tags === 'string' ? JSON.parse(client.tags) : client.tags,
    };
  }
  
  return client;
}

export async function getClientsByOffice(
  officeId: number,
  filters?: {
    search?: string;
    status?: 'active' | 'inactive' | 'blocked';
    tags?: string[];
    limit?: number;
    offset?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(clients).where(eq(clients.officeId, officeId));

  // Apply filters
  const conditions = [eq(clients.officeId, officeId)];

  if (filters?.status) {
    conditions.push(eq(clients.status, filters.status));
  }

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        like(clients.name, searchTerm),
        like(clients.email, searchTerm),
        like(clients.phone, searchTerm)
      )!
    );
  }

  const results = await db
    .select()
    .from(clients)
    .where(and(...conditions))
    .orderBy(desc(clients.createdAt))
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);

  // Parse tags JSON
  return results.map(client => ({
    ...client,
    tags: client.tags ? (typeof client.tags === 'string' ? JSON.parse(client.tags) : client.tags) : [],
  }));
}

export async function updateClient(
  clientId: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    region?: string;
    dateOfBirth?: string;
    nationalId?: string;
    notes?: string;
    tags?: string[];
    status?: 'active' | 'inactive' | 'blocked';
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { ...data };
  if (data.tags) {
    updateData.tags = JSON.stringify(data.tags);
  }

  await db
    .update(clients)
    .set(updateData)
    .where(eq(clients.id, clientId));

  return true;
}

export async function deleteClient(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clients).where(eq(clients.id, clientId));
  return true;
}

export async function updateClientStats(clientId: number, stats: {
  totalBookings?: number;
  totalSpent?: string;
  lastBookingDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(clients)
    .set(stats)
    .where(eq(clients.id, clientId));
  return true;
}

// ============================================================================
// CLIENT DOCUMENTS
// ============================================================================

export async function addClientDocument(data: {
  clientId: number;
  officeId: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
  fileSize?: number;
  mimeType?: string;
  expiryDate?: string;
  notes?: string;
  uploadedBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(clientDocuments).values(data);
  return result.insertId;
}

export async function getClientDocuments(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(clientDocuments)
    .where(eq(clientDocuments.clientId, clientId))
    .orderBy(desc(clientDocuments.createdAt));
}

export async function getDocumentsByOffice(officeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(clientDocuments)
    .where(eq(clientDocuments.officeId, officeId))
    .orderBy(desc(clientDocuments.createdAt));
}

export async function deleteClientDocument(documentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clientDocuments).where(eq(clientDocuments.id, documentId));
  return true;
}

export async function getExpiringDocuments(officeId: number, daysAhead: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return await db
    .select()
    .from(clientDocuments)
    .where(
      and(
        eq(clientDocuments.officeId, officeId),
        sql`${clientDocuments.expiryDate} IS NOT NULL`,
        sql`${clientDocuments.expiryDate} <= ${futureDate.toISOString().split('T')[0]}`
      )
    )
    .orderBy(asc(clientDocuments.expiryDate));
}

// ============================================================================
// CLIENT NOTES
// ============================================================================

export async function addClientNote(data: {
  clientId: number;
  officeId: number;
  note: string;
  createdBy: number;
  createdByName: string;
  isImportant?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(clientNotes).values({
    ...data,
    isImportant: data.isImportant ? 1 : 0,
  });
  return result.insertId;
}

export async function getClientNotes(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(clientNotes)
    .where(eq(clientNotes.clientId, clientId))
    .orderBy(desc(clientNotes.createdAt));
}

export async function updateClientNote(noteId: number, data: {
  note?: string;
  isImportant?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = {};
  if (data.note !== undefined) updateData.note = data.note;
  if (data.isImportant !== undefined) updateData.isImportant = data.isImportant ? 1 : 0;

  await db
    .update(clientNotes)
    .set(updateData)
    .where(eq(clientNotes.id, noteId));

  return true;
}

export async function deleteClientNote(noteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clientNotes).where(eq(clientNotes.id, noteId));
  return true;
}

// ============================================================================
// CLIENT HISTORY & ANALYTICS
// ============================================================================

export async function getClientHistory(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Get all bookings for this client
  const { bookings } = await import("../drizzle/schema");
  
  const clientBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, clientId))
    .orderBy(desc(bookings.createdAt));

  return {
    bookings: clientBookings,
  };
}

export async function getClientStats(officeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select({
      totalClients: sql<number>`COUNT(*)`,
      activeClients: sql<number>`SUM(CASE WHEN ${clients.status} = 'active' THEN 1 ELSE 0 END)`,
      totalRevenue: sql<string>`SUM(${clients.totalSpent})`,
      avgBookingsPerClient: sql<string>`AVG(${clients.totalBookings})`,
    })
    .from(clients)
    .where(eq(clients.officeId, officeId));

  return result[0] || {
    totalClients: 0,
    activeClients: 0,
    totalRevenue: "0.00",
    avgBookingsPerClient: "0.00",
  };
}

export async function searchClients(officeId: number, searchTerm: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const term = `%${searchTerm}%`;
  
  return await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.officeId, officeId),
        or(
          like(clients.name, term),
          like(clients.email, term),
          like(clients.phone, term),
          like(clients.nationalId, term)
        )!
      )
    )
    .orderBy(desc(clients.totalBookings))
    .limit(20);
}

export async function getTopClients(officeId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(clients)
    .where(eq(clients.officeId, officeId))
    .orderBy(desc(clients.totalSpent))
    .limit(limit);
}

export async function getRecentClients(officeId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(clients)
    .where(eq(clients.officeId, officeId))
    .orderBy(desc(clients.createdAt))
    .limit(limit);
}
