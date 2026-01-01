import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import * as db from "../db";

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join a chat room (booking-specific)
    socket.on("join_chat", (data: { bookingId: number; userId: number }) => {
      const room = `booking_${data.bookingId}`;
      socket.join(room);
      console.log(`[Socket.IO] User ${data.userId} joined room: ${room}`);
      
      // Notify others in the room
      socket.to(room).emit("user_joined", {
        userId: data.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Send a message
    socket.on("send_message", async (data: {
      bookingId: number;
      userId: number;
      userName: string;
      message: string;
    }) => {
      const room = `booking_${data.bookingId}`;
      
      try {
        // Get conversation to determine sender type
        const conversation = await db.getChatConversationById(data.bookingId);
        if (!conversation) {
          console.error(`[Socket.IO] Conversation ${data.bookingId} not found`);
          return;
        }

        // Determine sender type
        const senderType = conversation.userId === data.userId ? "user" : "office";

        // Save message to database
        const savedMessage = await db.sendMessage({
          conversationId: data.bookingId,
          senderId: data.userId,
          senderType,
          message: data.message,
        });

        const messageData = {
          ...data,
          id: savedMessage.id,
          timestamp: savedMessage.createdAt.toISOString(),
          senderType,
        };

        // Broadcast to all users in the room (including sender)
        io?.to(room).emit("new_message", messageData);
        console.log(`[Socket.IO] Message saved and sent in room ${room}`);
      } catch (error) {
        console.error(`[Socket.IO] Error saving message:`, error);
      }
    });

    // Typing indicator
    socket.on("typing", (data: { bookingId: number; userId: number; userName: string }) => {
      const room = `booking_${data.bookingId}`;
      socket.to(room).emit("user_typing", data);
    });

    // Stop typing indicator
    socket.on("stop_typing", (data: { bookingId: number; userId: number }) => {
      const room = `booking_${data.bookingId}`;
      socket.to(room).emit("user_stop_typing", data);
    });

    // Leave chat room
    socket.on("leave_chat", (data: { bookingId: number; userId: number }) => {
      const room = `booking_${data.bookingId}`;
      socket.leave(room);
      console.log(`[Socket.IO] User ${data.userId} left room: ${room}`);
      
      socket.to(room).emit("user_left", {
        userId: data.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Marketplace: Join user-specific room for notifications
    socket.on("join_marketplace", (data: { userId: number }) => {
      const room = `user_${data.userId}`;
      socket.join(room);
      console.log(`[Socket.IO] User ${data.userId} joined marketplace room: ${room}`);
    });

    // Marketplace: Leave user-specific room
    socket.on("leave_marketplace", (data: { userId: number }) => {
      const room = `user_${data.userId}`;
      socket.leave(room);
      console.log(`[Socket.IO] User ${data.userId} left marketplace room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  console.log("[Socket.IO] WebSocket server initialized");
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Emit marketplace notification to a specific user
 */
export function emitMarketplaceNotification(userId: number, event: string, data: any) {
  if (!io) {
    console.warn("[Socket.IO] Cannot emit marketplace notification - io not initialized");
    return;
  }
  
  const room = `user_${userId}`;
  io.to(room).emit(event, data);
  console.log(`[Socket.IO] Emitted ${event} to user ${userId}`);
}

/**
 * Notify customer when new bid is received
 */
export function notifyNewBid(customerId: number, bidData: {
  requestId: number;
  requestTitle: string;
  officeName: string;
  price: string;
  estimatedDuration: string;
}) {
  emitMarketplaceNotification(customerId, "marketplace:new_bid", {
    type: "new_bid",
    message: `New bid received from ${bidData.officeName}`,
    ...bidData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify office when their bid is accepted
 */
export function notifyBidAccepted(officeOwnerId: number, bidData: {
  requestTitle: string;
  customerName: string;
  price: string;
}) {
  emitMarketplaceNotification(officeOwnerId, "marketplace:bid_accepted", {
    type: "bid_accepted",
    message: `Your bid for "${bidData.requestTitle}" was accepted!`,
    ...bidData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify matching offices when new service request is posted
 */
export function notifyNewServiceRequest(officeOwnerIds: number[], requestData: {
  requestId: number;
  title: string;
  serviceType: string;
  budget: string;
  deadline: string;
}) {
  if (!io) {
    console.warn("[Socket.IO] Cannot notify new service request - io not initialized");
    return;
  }

  officeOwnerIds.forEach((ownerId) => {
    emitMarketplaceNotification(ownerId, "marketplace:new_request", {
      type: "new_request",
      message: `New service request: ${requestData.title}`,
      ...requestData,
      timestamp: new Date().toISOString(),
    });
  });

  console.log(`[Socket.IO] Notified ${officeOwnerIds.length} offices about new request`);
}

/**
 * Notify user about new booking
 */
export function notifyNewBooking(userId: number, bookingData: {
  bookingId: number;
  officeName: string;
}) {
  emitMarketplaceNotification(userId, "booking:new", {
    ...bookingData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify user about booking status update
 */
export function notifyBookingUpdated(userId: number, bookingData: {
  bookingId: number;
  status: string;
}) {
  emitMarketplaceNotification(userId, "booking:updated", {
    ...bookingData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify user about new message
 */
export function notifyNewMessage(userId: number, messageData: {
  messageId: number;
  from: string;
  preview: string;
}) {
  emitMarketplaceNotification(userId, "message:new", {
    ...messageData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify office owner about office approval
 */
export function notifyOfficeApproved(ownerId: number, officeData: {
  officeId: number;
  officeName: string;
}) {
  emitMarketplaceNotification(ownerId, "office:approved", {
    ...officeData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify office owner about office rejection
 */
export function notifyOfficeRejected(ownerId: number, officeData: {
  officeId: number;
  officeName: string;
  reason: string;
}) {
  emitMarketplaceNotification(ownerId, "office:rejected", {
    ...officeData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify user about booking status change
 */
export function emitBookingStatusChanged(userId: number, bookingData: {
  bookingId: number;
  status: string;
  officeName: string;
  scheduledDate?: string;
  scheduledTime?: string;
}) {
  emitMarketplaceNotification(userId, "booking:status_changed", {
    type: "booking_status_changed",
    message: `Booking status updated to ${bookingData.status}`,
    ...bookingData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify user about document upload
 */
export function emitDocumentUploaded(userId: number, documentData: {
  bookingId: number;
  documentName: string;
  officeName: string;
}) {
  emitMarketplaceNotification(userId, "booking:document_uploaded", {
    type: "document_uploaded",
    message: `${documentData.officeName} uploaded a document: ${documentData.documentName}`,
    ...documentData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Emit chat message to specific booking room
 */
export function emitChatMessage(bookingId: number, messageData: {
  id: number;
  senderId: number;
  senderName: string;
  senderType: string;
  message: string;
  timestamp: string;
}) {
  if (!io) {
    console.warn("[Socket.IO] Cannot emit chat message - io not initialized");
    return;
  }
  
  const room = `booking_${bookingId}`;
  io.to(room).emit("new_message", messageData);
  console.log(`[Socket.IO] Emitted chat message to room ${room}`);
}
