import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Languages, Send } from "lucide-react";

interface TranslationRequestFormProps {
  entityType: "office" | "template";
  entityId: number;
  entityName: string;
  currentDescription?: string;
  trigger?: React.ReactNode;
}

export function TranslationRequestForm({
  entityType,
  entityId,
  entityName,
  currentDescription,
  trigger,
}: TranslationRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [proposedNameAr, setProposedNameAr] = useState("");
  const [proposedDescriptionAr, setProposedDescriptionAr] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const createRequest = trpc.translationRequest.create.useMutation({
    onSuccess: () => {
      toast.success("Translation request submitted successfully");
      setOpen(false);
      // Reset form
      setProposedNameAr("");
      setProposedDescriptionAr("");
      setNotes("");
      setPriority("medium");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit translation request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!proposedNameAr && !proposedDescriptionAr) {
      toast.error("Please provide at least one translation");
      return;
    }

    createRequest.mutate({
      entityType,
      entityId,
      proposedNameAr: proposedNameAr || undefined,
      proposedDescriptionAr: proposedDescriptionAr || undefined,
      notes: notes || undefined,
      priority,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Languages className="h-4 w-4 mr-2" />
            Request Translation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Arabic Translation</DialogTitle>
          <DialogDescription>
            Submit a translation request for <strong>{entityName}</strong>. An admin will review and
            approve your translation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current English Content */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">Current English Content</h3>
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="text-sm">{entityName}</p>
            </div>
            {currentDescription && (
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm">{currentDescription}</p>
              </div>
            )}
          </div>

          {/* Proposed Arabic Name */}
          <div className="space-y-2">
            <Label htmlFor="nameAr">
              Arabic Name <span className="text-muted-foreground">(الاسم بالعربية)</span>
            </Label>
            <Textarea
              id="nameAr"
              value={proposedNameAr}
              onChange={(e) => setProposedNameAr(e.target.value)}
              placeholder="Enter Arabic name..."
              className="min-h-[60px] text-right"
              dir="rtl"
            />
          </div>

          {/* Proposed Arabic Description */}
          <div className="space-y-2">
            <Label htmlFor="descriptionAr">
              Arabic Description <span className="text-muted-foreground">(الوصف بالعربية)</span>
            </Label>
            <Textarea
              id="descriptionAr"
              value={proposedDescriptionAr}
              onChange={(e) => setProposedDescriptionAr(e.target.value)}
              placeholder="Enter Arabic description..."
              className="min-h-[120px] text-right"
              dir="rtl"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Additional Notes <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context or instructions for the translator..."
              className="min-h-[80px]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRequest.isPending}>
              {createRequest.isPending ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
