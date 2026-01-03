import { Server as HttpServer } from "http";

/**
 * Socket.IO has been removed from this project.
 * This file contains stub implementations to prevent import errors.
 * Real-time features should be implemented using SSE or polling instead.
 */

export function initializeSocket(httpServer: HttpServer) {
  console.log("[Socket] Socket.IO removed - using SSE for real-time features");
  return null;
}

export function getIO() {
  return null;
}

// Stub functions for marketplace notifications
export function emitMarketplaceNotification(userId: number, event: string, data: any) {
  console.log(`[Socket] Stub: emitMarketplaceNotification - ${event} for user ${userId}`);
}

export function notifyNewBid(customerId: number, bidData: any) {
  console.log(`[Socket] Stub: notifyNewBid for customer ${customerId}`);
}

export function notifyBidAccepted(officeOwnerId: number, bidData: any) {
  console.log(`[Socket] Stub: notifyBidAccepted for office ${officeOwnerId}`);
}

export function notifyNewServiceRequest(officeOwnerIds: number[], requestData: any) {
  console.log(`[Socket] Stub: notifyNewServiceRequest for ${officeOwnerIds.length} offices`);
}

export function notifyNewBooking(userId: number, bookingData: any) {
  console.log(`[Socket] Stub: notifyNewBooking for user ${userId}`);
}

export function notifyBookingUpdated(userId: number, bookingData: any) {
  console.log(`[Socket] Stub: notifyBookingUpdated for user ${userId}`);
}

export function notifyNewMessage(userId: number, messageData: any) {
  console.log(`[Socket] Stub: notifyNewMessage for user ${userId}`);
}

export function notifyOfficeApproved(ownerId: number, officeData: any) {
  console.log(`[Socket] Stub: notifyOfficeApproved for owner ${ownerId}`);
}

export function notifyOfficeRejected(ownerId: number, officeData: any) {
  console.log(`[Socket] Stub: notifyOfficeRejected for owner ${ownerId}`);
}

export function emitBookingStatusChanged(userId: number, bookingData: any) {
  console.log(`[Socket] Stub: emitBookingStatusChanged for user ${userId}`);
}

export function emitDocumentUploaded(userId: number, documentData: any) {
  console.log(`[Socket] Stub: emitDocumentUploaded for user ${userId}`);
}

export function emitChatMessage(bookingId: number, messageData: any) {
  console.log(`[Socket] Stub: emitChatMessage for booking ${bookingId}`);
}
