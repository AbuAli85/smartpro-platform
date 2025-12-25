import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User } from "lucide-react";

interface ReviewsListProps {
  officeId: number;
}

export default function ReviewsList({ officeId }: ReviewsListProps) {
  const { data: reviews, isLoading } = (trpc.booking as any).getOfficeReviews.useQuery({
    officeId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003366]"></div>
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review: any) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#003366] flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{review.userName || "Anonymous"}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.reviewText && (
                  <p className="text-gray-700 text-sm">{review.reviewText}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
