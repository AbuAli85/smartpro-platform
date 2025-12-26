import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { type Booking } from "../../../drizzle/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, FileText, User } from "lucide-react";
import { useState } from "react";

interface BookingCalendarProps {
  bookings: Booking[];
  onEventClick?: (booking: Booking) => void;
  onDateClick?: (date: Date) => void;
}

export function BookingCalendar({ bookings, onEventClick, onDateClick }: BookingCalendarProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Transform bookings into FullCalendar events
  const events = useMemo(() => {
    return bookings.map((booking) => {
      // Determine event color based on status
      let backgroundColor = "#6b7280"; // gray for default
      let borderColor = "#6b7280";

      switch (booking.status) {
        case "confirmed":
          backgroundColor = "#10b981"; // green
          borderColor = "#059669";
          break;
        case "pending":
          backgroundColor = "#f59e0b"; // yellow/amber
          borderColor = "#d97706";
          break;
        case "cancelled":
          backgroundColor = "#ef4444"; // red
          borderColor = "#dc2626";
          break;
        case "completed":
          backgroundColor = "#3b82f6"; // blue
          borderColor = "#2563eb";
          break;
        case "in_progress":
          backgroundColor = "#8b5cf6"; // purple
          borderColor = "#7c3aed";
          break;
      }

      // Combine date and time for the event
      if (!booking.scheduledDate) return null;
      const eventDate = new Date(booking.scheduledDate);
      if (booking.scheduledTime) {
        const [hours, minutes] = booking.scheduledTime.split(":");
        eventDate.setHours(parseInt(hours), parseInt(minutes));
      }

      return {
        id: booking.id.toString(),
        title: `Booking #${booking.id}`,
        start: eventDate,
        end: new Date(eventDate.getTime() + (booking.duration || 60) * 60000), // Add duration in milliseconds
        backgroundColor,
        borderColor,
        extendedProps: {
          booking,
        },
      };
    }).filter((event): event is NonNullable<typeof event> => event !== null);
  }, [bookings]);

  const handleEventClick = (info: any) => {
    const booking = info.event.extendedProps.booking as Booking;
    setSelectedBooking(booking);
    if (onEventClick) {
      onEventClick(booking);
    }
  };

  const handleDateClick = (info: any) => {
    if (onDateClick) {
      onDateClick(new Date(info.dateStr));
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }}
          nowIndicator={true}
          editable={false}
          selectable={true}
        />
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Booking ID: #{selectedBooking?.id}</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div>
                <Badge className={getStatusColor(selectedBooking.status)}>
                  {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </Badge>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date</p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.scheduledDate ? new Date(selectedBooking.scheduledDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }) : "Not scheduled"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Time</p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.scheduledTime} ({selectedBooking.duration} minutes)
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Description */}
              {selectedBooking.serviceDescription && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Service Description</p>
                    <p className="text-sm text-gray-600">{selectedBooking.serviceDescription}</p>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {selectedBooking.requirements && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Requirements</p>
                    <p className="text-sm text-gray-600">{selectedBooking.requirements}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">Notes</p>
                  <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Completed Date */}
              {selectedBooking.completedDate && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Completed on{" "}
                    {new Date(selectedBooking.completedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              {/* Cancellation Info */}
              {selectedBooking.status === "cancelled" && selectedBooking.cancellationReason && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-900 mb-1">Cancellation Reason</p>
                  <p className="text-sm text-red-700">{selectedBooking.cancellationReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
