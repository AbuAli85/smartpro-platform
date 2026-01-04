/**
 * Database helper functions for Oman-specific features
 */

import { getDb } from "./db.js";
import { successStories, regulations, governorates, userComplianceChecklists } from "../drizzle/schema";
import { eq, and, desc, asc, sql, like, or } from "drizzle-orm";

// SUCCESS STORIES
export async function getAllSuccessStories(filters?: {
  governorate?: string;
  industry?: string;
  featured?: boolean;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let query = db.select().from(successStories);
  const conditions = [];
  
  if (filters?.governorate) conditions.push(eq(successStories.governorate, filters.governorate));
  if (filters?.industry) conditions.push(eq(successStories.industry, filters.industry));
  if (filters?.featured !== undefined) conditions.push(eq(successStories.featured, filters.featured ? 1 : 0));
  if (filters?.status) conditions.push(eq(successStories.status, filters.status as any));
  else conditions.push(eq(successStories.status, 'published'));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  query = query.orderBy(desc(successStories.featured), asc(successStories.displayOrder)) as any;
  
  if (filters?.limit) query = query.limit(filters.limit) as any;
  if (filters?.offset) query = query.offset(filters.offset) as any;
  
  return await query;
}

export async function getSuccessStoryById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [story] = await db.select().from(successStories).where(eq(successStories.id, id));
  
  if (story) {
    await db.update(successStories)
      .set({ viewCount: sql`${successStories.viewCount} + 1` })
      .where(eq(successStories.id, id));
  }
  
  return story;
}

export async function createSuccessStory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(successStories).values(data);
  return result;
}

export async function updateSuccessStory(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(successStories).set(data).where(eq(successStories.id, id));
  return await getSuccessStoryById(id);
}

export async function deleteSuccessStory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(successStories).where(eq(successStories.id, id));
  return { success: true };
}

export async function getFeaturedSuccessStories(limit: number = 3) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(successStories)
    .where(and(eq(successStories.status, 'published'), eq(successStories.featured, 1)))
    .orderBy(asc(successStories.displayOrder))
    .limit(limit);
}

export async function getSuccessStoriesByGovernorate(governorate: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(successStories)
    .where(and(eq(successStories.governorate, governorate), eq(successStories.status, 'published')))
    .orderBy(desc(successStories.publishedAt));
}

// REGULATIONS
export async function getAllRegulations(filters?: {
  category?: string;
  priority?: string;
  featured?: boolean;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let query = db.select().from(regulations);
  const conditions = [];
  
  if (filters?.category) conditions.push(eq(regulations.category, filters.category as any));
  if (filters?.priority) conditions.push(eq(regulations.priority, filters.priority as any));
  if (filters?.featured !== undefined) conditions.push(eq(regulations.featured, filters.featured ? 1 : 0));
  if (filters?.status) conditions.push(eq(regulations.status, filters.status as any));
  else conditions.push(eq(regulations.status, 'published'));
  
  if (filters?.search) {
    conditions.push(or(
      like(regulations.title, `%${filters.search}%`),
      like(regulations.titleAr, `%${filters.search}%`),
      like(regulations.summary, `%${filters.search}%`)
    )!);
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  query = query.orderBy(desc(regulations.featured), asc(regulations.displayOrder)) as any;
  
  if (filters?.limit) query = query.limit(filters.limit) as any;
  if (filters?.offset) query = query.offset(filters.offset) as any;
  
  return await query;
}

export async function getRegulationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [regulation] = await db.select().from(regulations).where(eq(regulations.id, id));
  
  if (regulation) {
    await db.update(regulations)
      .set({ viewCount: sql`${regulations.viewCount} + 1` })
      .where(eq(regulations.id, id));
  }
  
  return regulation;
}

export async function getRegulationBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [regulation] = await db.select().from(regulations).where(eq(regulations.slug, slug));
  
  if (regulation) {
    await db.update(regulations)
      .set({ viewCount: sql`${regulations.viewCount} + 1` })
      .where(eq(regulations.id, regulation.id));
  }
  
  return regulation;
}

export async function createRegulation(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(regulations).values(data);
  return result;
}

export async function updateRegulation(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(regulations).set(data).where(eq(regulations.id, id));
  return await getRegulationById(id);
}

export async function deleteRegulation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(regulations).where(eq(regulations.id, id));
  return { success: true };
}

export async function getFeaturedRegulations(limit: number = 5) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(regulations)
    .where(and(eq(regulations.status, 'published'), eq(regulations.featured, 1)))
    .orderBy(asc(regulations.displayOrder))
    .limit(limit);
}

export async function getRegulationsByCategory(category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(regulations)
    .where(and(eq(regulations.category, category as any), eq(regulations.status, 'published')))
    .orderBy(desc(regulations.priority), asc(regulations.displayOrder));
}

export async function getCriticalRegulations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(regulations)
    .where(and(eq(regulations.priority, 'critical'), eq(regulations.status, 'published')))
    .orderBy(asc(regulations.displayOrder));
}

// GOVERNORATES
export async function getAllGovernorates(filters?: {
  region?: string;
  featured?: boolean;
  status?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let query = db.select().from(governorates);
  const conditions = [];
  
  if (filters?.region) conditions.push(eq(governorates.region, filters.region as any));
  if (filters?.featured !== undefined) conditions.push(eq(governorates.featured, filters.featured ? 1 : 0));
  if (filters?.status) conditions.push(eq(governorates.status, filters.status as any));
  else conditions.push(eq(governorates.status, 'active'));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  query = query.orderBy(asc(governorates.displayOrder), asc(governorates.name)) as any;
  
  return await query;
}

export async function getGovernorateById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [governorate] = await db.select().from(governorates).where(eq(governorates.id, id));
  
  if (governorate) {
    await db.update(governorates)
      .set({ viewCount: sql`${governorates.viewCount} + 1` })
      .where(eq(governorates.id, id));
  }
  
  return governorate;
}

export async function getGovernorateBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [governorate] = await db.select().from(governorates).where(eq(governorates.slug, slug));
  
  if (governorate) {
    await db.update(governorates)
      .set({ viewCount: sql`${governorates.viewCount} + 1` })
      .where(eq(governorates.id, governorate.id));
  }
  
  return governorate;
}

export async function createGovernorate(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(governorates).values(data);
  return result;
}

export async function updateGovernorate(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(governorates).set(data).where(eq(governorates.id, id));
  return await getGovernorateById(id);
}

export async function deleteGovernorate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(governorates).where(eq(governorates.id, id));
  return { success: true };
}

// USER COMPLIANCE CHECKLISTS
export async function getUserComplianceChecklists(userId: number, officeId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [eq(userComplianceChecklists.userId, userId)];
  if (officeId) conditions.push(eq(userComplianceChecklists.officeId, officeId));
  
  return await db.select()
    .from(userComplianceChecklists)
    .where(and(...conditions))
    .orderBy(desc(userComplianceChecklists.updatedAt));
}

export async function getUserComplianceChecklistById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [checklist] = await db.select()
    .from(userComplianceChecklists)
    .where(eq(userComplianceChecklists.id, id));
  return checklist;
}

export async function createUserComplianceChecklist(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(userComplianceChecklists).values(data);
  return result;
}

export async function updateUserComplianceChecklist(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(userComplianceChecklists).set(data).where(eq(userComplianceChecklists.id, id));
  return await getUserComplianceChecklistById(id);
}

export async function deleteUserComplianceChecklist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(userComplianceChecklists).where(eq(userComplianceChecklists.id, id));
  return { success: true };
}

export async function getUserRegulationProgress(userId: number, regulationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [checklist] = await db.select()
    .from(userComplianceChecklists)
    .where(and(
      eq(userComplianceChecklists.userId, userId),
      eq(userComplianceChecklists.regulationId, regulationId)
    ));
  return checklist;
}

export async function getComplianceStatsByUser(userId: number) {
  const checklists = await getUserComplianceChecklists(userId);
  
  return {
    total: checklists.length,
    notStarted: checklists.filter(c => c.status === 'not_started').length,
    inProgress: checklists.filter(c => c.status === 'in_progress').length,
    completed: checklists.filter(c => c.status === 'completed').length,
    notApplicable: checklists.filter(c => c.status === 'not_applicable').length,
  };
}
