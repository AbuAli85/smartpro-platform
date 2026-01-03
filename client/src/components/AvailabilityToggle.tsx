import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Circle, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const AVAILABILITY_STATUSES = [
  { value: "online", label: "Online", color: "text-green-500", description: "Available for new chats" },
  { value: "busy", label: "Busy", color: "text-yellow-500", description: "Handling current chats" },
  { value: "offline", label: "Offline", color: "text-gray-400", description: "Not available" },
] as const;

type AvailabilityStatus = typeof AVAILABILITY_STATUSES[number]["value"];

interface AvailabilityToggleProps {
  currentStatus?: AvailabilityStatus;
  staffId?: number;
}

export function AvailabilityToggle({ currentStatus = "offline", staffId }: AvailabilityToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();

  // Get user's staff record
  const { data: userOffices } = trpc.officeOwner.getMyOffices.useQuery();
  const officeId = userOffices?.[0]?.id;

  const { data: staffMembers } = trpc.chatAssignment.getOfficeStaff.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId && !staffId }
  );

  // Find current user's staff ID if not provided
  const currentStaffId = staffId || staffMembers?.find((s: any) => s.userId)?.id;

  const updateAvailabilityMutation = trpc.chatAssignment.updateAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability status updated");
      utils.chatAssignment.getOfficeStaff.invalidate();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const handleStatusChange = (status: AvailabilityStatus) => {
    if (!currentStaffId) {
      toast.error("Staff record not found");
      return;
    }

    updateAvailabilityMutation.mutate({
      staffId: currentStaffId,
      status,
    });
  };

  const currentStatusInfo = AVAILABILITY_STATUSES.find(s => s.value === currentStatus) || AVAILABILITY_STATUSES[2];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Circle className={`h-3 w-3 fill-current ${currentStatusInfo.color}`} />
          <span className="hidden sm:inline">{currentStatusInfo.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-1">
          <p className="text-sm font-medium mb-3">Set your availability</p>
          {AVAILABILITY_STATUSES.map((status) => {
            const isSelected = currentStatus === status.value;
            return (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${ 
                  isSelected 
                    ? "bg-accent" 
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Circle className={`h-4 w-4 fill-current ${status.color} mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{status.label}</p>
                      {isSelected && <Check className="h-4 w-4" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{status.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
