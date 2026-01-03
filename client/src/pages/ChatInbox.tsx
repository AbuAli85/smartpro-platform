import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, Search, Archive, CheckCheck, MessageSquareText, Paperclip, Download, FileIcon, UserPlus, Image as ImageIcon, Clock, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useSocket } from "@/contexts/SocketContext";
import { formatDistanceToNow } from "date-fns";
import { requestNotificationPermission, sendChatNotification, canSendNotifications } from "@/lib/notifications";
import { useLocation } from "wouter";
import { FileGallery } from "@/components/FileGallery";
import { AvailabilityToggle } from "@/components/AvailabilityToggle";
import { RatingModal } from "@/components/RatingModal";
import { TransferDialog } from "@/components/TransferDialog";
import { TransferHistory } from "@/components/TransferHistory";
import { ExportDialog } from "@/components/ExportDialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: number;
  senderId: number;
  senderType: "user" | "office";
  message: string;
  createdAt: string; // Database returns timestamp as string
  isRead: boolean;
  translatedText?: string;
  detectedLanguage?: string;
}

interface Conversation {
  conversation: {
    id: number;
    userId: number;
    officeId: number;
    status: "active" | "closed" | "archived";
    lastMessageAt: Date;
    lastMessagePreview: string | null;
    unreadByOffice: number;
  };
  office: {
    id: number;
    officeName: string;
  } | null;
}

function AssignmentDropdown({ conversationId }: { conversationId: number }) {
  const { data: userOffices } = trpc.officeOwner.getMyOffices.useQuery();
  const officeId = userOffices?.[0]?.id;
  
  const { data: staff } = trpc.chatAssignment.getOfficeStaff.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );
  
  const { data: currentAssignment } = trpc.chatAssignment.getAssignment.useQuery(
    { conversationId },
    { enabled: !!conversationId }
  );
  
  const assignMutation = trpc.chatAssignment.assignConversation.useMutation({
    onSuccess: () => {
      toast.success("Conversation assigned successfully");
    },
    onError: () => {
      toast.error("Failed to assign conversation");
    },
  });
  
  const handleAssign = (staffUserId: number) => {
    assignMutation.mutate({
      conversationId,
      assignedToUserId: staffUserId,
    });
  };
  
  return (
    <div className="flex items-center gap-2">
      <UserPlus className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentAssignment?.assignedToUserId?.toString() || "unassigned"}
        onValueChange={(value) => {
          if (value !== "unassigned") {
            handleAssign(parseInt(value));
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Assign to..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {staff?.map((member: any) => (
            <SelectItem key={member.userId} value={member.userId.toString()}>
              {member.userName || member.userEmail || `User ${member.userId}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentAssignment && (
        <span className="text-xs text-muted-foreground">
          Assigned to {currentAssignment.assignedToUserName}
        </span>
      )}
    </div>
  );
}

export default function ChatInbox() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Request notification permission on mount
  useEffect(() => {
    const initNotifications = async () => {
      const permission = await requestNotificationPermission();
      setNotificationsEnabled(permission === "granted");
    };
    initNotifications();
  }, []);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filter, setFilter] = useState<"active" | "archived">("active");
  
  const { socket, isConnected } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isFileGalleryOpen, setIsFileGalleryOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingConversationId, setRatingConversationId] = useState<number | null>(null);
  const [ratingStaffId, setRatingStaffId] = useState<number | undefined>();
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
    const [showTransferHistory, setShowTransferHistory] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [translatingMessageId, setTranslatingMessageId] = useState<number | null>(null);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [showOriginal, setShowOriginal] = useState<Record<number, boolean>>({});
  
  const translateMutation = trpc.chat.translateMessage.useMutation({
    onError: (error) => {
      toast.error("Translation failed. Please try again.");
      setTranslatingMessageId(null);
    },
  });

  // Get user's offices
  const { data: userOffices } = trpc.officeOwner.getMyOffices.useQuery();
  
  // Get office staff for export
  const { data: officeStaff } = trpc.chatAssignment.getOfficeStaff.useQuery(
    { officeId: userOffices?.[0]?.id! },
    { enabled: !!userOffices?.[0]?.id }
  );
  
  // Get user's conversations (for office owners)
  const { data: conversations, refetch: refetchConversations } = trpc.chat.getConversations.useQuery(
    undefined,
    { enabled: !!user }
  );
  
  // Get selected conversation
  const selectedConversation = conversations?.find(
    (c) => c.conversation.id === selectedConversationId
  );
  
  const { data: cannedResponses } = trpc.cannedResponses.getByOffice.useQuery(
    { officeId: selectedConversation?.conversation.officeId || 0 },
    { enabled: !!selectedConversation?.conversation.officeId }
  );
  
  // Process template variables mutation
  const processVariablesMutation = trpc.cannedResponses.processVariables.useMutation();

  // Search messages mutation
  const searchMessagesMutation = trpc.chat.searchMessages.useQuery(
    {
      query: messageSearchQuery,
      conversationId: selectedConversationId || undefined,
    },
    {
      enabled: messageSearchQuery.length > 0 && !!selectedConversationId,
    }
  );

  useEffect(() => {
    if (searchMessagesMutation.data && messageSearchQuery) {
      setSearchResults(searchMessagesMutation.data as any);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchMessagesMutation.data, messageSearchQuery]);

  // Get messages for selected conversation
  const { data: chatMessages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId }
  );

  // Mark as read mutation
  const markAsReadMutation = trpc.chat.markAsRead.useMutation();
  
  const utils = trpc.useUtils();
  
  const closeConversationMutation = trpc.chat.closeConversation.useMutation({
    onSuccess: async (_, variables) => {
      toast.success("Conversation closed");
      await refetchConversations();
      
      // Fetch assignment to find staff ID
      try {
        const assignment = await utils.chatAssignment.getAssignment.fetch(
          { conversationId: variables.conversationId }
        );
        
        // Trigger rating modal
        setRatingConversationId(variables.conversationId);
        setRatingStaffId(assignment?.assignedToUserId);
        setIsRatingModalOpen(true);
      } catch (error) {
        // If no assignment found, still show rating modal
        setRatingConversationId(variables.conversationId);
        setIsRatingModalOpen(true);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to close conversation");
    },
  });
  
  const handleCloseConversation = (conversationId: number) => {
    if (confirm("Are you sure you want to close this conversation? This will trigger a rating request.")) {
      closeConversationMutation.mutate({ conversationId });
    }
  };

  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
      scrollToBottom();
    }
  }, [chatMessages]);

  // Initialize Socket.io
  useEffect(() => {
    if (!user || !selectedConversationId || !socket || !isConnected) return;

    console.log("[ChatInbox] Joining chat for conversation", selectedConversationId);
    socket.emit("join_chat", { bookingId: selectedConversationId, userId: user.id });

    socket.on("new_message", (data: any) => {
      // Send browser notification if enabled and message is from another user
      if (notificationsEnabled && data.userId !== user.id) {
        sendChatNotification(
          data.userName || "User",
          data.message,
          selectedConversationId,
          () => setLocation("/owner/chat")
        );
      }
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        senderId: data.userId,
        senderType: data.userId === user.id ? "office" : "user",
        message: data.message,
        createdAt: new Date(data.timestamp).toISOString(),
        isRead: false,
      }]);
      scrollToBottom();
      refetchConversations();
    });

    return () => {
      console.log("[ChatInbox] Leaving chat for conversation", selectedConversationId);
      socket.emit("leave_chat", { bookingId: selectedConversationId, userId: user.id });
      socket.off("new_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [user, selectedConversationId, refetchConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !socket || !user || !selectedConversationId) return;

    socket.emit("send_message", {
      bookingId: selectedConversationId,
      userId: user.id,
      userName: user.name,
      message: message.trim(),
    });

    setMessage("");
  };

  const handleSelectConversation = async (conversationId: number) => {
    setSelectedConversationId(conversationId);
    
    // Mark messages as read
    try {
      await markAsReadMutation.mutateAsync({ conversationId });
      refetchConversations();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const uploadFileMutation = trpc.chat.uploadFile.useMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversationId) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (!base64) return;

        toast.loading("Uploading file...");
        
        await uploadFileMutation.mutateAsync({
          conversationId: selectedConversationId,
          fileData: base64,
          fileName: file.name,
          mimeType: file.type,
        });

        toast.dismiss();
        toast.success("File uploaded successfully");
        refetchMessages();
        refetchConversations();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to upload file");
      console.error(error);
    }

    // Reset input
    e.target.value = "";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations?.filter(conv => {
    const matchesFilter = filter === "active" 
      ? conv.conversation.status === "active" 
      : conv.conversation.status === "archived";
    
    const matchesSearch = !searchQuery || 
      conv.office?.officeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Please login to access chat inbox</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("pages.chatInbox")}</h1>
            <p className="text-muted-foreground">{t("pages.chatInboxDesc")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("actions.exportConversations")}
            </Button>
            <AvailabilityToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {t("chat.conversations")}
              </CardTitle>
              
              {/* Search */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("chat.searchConversations")}
                  className="pl-9"
                />
              </div>

              {/* Filter Tabs */}
              <Tabs value={filter} onValueChange={(v) => setFilter(v as "active" | "archived")} className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">{t("chat.active")}</TabsTrigger>
                  <TabsTrigger value="archived">{t("chat.archived")}</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {filteredConversations && filteredConversations.length > 0 ? (
                  <div className="divide-y">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.conversation.id}
                        onClick={() => handleSelectConversation(conv.conversation.id)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                          selectedConversationId === conv.conversation.id ? "bg-accent" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{conv.office?.officeName || "Unknown Office"}</p>
                            <p className="text-xs text-muted-foreground">
                              {conv.conversation.lastMessageAt && 
                                formatDistanceToNow(new Date(conv.conversation.lastMessageAt), { addSuffix: true })}
                            </p>
                          </div>
                          {conv.conversation.unreadByOffice > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conv.conversation.unreadByOffice}
                            </Badge>
                          )}
                        </div>
                        {conv.conversation.lastMessagePreview && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.conversation.lastMessagePreview}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">{t("empty.noConversations")}</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle>{selectedConversation.office?.officeName || "Unknown Office"}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Status: {selectedConversation.conversation.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AssignmentDropdown conversationId={selectedConversation.conversation.id} />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setIsFileGalleryOpen(true)}
                        title="View file gallery"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowTransferHistory(true)}
                        title="Transfer history"
                      >
                        <Clock className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setIsTransferDialogOpen(true)}
                        title="Transfer conversation"
                      >
                        <UserPlus className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCloseConversation(selectedConversation.conversation.id)}
                        title="Close conversation"
                        disabled={selectedConversation.conversation.status === "closed"}
                      >
                        <CheckCheck className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Message Search */}
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      placeholder="Search messages in this conversation..."
                      className="pl-9"
                    />
                    {messageSearchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7"
                        onClick={() => setMessageSearchQuery("")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="h-[480px] p-4">
                    {showSearchResults && searchResults.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">Found {searchResults.length} results</p>
                        {searchResults.map((msg) => (
                          <div
                            key={msg.id}
                            className="p-3 bg-accent/50 rounded-lg cursor-pointer hover:bg-accent"
                            onClick={() => {
                              setMessageSearchQuery("");
                              // Scroll to message in main list
                            }}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderType === "office" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                msg.senderType === "office"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {(msg as any).messageType === "file" ? (
                                <div className="flex items-center gap-2">
                                  <FileIcon className="h-4 w-4" />
                                  <a
                                    href={(msg as any).fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm underline hover:no-underline"
                                  >
                                    {(msg as any).fileName || "Download file"}
                                  </a>
                                  <Download className="h-3 w-3" />
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                {msg.translatedText && !showOriginal[msg.id] && (
                                  <div className="mt-2 border-t pt-2 border-border/50 bg-muted/30 -mx-3 px-3 py-2 rounded">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-1">
                                        <Languages className="h-3 w-3 opacity-70" />
                                        <span className="text-xs opacity-70">Translation:</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 px-2 text-xs"
                                        onClick={() => setShowOriginal(prev => ({ ...prev, [msg.id]: true }))}
                                      >
                                        Show original
                                      </Button>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap break-words opacity-90">{msg.translatedText}</p>
                                  </div>
                                )}
                                {msg.translatedText && showOriginal[msg.id] && (
                                  <div className="mt-2 flex justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 px-2 text-xs"
                                      onClick={() => setShowOriginal(prev => ({ ...prev, [msg.id]: false }))}
                                    >
                                      Show translation
                                    </Button>
                                  </div>
                                )}
                                </div>
                              )}
                              <div className="flex items-center gap-1 mt-1">
                                <p className="text-xs opacity-70">
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {msg.senderType === "office" && msg.isRead && (
                                  <CheckCheck className="h-3 w-3 opacity-70" />
                                )}
                                {(msg as any).messageType !== "file" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 px-1 ml-auto"
                                    disabled={translatingMessageId === msg.id}
                                    onClick={async () => {
                                      setTranslatingMessageId(msg.id);
                                      try {
                                        const targetLang = msg.detectedLanguage === "ar" ? "en" : "ar";
                                        const result = await translateMutation.mutateAsync({
                                          text: msg.message,
                                          targetLanguage: targetLang,
                                        });
                                        setMessages(prev => prev.map(m => 
                                          m.id === msg.id 
                                            ? { ...m, translatedText: result.translatedText, detectedLanguage: result.detectedLanguage }
                                            : m
                                        ));
                                      } catch (error) {
                                        // Error already handled by mutation onError
                                      } finally {
                                        setTranslatingMessageId(null);
                                      }
                                    }}
                                  >
                                    {translatingMessageId === msg.id ? (
                                      <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Languages className="h-3 w-3" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No messages yet</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    {/* Canned Responses Dropdown */}
                    {showCannedResponses && cannedResponses && cannedResponses.length > 0 && (
                      <div className="mb-2 p-2 border rounded-lg bg-muted/50 max-h-48 overflow-y-auto">
                        <p className="text-xs font-medium mb-2">Quick Replies:</p>
                        <div className="space-y-1">
                          {cannedResponses.map((response) => (
                            <button
                              key={response.id}
                              onClick={async () => {
                                if (selectedConversation) {
                                  const result = await processVariablesMutation.mutateAsync({
                                    template: response.content,
                                    conversationId: selectedConversation.conversation.id,
                                  });
                                  setMessage(result.processed);
                                } else {
                                  setMessage(response.content);
                                }
                                setShowCannedResponses(false);
                              }}
                              className="w-full text-left px-2 py-1 text-sm rounded hover:bg-accent transition-colors"
                            >
                              <span className="font-medium">{response.title}</span>
                              <p className="text-xs text-muted-foreground truncate">{response.content}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setAutoTranslate(!autoTranslate)}
                        title={autoTranslate ? "Auto-translate: ON" : "Auto-translate: OFF"}
                        className={autoTranslate ? "bg-primary/10" : ""}
                      >
                        <Languages className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowCannedResponses(!showCannedResponses)}
                        title="Quick replies"
                      >
                        <MessageSquareText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        title="Attach file"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      <Input
                        value={message}
                        onChange={(e) => {
                          const value = e.target.value;
                          setMessage(value);
                          
                          // Check for shortcut match
                          if (value.startsWith('/') && cannedResponses && selectedConversation) {
                            const matchingResponse = cannedResponses.find(
                              r => r.shortcut && value.toLowerCase() === r.shortcut.toLowerCase()
                            );
                            if (matchingResponse) {
                              // Process variables before inserting
                              processVariablesMutation.mutateAsync({
                                template: matchingResponse.content,
                                conversationId: selectedConversation.conversation.id,
                              }).then(result => {
                                setMessage(result.processed);
                              });
                            }
                          }
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message or /shortcut..."
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
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium mb-2">{t("empty.selectConversation")}</p>
                  <p className="text-muted-foreground">{t("empty.selectConversationDesc")}</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* File Gallery Modal */}
      {selectedConversationId && (
        <FileGallery
          conversationId={selectedConversationId}
          isOpen={isFileGalleryOpen}
          onClose={() => setIsFileGalleryOpen(false)}
        />
      )}
      
      {/* Rating Modal */}
      {ratingConversationId && (
        <RatingModal
          conversationId={ratingConversationId}
          staffUserId={ratingStaffId}
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setRatingConversationId(null);
            setRatingStaffId(undefined);
          }}
        />
      )}
      
      {/* Transfer Dialog */}
      {selectedConversation && userOffices?.[0] && (
        <TransferDialog
          conversationId={selectedConversation.conversation.id}
          officeId={userOffices[0].id}
          isOpen={isTransferDialogOpen}
          onClose={() => setIsTransferDialogOpen(false)}
          onSuccess={() => refetchConversations()}
        />
      )}
      
      {/* Transfer History */}
      {selectedConversation && (
        <TransferHistory
          conversationId={selectedConversation.conversation.id}
          isOpen={showTransferHistory}
          onClose={() => setShowTransferHistory(false)}
        />
      )}
      
      {/* Export Dialog */}
      {userOffices?.[0] && officeStaff && (
        <ExportDialog
          open={isExportDialogOpen}
          onOpenChange={setIsExportDialogOpen}
          officeId={userOffices[0].id}
          staffMembers={officeStaff.map((s: any) => ({ userId: s.userId, name: s.name }))}
        />
      )}
    </div>
  );
}
