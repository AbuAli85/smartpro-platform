import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

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
    socket.on("send_message", (data: {
      bookingId: number;
      userId: number;
      userName: string;
      message: string;
    }) => {
      const room = `booking_${data.bookingId}`;
      const messageData = {
        ...data,
        timestamp: new Date().toISOString(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      // Broadcast to all users in the room (including sender)
      io?.to(room).emit("new_message", messageData);
      console.log(`[Socket.IO] Message sent in room ${room}`);
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
