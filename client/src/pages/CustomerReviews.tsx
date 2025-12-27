import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Award } from "lucide-react";

export default function CustomerReviews() {
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  // Get user's office
  const { data: userOffices } = trpc.sanadOffice.getMyOffices.useQuery();
  const officeId = userOffices?.[0]?.id;

  // Fetch reviews
  const { data: reviews, isLoading, refetch } = trpc.booking.getOfficeReviews.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  // Reply to review mutation
  const replyMutation = trpc.booking.replyToReview.useMutation({
    onSuccess: () => {
      toast.success("Reply posted successfully");
      setIsReplyDialogOpen(false);
      setSelectedReview(null);
      setReplyText("");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to post reply", {
        description: error.message,
      });
    },
  });

  const handleReply = () => {
    if (!selectedReview || !replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    replyMutation.mutate({
      reviewId: selectedReview.id,
      responseText: replyText,
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const calculateStats = () => {
    if (!reviews || reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        responseRate: 0,
      };
    }

    const totalRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce(
      (acc: any, r: any) => {
        acc[r.rating] = (acc[r.rating] || 0) + 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );

    const repliedCount = reviews.filter((r: any) => r.responseText).length;
    const responseRate = (repliedCount / reviews.length) * 100;

    return {
      averageRating: averageRating.toFixed(1),
      totalReviews: reviews.length,
      ratingDistribution,
      responseRate: responseRate.toFixed(0),
    };
  };

  if (!officeId) {
    return (
      <div className="container py-8 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No Office Found</h3>
            <p className="text-muted-foreground">
              Please register your office first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customer Reviews</h1>
        <p className="text-muted-foreground">
          Monitor feedback and engage with your customers
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              <span className="text-3xl font-bold">{stats.averageRating}</span>
              <span className="text-muted-foreground">/5.0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{stats.totalReviews}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <span className="text-3xl font-bold">{stats.responseRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              5-Star Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-8 w-8 text-yellow-500" />
              <span className="text-3xl font-bold">{stats.ratingDistribution[5]}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>Breakdown of customer ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading reviews...
          </CardContent>
        </Card>
      ) : !reviews || reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground">
              Customer reviews will appear here once you start receiving feedback
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {review.userName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{review.userName || "Anonymous"}</p>
                          {review.bookingId && (
                            <Badge variant="outline" className="text-xs">
                              Verified Booking
                            </Badge>
                          )}
                        </div>
                        {renderStars(review.rating)}
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  {review.reviewText && (
                    <p className="text-muted-foreground">{review.reviewText}</p>
                  )}

                  {/* Office Response */}
                  {review.responseText ? (
                    <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                      <p className="text-sm font-semibold mb-2">Response from Office:</p>
                      <p className="text-sm text-muted-foreground">{review.responseText}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Replied on{" "}
                        {new Date(review.respondedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review);
                        setIsReplyDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Reply to Review
                    </Button>
                  )}

                  {/* Helpful Votes */}
                  {review.helpfulCount !== undefined && (
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{review.helpfulCount || 0} found this helpful</span>
                      </div>
                      {review.notHelpfulCount !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ThumbsDown className="h-4 w-4" />
                          <span>{review.notHelpfulCount || 0}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Thank the customer or address their concerns professionally
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4 py-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold">{selectedReview.userName || "Anonymous"}</p>
                  {renderStars(selectedReview.rating)}
                </div>
                {selectedReview.reviewText && (
                  <p className="text-sm text-muted-foreground">{selectedReview.reviewText}</p>
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Write your response here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Be professional, empathetic, and solution-oriented
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReplyDialogOpen(false);
                setSelectedReview(null);
                setReplyText("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              disabled={!replyText.trim() || replyMutation.isPending}
            >
              {replyMutation.isPending ? "Posting..." : "Post Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
