import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Languages,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type RequestStatus = "pending" | "approved" | "rejected" | "completed";

export default function TranslationRequestQueue() {
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>("pending");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");

  const { data: requests, refetch } = trpc.translationRequest.list.useQuery({
    status: selectedStatus,
    limit: 100,
  });

  const { data: pendingCount } = trpc.translationRequest.getPendingCount.useQuery();

  const approveRequest = trpc.translationRequest.approve.useMutation({
    onSuccess: () => {
      toast.success("Translation request approved");
      setReviewDialogOpen(false);
      setReviewNotes("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve request");
    },
  });

  const rejectRequest = trpc.translationRequest.reject.useMutation({
    onSuccess: () => {
      toast.success("Translation request rejected");
      setReviewDialogOpen(false);
      setReviewNotes("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject request");
    },
  });

  const handleReview = (request: any, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedRequest) return;

    if (reviewAction === "approve") {
      approveRequest.mutate({
        id: selectedRequest.id,
        reviewNotes: reviewNotes || undefined,
        applyTranslation: true,
      });
    } else {
      if (!reviewNotes.trim()) {
        toast.error("Please provide a reason for rejection");
        return;
      }
      rejectRequest.mutate({
        id: selectedRequest.id,
        reviewNotes,
      });
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    } as const;
    return (
      <Badge variant={variants[priority as keyof typeof variants] || "default"}>
        {priority}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Translation Request Queue</h1>
        <p className="text-muted-foreground">
          Review and approve translation requests from office owners
        </p>
      </div>

      {/* Status Tabs */}
      <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as RequestStatus)}>
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount && pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="space-y-4">
          {!requests || requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Languages className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No {selectedStatus} translation requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((request: any) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          {request.currentNameEn}
                          {getPriorityBadge(request.priority)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {request.entityType === "office" ? "Office" : "Template"}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {request.requesterName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </span>
                        </CardDescription>
                      </div>
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleReview(request, "approve")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReview(request, "reject")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current English Content */}
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm">Current English Content</h4>
                      <div>
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <p className="text-sm">{request.currentNameEn}</p>
                      </div>
                      {request.currentDescriptionEn && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Description</Label>
                          <p className="text-sm">{request.currentDescriptionEn}</p>
                        </div>
                      )}
                    </div>

                    {/* Proposed Arabic Translation */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm">Proposed Arabic Translation</h4>
                      {request.proposedNameAr && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Arabic Name</Label>
                          <p className="text-sm text-right" dir="rtl">
                            {request.proposedNameAr}
                          </p>
                        </div>
                      )}
                      {request.proposedDescriptionAr && (
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Arabic Description
                          </Label>
                          <p className="text-sm text-right" dir="rtl">
                            {request.proposedDescriptionAr}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {request.notes && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Requester Notes</Label>
                        <p className="text-sm">{request.notes}</p>
                      </div>
                    )}

                    {/* Review Notes (for approved/rejected requests) */}
                    {request.reviewNotes && (
                      <div className="border-t pt-4">
                        <Label className="text-xs text-muted-foreground">Admin Review Notes</Label>
                        <p className="text-sm">{request.reviewNotes}</p>
                        {request.reviewedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reviewed {formatDistanceToNow(new Date(request.reviewedAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve" : "Reject"} Translation Request
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "The translation will be applied to the system immediately."
                : "Please provide a reason for rejection."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reviewNotes">
                {reviewAction === "approve" ? "Notes (Optional)" : "Rejection Reason"}
              </Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewAction === "approve"
                    ? "Add any notes about this approval..."
                    : "Explain why this translation is being rejected..."
                }
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={reviewAction === "approve" ? "default" : "destructive"}
                onClick={handleSubmitReview}
                disabled={approveRequest.isPending || rejectRequest.isPending}
              >
                {approveRequest.isPending || rejectRequest.isPending
                  ? "Processing..."
                  : reviewAction === "approve"
                  ? "Approve & Apply"
                  : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
