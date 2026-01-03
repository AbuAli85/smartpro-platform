import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface AvailabilitySchedule {
  id?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

interface AvailabilityEditorProps {
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

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export default function AvailabilityEditor({ officeId }: AvailabilityEditorProps) {
  const [schedules, setSchedules] = useState<AvailabilitySchedule[]>([]);

  // Fetch existing availability
  const { data: availability, isLoading, refetch } = trpc.sanadOffice.getAvailability.useQuery(
    { officeId }
  );

  // Update schedules when data is loaded
  if (availability && schedules.length === 0) {
    setSchedules(
      availability.map((a: any) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        slotDuration: a.slotDuration,
        isActive: a.isActive,
      }))
    );
  }

  // Mutations
  const createAvailabilityMutation = trpc.sanadOffice.createAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability added successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to add availability", { description: error.message });
    },
  });

  const updateAvailabilityMutation = trpc.sanadOffice.updateAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to update availability", { description: error.message });
    },
  });

  const deleteAvailabilityMutation = trpc.sanadOffice.deleteAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete availability", { description: error.message });
    },
  });

  const handleAddDay = () => {
    setSchedules([
      ...schedules,
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 60,
        isActive: 1,
      },
    ]);
  };

  const handleUpdateSchedule = (index: number, field: keyof AvailabilitySchedule, value: any) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const handleSaveSchedule = (index: number) => {
    const schedule = schedules[index];

    if (schedule.id) {
      updateAvailabilityMutation.mutate({
        id: schedule.id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotDuration: schedule.slotDuration,
        isActive: schedule.isActive,
      });
    } else {
      createAvailabilityMutation.mutate({
        officeId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotDuration: schedule.slotDuration,
        isActive: schedule.isActive,
      });
    }
  };

  const handleDeleteSchedule = (index: number) => {
    const schedule = schedules[index];

    if (schedule.id) {
      deleteAvailabilityMutation.mutate({ id: schedule.id });
    }

    const updated = schedules.filter((_, i) => i !== index);
    setSchedules(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Office Hours</h3>
          <p className="text-sm text-gray-600">
            Configure your office working hours and appointment slots
          </p>
        </div>
        <Button onClick={handleAddDay}>Add Day</Button>
      </div>

      <div className="space-y-4">
        {schedules.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">No availability schedule configured yet</p>
            <Button onClick={handleAddDay}>Add Your First Schedule</Button>
          </Card>
        ) : (
          schedules.map((schedule, index) => (
            <Card key={index} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div className="md:col-span-1">
                  <Label>Day of Week</Label>
                  <Select
                    value={schedule.dayOfWeek.toString()}
                    onValueChange={(value) =>
                      handleUpdateSchedule(index, "dayOfWeek", parseInt(value))
                    }
                    disabled={!!schedule.id}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <Label>Start Time</Label>
                  <Select
                    value={schedule.startTime}
                    onValueChange={(value) => handleUpdateSchedule(index, "startTime", value)}
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

                <div className="md:col-span-1">
                  <Label>End Time</Label>
                  <Select
                    value={schedule.endTime}
                    onValueChange={(value) => handleUpdateSchedule(index, "endTime", value)}
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

                <div className="md:col-span-1">
                  <Label>Slot Duration (min)</Label>
                  <Select
                    value={schedule.slotDuration.toString()}
                    onValueChange={(value) =>
                      handleUpdateSchedule(index, "slotDuration", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-1 flex items-center space-x-2">
                  <Switch
                    checked={schedule.isActive}
                    onCheckedChange={(checked) =>
                      handleUpdateSchedule(index, "isActive", checked)
                    }
                  />
                  <Label className="text-sm">Active</Label>
                </div>

                <div className="md:col-span-1 flex gap-2">
                  <Button
                    onClick={() => handleSaveSchedule(index)}
                    size="sm"
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => handleDeleteSchedule(index)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Tips for Managing Availability</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Set different hours for each day of the week</li>
          <li>• Slot duration determines appointment length</li>
          <li>• Toggle "Active" to temporarily disable a day without deleting it</li>
          <li>• Changes take effect immediately for new bookings</li>
        </ul>
      </div>
    </div>
  );
}
