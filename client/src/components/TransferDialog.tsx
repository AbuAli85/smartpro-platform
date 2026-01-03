import { useState } from "react";
import { RTLDialog as Dialog, RTLDialogContent as DialogContent, RTLDialogHeader as DialogHeader, RTLDialogTitle as DialogTitle, RTLDialogFooter as DialogFooter } from "@/components/RTLDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { UserPlus, AlertTriangle } from "lucide-react";

interface TransferDialogProps {
  conversationId: number;
  officeId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransferDialog({
  conversationId,
  officeId,
  isOpen,
  onClose,
  onSuccess,
}: TransferDialogProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [contextNotes, setContextNotes] = useState("");
  const [isEscalation, setIsEscalation] = useState(false);

  // Get available staff
  const { data: staff } = trpc.chatAssignment.getOfficeStaff.useQuery(
    { officeId },
    { enabled: isOpen }
  );

  const transferMutation = trpc.chatTransfer.transferConversation.useMutation({
    onSuccess: () => {
      toast.success(isEscalation ? "Conversation escalated successfully" : "Conversation transferred successfully");
      setSelectedStaffId("");
      setContextNotes("");
      setIsEscalation(false);
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to transfer conversation");
    },
  });

  const handleTransfer = () => {
    if (!selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }

    transferMutation.mutate({
      conversationId,
      toUserId: parseInt(selectedStaffId),
      contextNotes: contextNotes.trim() || undefined,
      isEscalation,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEscalation ? (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Escalate Conversation
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Transfer Conversation
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Staff Selection */}
          <div className="space-y-2">
            <Label htmlFor="staff">Transfer to Staff Member *</Label>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger id="staff">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff?.map((member) => (
                  <SelectItem key={member.userId} value={member.userId.toString()}>
                    {member.userName} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Context Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Context Notes</Label>
            <Textarea
              id="notes"
              placeholder="Provide context about this conversation to help the receiving staff member..."
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Optional: Add notes about the customer's issue, conversation history, or any important details
            </p>
          </div>

          {/* Escalation Flag */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="escalation"
              checked={isEscalation}
              onCheckedChange={(checked) => setIsEscalation(checked as boolean)}
            />
            <Label
              htmlFor="escalation"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Mark as escalation (requires manager attention)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={transferMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={transferMutation.isPending || !selectedStaffId}
          >
            {transferMutation.isPending ? "Transferring..." : isEscalation ? "Escalate" : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
