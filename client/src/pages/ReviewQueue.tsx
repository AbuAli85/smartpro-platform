import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, AlertCircle, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function ReviewQueue() {
  const { t } = useLanguage();
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [newComment, setNewComment] = useState("");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "revision" | null>(null);

  // Fetch reviews
  const { data: pendingReviews, isLoading: pendingLoading, refetch: refetchPending } = trpc.collaborativeReview.getPendingReviews.useQuery();
  const { data: allReviews, isLoading: allLoading, refetch: refetchAll } = trpc.collaborativeReview.getReviews.useQuery({});
  
  // Fetch selected review details
  const { data: reviewDetails, isLoading: detailsLoading } = trpc.collaborativeReview.getReviewById.useQuery(
    { reviewId: selectedReview?.id || 0 },
    { enabled: !!selectedReview }
  );

  // Mutations
  const approveReview = trpc.collaborativeReview.approveReview.useMutation({
    onSuccess: () => {
      toast.success("Translation approved and applied");
      setActionDialogOpen(false);
      setSelectedReview(null);
      setReviewNotes("");
      refetchPending();
      refetchAll();
    },
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  const rejectReview = trpc.collaborativeReview.rejectReview.useMutation({
    onSuccess: () => {
      toast.success("Translation rejected");
      setActionDialogOpen(false);
      setSelectedReview(null);
      setReviewNotes("");
      refetchPending();
      refetchAll();
    },
    onError: (error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });

  const requestRevision = trpc.collaborativeReview.requestRevision.useMutation({
    onSuccess: () => {
      toast.success("Revision requested");
      setActionDialogOpen(false);
      setSelectedReview(null);
      setReviewNotes("");
      refetchPending();
      refetchAll();
    },
    onError: (error) => {
      toast.error(`Failed to request revision: ${error.message}`);
    },
  });

  const addComment = trpc.collaborativeReview.addComment.useMutation({
    onSuccess: () => {
      toast.success("Comment added");
      setNewComment("");
      refetchPending();
      refetchAll();
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });

  const handleAction = (type: "approve" | "reject" | "revision") => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedReview) return;

    if (actionType === "approve") {
      approveReview.mutate({
        reviewId: selectedReview.id,
        reviewNotes: reviewNotes || undefined,
        applyTranslation: true,
      });
    } else if (actionType === "reject") {
      if (!reviewNotes.trim()) {
        toast.error("Please provide rejection notes");
        return;
      }
      rejectReview.mutate({
        reviewId: selectedReview.id,
        reviewNotes,
      });
    } else if (actionType === "revision") {
      if (!reviewNotes.trim()) {
        toast.error("Please provide revision notes");
        return;
      }
      requestRevision.mutate({
        reviewId: selectedReview.id,
        reviewNotes,
      });
    }
  };

  const handleAddComment = () => {
    if (!selectedReview || !newComment.trim()) return;
    
    addComment.mutate({
      reviewId: selectedReview.id,
      comment: newComment,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "needs_revision":
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Needs Revision</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const ReviewCard = ({ review }: { review: any }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedReview(review)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg capitalize">
              {review.entityType} #{review.entityId}
            </CardTitle>
            <CardDescription>
              Field: {review.fieldName} • Submitted by {review.submittedByName}
            </CardDescription>
          </div>
          {getStatusBadge(review.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="p-3 bg-muted rounded-lg" dir="rtl">
            <p className="text-sm text-right">{review.translatedText}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(review.submittedAt), { addSuffix: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Translation Review Queue</h1>
        <p className="text-muted-foreground text-lg">
          Review and approve translations submitted by team members
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reviews List */}
        <div>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingReviews?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : pendingReviews && pendingReviews.length > 0 ? (
                pendingReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No pending reviews
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {allLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : allReviews && allReviews.length > 0 ? (
                allReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No reviews found
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Review Details */}
        <div>
          {selectedReview ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <CardTitle className="capitalize">
                      {selectedReview.entityType} #{selectedReview.entityId}
                    </CardTitle>
                    <CardDescription>Field: {selectedReview.fieldName}</CardDescription>
                  </div>
                  {getStatusBadge(selectedReview.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Translation Text */}
                <div>
                  <h3 className="font-semibold mb-2">Translated Text</h3>
                  <div className="p-4 bg-muted rounded-lg" dir="rtl">
                    <p className="text-right">{selectedReview.translatedText}</p>
                  </div>
                </div>

                {/* Submission Info */}
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Submitted by:</span> {selectedReview.submittedByName}</p>
                  <p><span className="font-medium">Submitted:</span> {formatDistanceToNow(new Date(selectedReview.submittedAt), { addSuffix: true })}</p>
                  {selectedReview.reviewedByName && (
                    <>
                      <p><span className="font-medium">Reviewed by:</span> {selectedReview.reviewedByName}</p>
                      {selectedReview.reviewNotes && (
                        <div className="mt-2 p-3 bg-muted rounded">
                          <p className="font-medium mb-1">Review Notes:</p>
                          <p>{selectedReview.reviewNotes}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Comments */}
                {reviewDetails && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comments ({reviewDetails.comments.length})
                    </h3>
                    <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                      {reviewDetails.comments.map((comment: any) => (
                        <div key={comment.id} className="p-3 bg-muted rounded text-sm">
                          <p className="font-medium">{comment.userName}</p>
                          <p className="text-muted-foreground">{comment.comment}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {selectedReview.status === "pending" && (
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={2}
                        />
                        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                          Send
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {selectedReview.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction("approve")}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAction("revision")}
                      variant="outline"
                      className="flex-1"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Request Revision
                    </Button>
                    <Button
                      onClick={() => handleAction("reject")}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-24 text-center text-muted-foreground">
                Select a review to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Translation"}
              {actionType === "reject" && "Reject Translation"}
              {actionType === "revision" && "Request Revision"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "This will apply the translation and notify the submitter."}
              {actionType === "reject" && "This will reject the translation. Please provide a reason."}
              {actionType === "revision" && "This will request changes. Please specify what needs to be revised."}
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder={actionType === "approve" ? "Optional notes..." : "Required notes..."}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAction} disabled={approveReview.isPending || rejectReview.isPending || requestRevision.isPending}>
              {(approveReview.isPending || rejectReview.isPending || requestRevision.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
