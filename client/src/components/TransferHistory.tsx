import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TransferHistoryProps {
  conversationId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function TransferHistory({
  conversationId,
  isOpen,
  onClose,
}: TransferHistoryProps) {
  const { data: transfers, isLoading } = trpc.chatTransfer.getTransferHistory.useQuery(
    { conversationId },
    { enabled: isOpen }
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transfer History
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading transfer history...
            </div>
          ) : !transfers || transfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transfers yet for this conversation
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer, index) => (
                <div
                  key={transfer.id}
                  className={`relative pl-6 pb-4 ${
                    index !== transfers.length - 1 ? 'border-l-2 border-muted' : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />

                  <div className="bg-muted/50 rounded-lg p-4">
                    {/* Transfer header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{transfer.fromUserName}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{transfer.toUserName}</span>
                        {transfer.isEscalation && (
                          <Badge variant="destructive" className="ml-2">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Escalation
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Context notes */}
                    {transfer.contextNotes && (
                      <div className="mt-2 text-sm text-muted-foreground bg-background/50 rounded p-2">
                        <p className="font-medium text-foreground mb-1">Context:</p>
                        <p>{transfer.contextNotes}</p>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(transfer.transferredAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
