import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface CancellationDialogProps {
  bookingId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CancellationDialog({
  bookingId,
  open,
  onOpenChange,
  onSuccess,
}: CancellationDialogProps) {
  const [reason, setReason] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Calculate cancellation details
  // Note: Type assertion needed due to tRPC type generation lag. Backend procedure exists and works.
  const { data: cancellationInfo, isLoading: calculating } =
    (trpc.booking as any).calculateCancellation.useQuery(
      { bookingId },
      { enabled: open && bookingId > 0 }
    );

  // Cancel booking mutation
  // Note: Type assertion needed due to tRPC type generation lag. Backend procedure exists and works.
  const cancelMutation = (trpc.booking as any).cancelBooking.useMutation({
    onSuccess: () => {
      toast.success("Booking cancelled successfully");
      onOpenChange(false);
      setReason("");
      setShowConfirm(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error("Cancellation failed", { description: error.message });
    },
  });

  const handleCancel = () => {
    if (reason.length < 10) {
      toast.error("Please provide a detailed cancellation reason (at least 10 characters)");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    cancelMutation.mutate({ bookingId, reason });
  };

  if (calculating) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
            <span className="ml-3 text-gray-600">Calculating cancellation details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!cancellationInfo?.allowed) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Cancellation Not Allowed
            </DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>{cancellationInfo?.reason || "Unable to cancel this booking"}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (showConfirm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Refund Amount:</span>
                <span className="font-semibold text-green-600">
                  {cancellationInfo.refundAmount.toFixed(3)} OMR
                </span>
              </div>
              {cancellationInfo.penaltyAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancellation Fee:</span>
                  <span className="font-semibold text-red-600">
                    {cancellationInfo.penaltyAmount.toFixed(3)} OMR ({cancellationInfo.penaltyPercent}%)
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Cancellation Reason:</label>
              <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded">{reason}</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={cancelMutation.isPending}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Review the cancellation details below and provide a reason for cancellation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              You are eligible to cancel this booking.
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-medium">
              <DollarSign className="w-4 h-4" />
              Refund Summary
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Refund Amount:</span>
                <span className="font-semibold text-green-600">
                  {cancellationInfo.refundAmount.toFixed(3)} OMR
                </span>
              </div>
              {cancellationInfo.penaltyAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancellation Fee:</span>
                  <span className="font-semibold text-red-600">
                    -{cancellationInfo.penaltyAmount.toFixed(3)} OMR ({cancellationInfo.penaltyPercent}%)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Reason for Cancellation *
            </label>
            <Textarea
              placeholder="Please explain why you need to cancel this booking (minimum 10 characters)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/10 characters minimum
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={reason.length < 10}
          >
            Continue to Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
