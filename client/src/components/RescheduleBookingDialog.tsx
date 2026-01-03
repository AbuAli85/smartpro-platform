import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface RescheduleBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number;
  currentDate: Date;
  currentTime: string;
  officeId: number;
  onSuccess?: () => void;
}

export function RescheduleBookingDialog({
  open,
  onOpenChange,
  bookingId,
  currentDate,
  currentTime,
  officeId,
  onSuccess,
}: RescheduleBookingDialogProps) {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(currentDate);
  const [selectedTime, setSelectedTime] = useState<string>(currentTime);
  const [reason, setReason] = useState("");

  // Fetch available time slots for selected date
  const { data: timeSlots, isLoading: loadingSlots } = trpc.booking.getAvailableTimeSlots.useQuery(
    {
      officeId,
      date: selectedDate || new Date(),
    },
    {
      enabled: !!selectedDate,
    }
  );

  const utils = trpc.useUtils();
  const rescheduleMutation = trpc.booking.rescheduleBooking.useMutation({
    onSuccess: () => {
      toast.success(t("booking.rescheduleSuccess"));
      utils.booking.getMyBookings.invalidate();
      onOpenChange(false);
      onSuccess?.();
      // Reset form
      setSelectedDate(currentDate);
      setSelectedTime(currentTime);
      setReason("");
    },
    onError: (error) => {
      toast.error(error.message || t("booking.rescheduleError"));
    },
  });

  const handleReschedule = () => {
    if (!selectedDate || !selectedTime) {
      toast.error(t("booking.selectDateTime"));
      return;
    }

    if (!reason.trim()) {
      toast.error(t("booking.reasonRequired"));
      return;
    }

    rescheduleMutation.mutate({
      bookingId,
      newDate: selectedDate.toISOString(),
      newTimeSlot: selectedTime,
      reason: reason.trim(),
    });
  };

  const isSameDateTime =
    selectedDate?.toDateString() === currentDate.toDateString() && selectedTime === currentTime;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {t("booking.rescheduleBooking")}
          </DialogTitle>
          <DialogDescription>{t("booking.rescheduleDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Booking Info */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t("booking.currentSchedule")}</h4>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{format(currentDate, "PPP")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{currentTime}</span>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>{t("booking.selectNewDate")}</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border"
            />
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <Label>{t("booking.selectNewTime")}</Label>
            {loadingSlots ? (
              <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
            ) : timeSlots && timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={`${slot.time}-${slot.available}`}
                    variant={selectedTime === slot ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(slot)}
                    className="w-full"
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {t("booking.noSlotsAvailable")}
              </div>
            )}
          </div>

          {/* Reason for Rescheduling */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              {t("booking.reasonForReschedule")} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("booking.reasonPlaceholder")}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{t("booking.reasonHint")}</p>
          </div>

          {/* Warning if same date/time */}
          {isSameDateTime && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">{t("booking.sameDateTimeWarning")}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={rescheduleMutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={rescheduleMutation.isPending || !selectedDate || !selectedTime || !reason.trim() || isSameDateTime}
          >
            {rescheduleMutation.isPending ? t("common.saving") : t("booking.confirmReschedule")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
