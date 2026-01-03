import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Package, Calendar, DollarSign, ChevronDown, ChevronUp, Building2, User } from "lucide-react";
import { RequestMessaging } from "@/components/RequestMessaging";
import { useLanguage } from "@/contexts/LanguageContext";

export default function OfficeRequestMessages() {
  const { t } = useLanguage();
  const [expandedMessaging, setExpandedMessaging] = useState<Set<number>>(new Set());

  const toggleMessaging = (requestId: number) => {
    setExpandedMessaging((prev) => {
      const next = new Set(prev);
      if (next.has(requestId)) {
        next.delete(requestId);
      } else {
        next.add(requestId);
      }
      return next;
    });
  };

  // Get all requests that have bids from this office
  const { data: bids, isLoading } = trpc.serviceMarketplace.getMyBids.useQuery();
  
  // Extract unique requests from bids
  const requests = bids?.map((bid: any) => bid.request).filter((r: any) => r != null) || [];
  const uniqueRequests = Array.from(new Map(requests.map((r: any) => [r.id, r])).values());
  
  // Get unread message counts for all requests
  const requestIds = uniqueRequests.map((r: any) => r.id);
  const { data: unreadCounts } = trpc.requestMessaging.getAllUnreadCounts.useQuery(
    { requestIds },
    { enabled: requestIds.length > 0, refetchInterval: 5000 } // Poll every 5 seconds
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#003366]" />
      </div>
    );
  }

  if (uniqueRequests.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("nav.messages") || "Request Messages"}</h1>
          <p className="text-gray-600">{t("messages.viewAndRespond") || "View and respond to customer messages"}</p>
        </div>
        
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">{t("empty.noMessages") || "No Messages Yet"}</h2>
          <p className="text-gray-600 mb-6">
            {t("empty.noMessagesDesc") || "When customers send messages about their service requests, they will appear here."}
          </p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: uniqueRequests.length,
    withMessages: Object.keys(unreadCounts || {}).length,
    unreadTotal: Object.values(unreadCounts || {}).reduce((sum: number, count: any) => sum + count, 0),
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("nav.messages") || "Request Messages"}</h1>
        <p className="text-gray-600">{t("messages.viewAndRespond") || "View and respond to customer messages"}</p>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Requests you've bid on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.withMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">Requests with messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unreadTotal}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires your attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Request List with Messaging */}
      <div className="grid gap-6">
        {uniqueRequests.map((request: any) => {
          const unreadCount = unreadCounts?.[request.id] || 0;
          const hasUnread = unreadCount > 0;
          
          return (
            <Card key={request.id} className={`hover:shadow-lg transition-shadow ${hasUnread ? 'border-red-300 border-2' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{request.title}</CardTitle>
                      {hasUnread && (
                        <Badge variant="destructive" className="h-6 min-w-6 rounded-full px-2">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{request.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Customer:</span>
                    <span>{request.customerName || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Budget:</span>
                    <span>{request.budget} OMR</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Deadline:</span>
                    <span>{new Date(request.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Service:</span>
                    <span>{request.serviceType}</span>
                  </div>
                </div>

                {/* Messaging Section */}
                <div className="mt-4 border-t pt-4">
                  <Button
                    variant={hasUnread ? "default" : "ghost"}
                    onClick={() => toggleMessaging(request.id)}
                    className={`w-full flex items-center justify-between text-sm font-medium ${
                      hasUnread ? 'bg-red-600 hover:bg-red-700 text-white' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {hasUnread ? `${unreadCount} New Message${unreadCount > 1 ? 's' : ''}` : 'View Messages'}
                    </span>
                    {expandedMessaging.has(request.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {expandedMessaging.has(request.id) && (
                    <div className="mt-4">
                      <RequestMessaging
                        requestId={request.id}
                        senderType="office"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
