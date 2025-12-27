import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ReviewListProps {
  officeId: number;
}

export function ReviewList({ officeId }: ReviewListProps) {
  const [filter, setFilter] = useState<"all" | "highest" | "lowest" | "newest">("newest");

  const { data: reviews, isLoading, refetch } = trpc.booking.getOfficeReviews.useQuery({
    officeId,
  });

  const voteOnReviewMutation = trpc.booking.voteOnReview.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Vote recorded");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to vote");
    },
  });

  const handleVote = async (reviewId: number, isHelpful: boolean) => {
    try {
      await voteOnReviewMutation.mutateAsync({
        reviewId,
        voteType: isHelpful ? "helpful" : "not_helpful",
      });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // Sort reviews based on filter
  const sortedReviews = reviews ? [...reviews].sort((a, b) => {
    switch (filter) {
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  }) : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </Card>
    );
  }

  // Calculate average rating
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="highest">Highest Rating</SelectItem>
            <SelectItem value="lowest">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <Card key={review.id} className="p-6">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold">
                    Anonymous User
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Review Comment */}
            <p className="text-gray-700 mb-4">{review.reviewText || "No comment provided"}</p>

            {/* Review Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                {review.photos.map((photo: any, index: number) => (
                  <img
                    key={index}
                    src={photo.photoUrl}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(photo.photoUrl, "_blank")}
                  />
                ))}
              </div>
            )}

            {/* Voting Buttons */}
            <div className="flex items-center gap-4 pt-3 border-t">
              <span className="text-sm text-gray-600">Was this helpful?</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote(review.id, true)}
                disabled={voteOnReviewMutation.isPending}
                className="gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{review.voteCounts.helpful}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote(review.id, false)}
                disabled={voteOnReviewMutation.isPending}
                className="gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{review.voteCounts.notHelpful}</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
