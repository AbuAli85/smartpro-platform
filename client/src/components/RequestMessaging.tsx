/**
 * RequestMessaging Component
 * Chat interface for service request communication between customers and offices
 */

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Paperclip, X, FileText, Image as ImageIcon, Download } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface RequestMessagingProps {
  requestId: number;
  senderType: "customer" | "office";
  className?: string;
}

export function RequestMessaging({ requestId, senderType, className }: RequestMessagingProps) {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages, isLoading, refetch } = trpc.requestMessaging.getMessages.useQuery(
    { requestId },
    { refetchInterval: 5000 } // Poll every 5 seconds for new messages
  );

  const sendMessageMutation = trpc.requestMessaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      setAttachments([]);
      refetch();
      scrollToBottom();
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  const uploadAttachmentMutation = trpc.requestMessaging.uploadAttachment.useMutation();

  const markAsReadMutation = trpc.requestMessaging.markAsRead.useMutation();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file size (max 10MB per file)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    setUploading(true);

    try {
      // Upload attachments first
      const uploadedAttachments = await Promise.all(
        attachments.map(async (file) => {
          const reader = new FileReader();
          const fileData = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });

          const base64Data = fileData.split(",")[1]; // Remove data:image/png;base64, prefix

          const result = await uploadAttachmentMutation.mutateAsync({
            requestId,
            filename: file.name,
            fileType: file.type,
            fileData: base64Data,
          });

          return result;
        })
      );

      // Send message with attachments
      await sendMessageMutation.mutateAsync({
        requestId,
        message: message.trim(),
        senderType,
        attachments: uploadedAttachments,
      });
    } catch (error: any) {
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#003366]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("serviceRequest.messages") || "Messages"}</span>
          <Badge variant="outline">{messages?.length || 0} messages</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Messages List */}
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
          {messages && messages.length > 0 ? (
            messages.map((msg: any) => {
              const isOwnMessage = msg.senderType === senderType;
              
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    isOwnMessage ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg p-3",
                      isOwnMessage
                        ? "bg-[#003366] text-white"
                        : "bg-white border border-gray-200"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Badge
                        variant={isOwnMessage ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {msg.senderType === "customer" ? "Customer" : "Office"}
                      </Badge>
                      <span className={cn(
                        "text-xs",
                        isOwnMessage ? "text-white/70" : "text-gray-500"
                      )}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.attachments.map((attachment: any, idx: number) => (
                          <a
                            key={idx}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center gap-2 p-2 rounded text-xs hover:opacity-80",
                              isOwnMessage
                                ? "bg-white/10"
                                : "bg-gray-100"
                            )}
                          >
                            {getFileIcon(attachment.fileType)}
                            <span className="flex-1 truncate">{attachment.filename}</span>
                            <Download className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>{t("serviceRequest.noMessages") || "No messages yet. Start the conversation!"}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Attachments ({attachments.length})</p>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sendMessageMutation.isPending}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("serviceRequest.typeMessage") || "Type your message..."}
            disabled={uploading || sendMessageMutation.isPending}
            className="flex-1"
          />

          <Button
            onClick={handleSendMessage}
            disabled={
              (!message.trim() && attachments.length === 0) ||
              uploading ||
              sendMessageMutation.isPending
            }
            className="bg-[#003366] hover:bg-[#002244]"
          >
            {uploading || sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
