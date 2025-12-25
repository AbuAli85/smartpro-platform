import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

interface Message {
  id: string;
  userId: number;
  userName: string;
  message: string;
  timestamp: string;
}

interface ChatBoxProps {
  bookingId: number;
  officeName: string;
}

export default function ChatBox({ bookingId, officeName }: ChatBoxProps) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return;

    const socketInstance = io(window.location.origin, {
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Connected to chat server");
      socketInstance.emit("join_chat", {
        bookingId,
        userId: user.id,
      });
    });

    socketInstance.on("new_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on("user_typing", (data: { userName: string }) => {
      setTypingUser(data.userName);
    });

    socketInstance.on("user_stop_typing", () => {
      setTypingUser(null);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit("leave_chat", {
        bookingId,
        userId: user.id,
      });
      socketInstance.disconnect();
    };
  }, [bookingId, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!socket || !user || !inputMessage.trim()) return;

    socket.emit("send_message", {
      bookingId,
      userId: user.id,
      userName: user.name || "User",
      message: inputMessage.trim(),
    });

    setInputMessage("");
    
    // Stop typing indicator
    socket.emit("stop_typing", {
      bookingId,
      userId: user.id,
    });
  };

  const handleTyping = () => {
    if (!socket || !user) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        bookingId,
        userId: user.id,
        userName: user.name || "User",
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop_typing", {
        bookingId,
        userId: user.id,
      });
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat with {officeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.userId === user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.userId === user.id
                      ? "bg-[#003366] text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1 opacity-75">
                    {msg.userName}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs mt-1 opacity-60">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          {typingUser && (
            <div className="text-sm text-gray-500 italic">
              {typingUser} is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
