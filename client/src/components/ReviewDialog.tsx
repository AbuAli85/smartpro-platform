import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReviewForm } from "./ReviewForm";

interface ReviewDialogProps {
  officeId: number;
  bookingId: number;
  officeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ReviewDialog({
  officeId,
  bookingId,
  officeName,
  open,
  onOpenChange,
  onSuccess,
}: ReviewDialogProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {officeName}
          </DialogDescription>
        </DialogHeader>
        <ReviewForm
          bookingId={bookingId}
          officeId={officeId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
