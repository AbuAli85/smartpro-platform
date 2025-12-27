import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, TrendingDown, Minus, Zap, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
  workload?: "low" | "medium" | "high";
}

interface Step3Props {
  selectedDate: Date | undefined;
  selectedTime: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  availableSlots: TimeSlot[];
  isLoadingSlots: boolean;
}

export function Step3TimeSlotSelection({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  availableSlots,
  isLoadingSlots,
}: Step3Props) {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Get workload indicator
  const getWorkloadInfo = (workload?: "low" | "medium" | "high") => {
    switch (workload) {
      case "low":
        return {
          icon: TrendingDown,
          label: "Low Demand",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-950/30",
        };
      case "medium":
        return {
          icon: Minus,
          label: "Moderate",
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-100 dark:bg-yellow-950/30",
        };
      case "high":
        return {
          icon: TrendingUp,
          label: "High Demand",
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-950/30",
        };
      default:
        return {
          icon: Minus,
          label: "Normal",
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-100 dark:bg-gray-950/30",
        };
    }
  };

  // Find next available slot
  const nextAvailableSlot = availableSlots.find((slot) => slot.available);

  // Group slots by time of day
  const morningSlots = availableSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(":")[0]);
    return hour >= 8 && hour < 12;
  });

  const afternoonSlots = availableSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(":")[0]);
    return hour >= 12 && hour < 17;
  });

  const eveningSlots = availableSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(":")[0]);
    return hour >= 17;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Date & Time</h2>
        <p className="text-muted-foreground">
          Choose your preferred appointment date and time slot
        </p>
      </div>

      {/* Quick Actions */}
      {nextAvailableSlot && !selectedDate && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Quick Booking</CardTitle>
            </div>
            <CardDescription>
              Next available slot: <strong>{nextAvailableSlot.time}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                const today = new Date();
                onDateSelect(today);
                onTimeSelect(nextAvailableSlot.time);
              }}
            >
              Book Next Available
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Select Date
            </CardTitle>
            <CardDescription>
              Choose your preferred appointment date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              disabled={(date) => {
                // Disable past dates
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="rounded-md border"
            />
            {selectedDate && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected Date:</p>
                <p className="text-lg font-semibold text-primary">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Available Time Slots
            </CardTitle>
            <CardDescription>
              {selectedDate
                ? "Select your preferred time"
                : "Please select a date first"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDate && (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a date to view available time slots</p>
              </div>
            )}

            {selectedDate && isLoadingSlots && (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted animate-pulse rounded-lg"
                  />
                ))}
              </div>
            )}

            {selectedDate && !isLoadingSlots && availableSlots.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No slots available</p>
                <p className="text-sm mt-1">
                  Please select a different date
                </p>
              </div>
            )}

            {selectedDate && !isLoadingSlots && availableSlots.length > 0 && (
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {/* Morning Slots */}
                {morningSlots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                      Morning (8:00 AM - 12:00 PM)
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {morningSlots.map((slot) => {
                        const workloadInfo = getWorkloadInfo(slot.workload);
                        const WorkloadIcon = workloadInfo.icon;
                        const isSelected = selectedTime === slot.time;

                        return (
                          <Button
                            key={slot.time}
                            variant={isSelected ? "default" : "outline"}
                            disabled={!slot.available}
                            onClick={() => onTimeSelect(slot.time)}
                            className={cn(
                              "h-auto flex-col items-start p-3",
                              !slot.available && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <span className="font-semibold">{slot.time}</span>
                            {slot.available && slot.workload && (
                              <div className="flex items-center gap-1 mt-1">
                                <WorkloadIcon className={cn("w-3 h-3", workloadInfo.color)} />
                                <span className={cn("text-xs", workloadInfo.color)}>
                                  {workloadInfo.label}
                                </span>
                              </div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Afternoon Slots */}
                {afternoonSlots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                      Afternoon (12:00 PM - 5:00 PM)
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {afternoonSlots.map((slot) => {
                        const workloadInfo = getWorkloadInfo(slot.workload);
                        const WorkloadIcon = workloadInfo.icon;
                        const isSelected = selectedTime === slot.time;

                        return (
                          <Button
                            key={slot.time}
                            variant={isSelected ? "default" : "outline"}
                            disabled={!slot.available}
                            onClick={() => onTimeSelect(slot.time)}
                            className={cn(
                              "h-auto flex-col items-start p-3",
                              !slot.available && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <span className="font-semibold">{slot.time}</span>
                            {slot.available && slot.workload && (
                              <div className="flex items-center gap-1 mt-1">
                                <WorkloadIcon className={cn("w-3 h-3", workloadInfo.color)} />
                                <span className={cn("text-xs", workloadInfo.color)}>
                                  {workloadInfo.label}
                                </span>
                              </div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Evening Slots */}
                {eveningSlots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                      Evening (5:00 PM onwards)
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {eveningSlots.map((slot) => {
                        const workloadInfo = getWorkloadInfo(slot.workload);
                        const WorkloadIcon = workloadInfo.icon;
                        const isSelected = selectedTime === slot.time;

                        return (
                          <Button
                            key={slot.time}
                            variant={isSelected ? "default" : "outline"}
                            disabled={!slot.available}
                            onClick={() => onTimeSelect(slot.time)}
                            className={cn(
                              "h-auto flex-col items-start p-3",
                              !slot.available && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <span className="font-semibold">{slot.time}</span>
                            {slot.available && slot.workload && (
                              <div className="flex items-center gap-1 mt-1">
                                <WorkloadIcon className={cn("w-3 h-3", workloadInfo.color)} />
                                <span className={cn("text-xs", workloadInfo.color)}>
                                  {workloadInfo.label}
                                </span>
                              </div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workload Legend */}
      {selectedDate && availableSlots.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <h4 className="text-sm font-semibold mb-3">Demand Indicators:</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Low Demand - Best availability</span>
              </div>
              <div className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm">Moderate - Good availability</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm">High Demand - Limited slots</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
