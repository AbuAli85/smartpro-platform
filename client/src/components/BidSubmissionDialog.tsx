import { useState } from "react";
import { RTLDialog as Dialog, RTLDialogContent as DialogContent, RTLDialogDescription as DialogDescription, RTLDialogFooter as DialogFooter, RTLDialogHeader as DialogHeader, RTLDialogTitle as DialogTitle } from "@/components/RTLDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DollarSign, Clock, FileText } from "lucide-react";

interface BidSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
  onBidSubmitted: () => void;
}

export function BidSubmissionDialog({
  open,
  onOpenChange,
  request,
  onBidSubmitted,
}: BidSubmissionDialogProps) {
  const [proposedPrice, setProposedPrice] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [officeId, setOfficeId] = useState<number | null>(null);

  const createBidMutation = trpc.serviceMarketplace.createBid.useMutation({
    onSuccess: () => {
      onBidSubmitted();
      // Reset form
      setProposedPrice("");
      setEstimatedDuration("");
      setCoverLetter("");
    },
    onError: (error: any) => {
      toast.error("Failed to Submit Bid", {
        description: error.message,
      });
    },
  });

  const handleSubmit = () => {
    if (!proposedPrice || !estimatedDuration || !coverLetter || !officeId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const price = parseFloat(proposedPrice);

    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (coverLetter.length < 100) {
      toast.error("Cover letter must be at least 100 characters");
      return;
    }

    // Check if price is within budget range
    if (price < parseFloat(request.minBudget) || price > parseFloat(request.maxBudget)) {
      toast.error("Price must be within the customer's budget range");
      return;
    }

    createBidMutation.mutate({
      requestId: request.id,
      officeId,
      proposedPrice: price,
      estimatedDuration,
      coverLetter,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Your Bid</DialogTitle>
          <DialogDescription>
            Provide your competitive offer for this service request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Request Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">{request.serviceType}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {request.description}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Budget: {request.minBudget} - {request.maxBudget} OMR
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Deadline: {new Date(request.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Bid Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="proposedPrice">
                Your Price (OMR) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="proposedPrice"
                type="number"
                step="0.01"
                placeholder="Enter your price"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be between {request.minBudget} and {request.maxBudget} OMR
              </p>
            </div>

            <div>
              <Label htmlFor="estimatedDuration">
                Estimated Duration <span className="text-destructive">*</span>
              </Label>
              <Input
                id="estimatedDuration"
                type="text"
                placeholder="e.g., 5-7 business days"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="coverLetter">
                Cover Letter <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="coverLetter"
                placeholder="Explain why you're the best choice for this project... (minimum 100 characters)"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {coverLetter.length}/100 characters
              </p>
            </div>
          </div>

          {/* Bid Preview */}
          {proposedPrice && estimatedDuration && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <h5 className="font-semibold text-sm mb-2">Bid Preview</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Offer:</span>
                  <span className="font-semibold">{proposedPrice} OMR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{estimatedDuration}</span>
                </div>
                {parseFloat(proposedPrice) < parseFloat(request.maxBudget) && (
                  <div className="flex justify-between text-green-600">
                    <span>Savings for customer:</span>
                    <span className="font-semibold">
                      {(parseFloat(request.maxBudget) - parseFloat(proposedPrice)).toFixed(2)} OMR
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createBidMutation.isPending}
          >
            {createBidMutation.isPending ? "Submitting..." : "Submit Bid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
