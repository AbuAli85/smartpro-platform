import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Minimize2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface ChatWidgetProps {
  officeId: number;
  officeName: string;
}

interface Message {
  id: number;
  senderId: number;
  senderType: "user" | "office";
  message: string;
  createdAt: Date;
}

export default function ChatWidget({ officeId, officeName }: ChatWidgetProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationId, setConversationId] = useState<number | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get or create conversation
  const { data: conversation } = trpc.chat.getOrCreateConversation.useQuery(
    { officeId },
    { enabled: isOpen && !!user }
  );

  // Get messages
  const { data: chatMessages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  );

  // Get unread count
  const { data: unreadData } = trpc.chat.getUnreadCount.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 30000 } // Poll every 30s
  );

  useEffect(() => {
    if (unreadData) {
      setUnreadCount(unreadData.count);
    }
  }, [unreadData]);

  useEffect(() => {
    if (conversation) {
      // Handle both direct ID and nested conversation object
      const id = typeof conversation === 'number' ? conversation : conversation.conversation?.id;
      setConversationId(id);
    }
  }, [conversation]);

  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
      scrollToBottom();
    }
  }, [chatMessages]);

  // Initialize Socket.io
  useEffect(() => {
    if (!isOpen || !user || !conversationId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(window.location.origin, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Chat] Connected to socket");
      socket.emit("join_chat", { bookingId: conversationId, userId: user.id });
    });

    socket.on("new_message", (data: any) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        senderId: data.userId,
        senderType: data.userId === user.id ? "user" : "office",
        message: data.message,
        createdAt: new Date(data.timestamp),
      }]);
      scrollToBottom();
      
      // Update unread count if minimized
      if (isMinimized && data.userId !== user.id) {
        setUnreadCount(prev => prev + 1);
      }
    });

    socket.on("user_typing", (data: any) => {
      if (data.userId !== user.id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    socket.on("user_stop_typing", (data: any) => {
      if (data.userId !== user.id) {
        setIsTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_chat", { bookingId: conversationId, userId: user.id });
        socketRef.current.disconnect();
      }
    };
  }, [isOpen, user, conversationId, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !socketRef.current || !user) return;

    socketRef.current.emit("send_message", {
      bookingId: conversationId,
      userId: user.id,
      userName: user.name,
      message: message.trim(),
    });

    setMessage("");
    
    // Stop typing indicator
    socketRef.current.emit("stop_typing", {
      bookingId: conversationId,
      userId: user.id,
    });
  };

  const handleTyping = () => {
    if (!socketRef.current || !user) return;

    socketRef.current.emit("typing", {
      bookingId: conversationId,
      userId: user.id,
      userName: user.name,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", {
        bookingId: conversationId,
        userId: user.id,
      });
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpen = () => {
    if (!user) {
      toast.error("Please login to chat with the office");
      return;
    }
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-96 shadow-2xl z-50 transition-all ${isMinimized ? "h-14" : "h-[500px]"} flex flex-col`}>
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <CardTitle className="text-base">{officeName}</CardTitle>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleMinimize}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Start a conversation with {officeName}</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 ${
                      msg.senderType === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="p-4 border-t">
            <div className="flex gap-2 w-full">
              <Input
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
