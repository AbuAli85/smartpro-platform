/**
 * Request Messaging Database Helpers
 * Handles message CRUD operations for service requests
 */

import { getDb } from "./db";
import { requestMessages, type InsertRequestMessage } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Send a message in a service request
 */
export async function sendMessage(data: InsertRequestMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(requestMessages).values(data);
  // Fetch the inserted message
  const insertId = Number(result[0].insertId);
  const [message] = await db
    .select()
    .from(requestMessages)
    .where(eq(requestMessages.id, insertId))
    .limit(1);
  return message;
}

/**
 * Get all messages for a service request
 */
export async function getRequestMessages(requestId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(requestMessages)
    .where(eq(requestMessages.requestId, requestId))
    .orderBy(requestMessages.createdAt);
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(requestMessages)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(requestMessages.id, messageId));
  // Fetch the updated message
  const [updated] = await db
    .select()
    .from(requestMessages)
    .where(eq(requestMessages.id, messageId))
    .limit(1);
  return updated;
}

/**
 * Mark all messages in a request as read for a specific user
 */
export async function markAllMessagesAsRead(requestId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(requestMessages)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(requestMessages.requestId, requestId),
        eq(requestMessages.senderId, userId)
      )
    );
}

/**
 * Get unread message count for a request
 */
export async function getUnreadMessageCount(requestId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const messages = await db
    .select()
    .from(requestMessages)
    .where(
      and(
        eq(requestMessages.requestId, requestId),
        eq(requestMessages.isRead, false)
      )
    );
  
  // Count messages NOT sent by the user (messages they need to read)
  return messages.filter((m: any) => m.senderId !== userId).length;
}

/**
 * Get latest message for a request
 */
export async function getLatestMessage(requestId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [latest] = await db
    .select()
    .from(requestMessages)
    .where(eq(requestMessages.requestId, requestId))
    .orderBy(desc(requestMessages.createdAt))
    .limit(1);
  return latest;
}

/**
 * Get unread message counts for all user's requests
 * Returns a map of requestId -> unread count
 */
export async function getUnreadCountsForUserRequests(userId: number, requestIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (requestIds.length === 0) {
    return {};
  }
  
  // Get all unread messages for these requests
  const messages = await db
    .select()
    .from(requestMessages)
    .where(
      and(
        eq(requestMessages.isRead, false)
      )
    );
  
  // Filter to only messages in the user's requests and not sent by them
  const relevantMessages = messages.filter((m: any) => 
    requestIds.includes(m.requestId) && m.senderId !== userId
  );
  
  // Count by requestId
  const counts: Record<number, number> = {};
  for (const message of relevantMessages) {
    counts[message.requestId] = (counts[message.requestId] || 0) + 1;
  }
  
  return counts;
}

/**
 * Delete a message (soft delete - just mark as deleted)
 */
export async function deleteMessage(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(requestMessages).where(eq(requestMessages.id, messageId));
}
