import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Clock, Plus, Trash2, X } from "lucide-react";

interface AvailabilityCalendarProps {
  officeId: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export function AvailabilityCalendar({ officeId }: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockForm, setBlockForm] = useState({
    isAllDay: true,
    startTime: "09:00",
    endTime: "17:00",
    reason: "",
  });

  const utils = trpc.useUtils();

  // Fetch availability schedule
  const { data: availability, isLoading: loadingAvailability } = trpc.availability.getOfficeAvailability.useQuery({
    officeId,
  });

  // Fetch blocked slots
  const { data: blockedSlots, isLoading: loadingBlocked } = trpc.availability.getBlockedSlots.useQuery({
    officeId,
    startDate: selectedDate ? formatDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)) : undefined,
    endDate: selectedDate ? formatDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)) : undefined,
  });

  // Update availability mutation
  const updateAvailability = trpc.availability.upsertAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability updated successfully");
      utils.availability.getOfficeAvailability.invalidate({ officeId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update availability");
    },
  });

  // Create blocked slot mutation
  const createBlockedSlot = trpc.availability.createBlockedSlot.useMutation({
    onSuccess: () => {
      toast.success("Time slot blocked successfully");
      utils.availability.getBlockedSlots.invalidate();
      setShowBlockDialog(false);
      setBlockForm({
        isAllDay: true,
        startTime: "09:00",
        endTime: "17:00",
        reason: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to block time slot");
    },
  });

  // Delete blocked slot mutation
  const deleteBlockedSlot = trpc.availability.deleteBlockedSlot.useMutation({
    onSuccess: () => {
      toast.success("Blocked slot removed successfully");
      utils.availability.getBlockedSlots.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove blocked slot");
    },
  });

  const handleBlockSlot = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    createBlockedSlot.mutate({
      officeId,
      blockedDate: formatDate(selectedDate),
      isAllDay: blockForm.isAllDay,
      startTime: blockForm.isAllDay ? undefined : blockForm.startTime,
      endTime: blockForm.isAllDay ? undefined : blockForm.endTime,
      reason: blockForm.reason || undefined,
    });
  };

  const handleDeleteBlock = (slotId: number) => {
    if (confirm("Are you sure you want to remove this blocked slot?")) {
      deleteBlockedSlot.mutate({ slotId, officeId });
    }
  };

  const getBlockedDates = () => {
    if (!blockedSlots) return [];
    return blockedSlots
      .filter((slot) => slot.isAllDay)
      .map((slot) => new Date(slot.blockedDate));
  };

  const getBlockedSlotsForDate = (date: Date) => {
    if (!blockedSlots) return [];
    const dateStr = formatDate(date);
    return blockedSlots.filter((slot) => slot.blockedDate === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Set your regular working hours for each day of the week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayAvailability = availability?.find((a) => a.dayOfWeek === day.value);
            const [isAvailable, setIsAvailable] = useState(dayAvailability?.isActive === 1);
            const [startTime, setStartTime] = useState(dayAvailability?.startTime || "09:00");
            const [endTime, setEndTime] = useState(dayAvailability?.endTime || "17:00");
            const [slotDuration, setSlotDuration] = useState(dayAvailability?.slotDuration || 60);

            return (
              <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-32">
                  <Label className="font-medium">{day.label}</Label>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                  disabled={updateAvailability.isPending}
                />
                {isAvailable && (
                  <>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground">to</span>
                      <Select value={endTime} onValueChange={setEndTime}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Slot Duration:</Label>
                      <Input
                        type="number"
                        min="15"
                        max="480"
                        step="15"
                        value={slotDuration}
                        onChange={(e) => setSlotDuration(Number(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateAvailability.mutate({
                          officeId,
                          dayOfWeek: day.value,
                          startTime,
                          endTime,
                          slotDuration,
                          isAvailable,
                        });
                      }}
                      disabled={updateAvailability.isPending}
                    >
                      Save
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Date-Specific Blocks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blocked Dates</CardTitle>
              <CardDescription>Block specific dates or time slots when you're unavailable</CardDescription>
            </div>
            <Button onClick={() => setShowBlockDialog(true)} disabled={!selectedDate}>
              <Plus className="h-4 w-4 mr-2" />
              Block Time
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  blocked: getBlockedDates(),
                }}
                modifiersStyles={{
                  blocked: { backgroundColor: "hsl(var(--destructive))", color: "white" },
                }}
              />
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">
                Blocked Slots for {selectedDate?.toLocaleDateString()}
              </h3>
              {selectedDate && getBlockedSlotsForDate(selectedDate).length === 0 && (
                <p className="text-sm text-muted-foreground">No blocked slots for this date</p>
              )}
              {selectedDate &&
                getBlockedSlotsForDate(selectedDate).map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">
                        {slot.isAllDay ? "All Day" : `${slot.startTime} - ${slot.endTime}`}
                      </div>
                      {slot.reason && (
                        <div className="text-sm text-muted-foreground">{slot.reason}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBlock(slot.id)}
                      disabled={deleteBlockedSlot.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block Time Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Time Slot</DialogTitle>
            <DialogDescription>
              Block {selectedDate?.toLocaleDateString()} from accepting bookings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="all-day">Block entire day</Label>
              <Switch
                id="all-day"
                checked={blockForm.isAllDay}
                onCheckedChange={(checked) => setBlockForm({ ...blockForm, isAllDay: checked })}
              />
            </div>
            {!blockForm.isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Select
                    value={blockForm.startTime}
                    onValueChange={(value) => setBlockForm({ ...blockForm, startTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Select
                    value={blockForm.endTime}
                    onValueChange={(value) => setBlockForm({ ...blockForm, endTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Holiday, Training, Personal appointment"
                value={blockForm.reason}
                onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBlockSlot} disabled={createBlockedSlot.isPending}>
              Block Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
