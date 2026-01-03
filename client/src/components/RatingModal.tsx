import { useState } from "react";
import { RTLDialog as Dialog, RTLDialogContent as DialogContent, RTLDialogHeader as DialogHeader, RTLDialogTitle as DialogTitle } from "@/components/RTLDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface RatingModalProps {
  conversationId: number;
  staffUserId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function RatingModal({ conversationId, staffUserId, isOpen, onClose }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const createRatingMutation = trpc.chatRatings.create.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      onClose();
      setRating(0);
      setFeedback("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit rating");
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    createRatingMutation.mutate({
      conversationId,
      rating,
      feedback: feedback.trim() || undefined,
      staffUserId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              How would you rate your conversation experience?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-medium mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Additional Feedback (Optional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={rating === 0 || createRatingMutation.isPending}>
              {createRatingMutation.isPending ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
