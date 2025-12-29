import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Package, Calendar, DollarSign, Clock, Building2, CheckCircle, XCircle, AlertCircle, FileText, TrendingUp, Users, Star, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { StatusTimeline } from "@/components/RequestTimeline";
import { RequestMessaging } from "@/components/RequestMessaging";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MyServiceRequests() {
  const { t } = useLanguage();
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedBidId, setSelectedBidId] = useState<number | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [expandedTimelines, setExpandedTimelines] = useState<Set<number>>(new Set());
  const [expandedMessaging, setExpandedMessaging] = useState<Set<number>>(new Set());

  const toggleTimeline = (requestId: number) => {
    setExpandedTimelines((prev) => {
      const next = new Set(prev);
      if (next.has(requestId)) {
        next.delete(requestId);
      } else {
        next.add(requestId);
      }
      return next;
    });
  };

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

  const { data: requests, isLoading, refetch } = trpc.serviceMarketplace.getMyRequests.useQuery();
  const acceptBidMutation = trpc.serviceMarketplace.acceptBid.useMutation({
    onSuccess: () => {
      toast.success("Bid accepted successfully! Booking has been created.");
      setShowAcceptDialog(false);
      setSelectedBidId(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to accept bid: ${error.message}`);
    },
  });

  const selectedRequest = requests?.find((r: any) => r.id === selectedRequestId);
  const selectedBid = selectedRequest?.bids?.find((b: any) => b.id === selectedBidId);

  const handleAcceptBid = () => {
    if (!selectedBidId) return;
    acceptBidMutation.mutate({ bidId: selectedBidId });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      open: { variant: "default", icon: AlertCircle },
      closed: { variant: "secondary", icon: CheckCircle },
      accepted: { variant: "outline", icon: CheckCircle },
    };
    const config = variants[status] || variants.open;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#003366]" />
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: requests?.length || 0,
    active: requests?.filter((r: any) => ['open', 'bidding', 'awarded', 'in_progress'].includes(r.status)).length || 0,
    completed: requests?.filter((r: any) => r.status === 'completed').length || 0,
    totalBids: requests?.reduce((sum: number, r: any) => sum + (r.bids?.length || 0), 0) || 0,
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">{t("empty.noServiceRequestsYet")}</h2>
          <p className="text-gray-600 mb-6">
            {t("empty.noServiceRequestsYetDesc")}
          </p>
          <Button asChild className="bg-[#003366] hover:bg-[#002244]">
            <a href="/request-service">{t("actions.postServiceRequest")}</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("nav.myServiceRequests")}</h1>
        <p className="text-gray-600">{t("marketplace.myRequests")}</p>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalBids}</div>
            <p className="text-xs text-muted-foreground mt-1">From all offices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {requests.map((request: any) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                  <CardDescription>{request.description}</CardDescription>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{t("serviceRequest.bids")}:</span>
                  <span className="font-semibold text-[#003366]">{request.bids?.length || 0}</span>
                </div>
              </div>

              {request.bids && request.bids.length > 0 && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequestId(selectedRequestId === request.id ? null : request.id)}
                    className="w-full"
                  >
                    {selectedRequestId === request.id ? "Hide Bids" : `View ${request.bids.length} Bid${request.bids.length > 1 ? 's' : ''}`}
                  </Button>

                  {selectedRequestId === request.id && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Office</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Delivery</TableHead>
                            <TableHead>Cover Letter</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {request.bids.map((bid: any) => (
                            <TableRow key={bid.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{bid.office?.officeName || "Unknown Office"}</div>
                                  <div className="text-sm text-gray-500">{bid.office?.governorate}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-[#003366]">{bid.price} OMR</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span>{bid.estimatedDuration}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm line-clamp-2 max-w-xs">{bid.coverLetter}</p>
                              </TableCell>
                              <TableCell>
                                {request.status === "open" && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBidId(bid.id);
                                      setShowAcceptDialog(true);
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                )}
                                {request.acceptedBidId === bid.id && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Accepted
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {(!request.bids || request.bids.length === 0) && request.status === "open" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                  <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">{t("serviceRequest.noBidsYet")}</p>
                </div>
              )}

              {/* Timeline Section */}
              <div className="mt-4 border-t pt-4">
                <Button
                  variant="ghost"
                  onClick={() => toggleTimeline(request.id)}
                  className="w-full flex items-center justify-between text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t("serviceRequest.viewTimeline") || "View Progress Timeline"}
                  </span>
                  {expandedTimelines.has(request.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {expandedTimelines.has(request.id) && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <StatusTimeline
                      currentStatus={request.status}
                      createdAt={new Date(request.createdAt)}
                      updatedAt={new Date(request.updatedAt)}
                      acceptedAt={request.acceptedAt ? new Date(request.acceptedAt) : undefined}
                      completedAt={request.completedAt ? new Date(request.completedAt) : undefined}
                      cancelledAt={request.cancelledAt ? new Date(request.cancelledAt) : undefined}
                    />
                  </div>
                )}
              </div>

              {/* Messaging Section */}
              <div className="mt-4 border-t pt-4">
                <Button
                  variant="ghost"
                  onClick={() => toggleMessaging(request.id)}
                  className="w-full flex items-center justify-between text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {t("serviceRequest.viewMessages") || "View Messages"}
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
                      senderType="customer"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accept Bid Confirmation Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Bid</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this bid? A booking will be created automatically.
            </DialogDescription>
          </DialogHeader>
          {selectedBid && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Office</p>
                  <p className="font-medium">{selectedBid.office?.officeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium text-[#003366]">{selectedBid.price} OMR</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Duration</p>
                  <p className="font-medium">{selectedBid.estimatedDuration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-medium">{selectedRequest?.serviceType}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Cover Letter</p>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedBid.coverLetter}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAcceptBid}
              disabled={acceptBidMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {acceptBidMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm & Create Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
