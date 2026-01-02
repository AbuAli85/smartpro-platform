import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare, Send, User, Building2, Clock, CheckCheck, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CustomerChatInterfaceProps {
  officeId?: number;
  bookingId: number;
  officeId: number;
  officeName: string;
}

export function CustomerChatInterface({ bookingId, officeId, officeName }: CustomerChatInterfaceProps) {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages for this booking
  const { data: messages, refetch } = trpc.chat.getBookingMessages.useQuery(
    { bookingId },
    {
      refetchInterval: 5000, // Poll every 5 seconds for new messages
    }
  );

  const utils = trpc.useUtils();
  const sendMessageMutation = trpc.chat.sendBookingMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetch();
      utils.chat.getBookingMessages.invalidate({ bookingId });
      scrollToBottom();
    },
    onError: (error) => {
      toast.error(error.message || t("chat.sendError"));
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) {
      toast.error(t("chat.emptyMessage"));
      return;
    }

    sendMessageMutation.mutate({
      bookingId,
      message: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t("chat.title")}
        </CardTitle>
        <CardDescription>
          {t("chat.description")} <span className="font-medium">{officeName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages Container */}
        <div className="border rounded-lg bg-muted/30 h-[400px] overflow-y-auto p-4 space-y-3">
          {!messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{t("chat.noMessages")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("chat.startConversation")}</p>
            </div>
          ) : (
            <>
              {messages.map((msg: any) => {
                const isCustomer = msg.senderType === "customer";
                return (
                  <div
                    key={msg.id}
                    className={cn("flex gap-2", isCustomer ? "justify-end" : "justify-start")}
                  >
                    {!isCustomer && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg p-3 space-y-1",
                        isCustomer
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      <div
                        className={cn(
                          "flex items-center gap-2 text-xs",
                          isCustomer ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(msg.createdAt), "MMM d, HH:mm")}</span>
                        {isCustomer && msg.isRead && (
                          <CheckCheck className="h-3 w-3" />
                        )}
                        {isCustomer && !msg.isRead && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>

                    {isCustomer && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t("chat.placeholder")}
            rows={2}
            className="resize-none"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={sendMessageMutation.isPending || !message.trim()}
            size="icon"
            className="h-auto px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("chat.hint")}
        </p>
      </CardContent>
    </Card>
  );
}
