import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";

export default function BookOffice() {
  const [, params] = useRoute("/offices/:slug/book");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  // Get office details
  const { data: office } = trpc.sanadOffice.getBySlug.useQuery({ slug });

  // Get available time slots when date is selected
  const { data: slots, isLoading: loadingSlots } = trpc.booking.getAvailableSlots.useQuery(
    {
      officeId: office?.id || 0,
      date: selectedDate?.toISOString() || "",
    },
    {
      enabled: !!office && !!selectedDate,
    }
  );

  const createBookingMutation = trpc.booking.create.useMutation({
    onSuccess: () => {
      toast.success("Booking Created!", {
        description: "Your booking request has been submitted successfully.",
      });
      setLocation("/bookings");
    },
    onError: (error) => {
      toast.error("Booking Failed", {
        description: error.message,
      });
    },
  });

  const handleSubmit = () => {
    if (!office || !selectedDate || !selectedTime) {
      toast.error("Missing Information", {
        description: "Please select a date and time slot",
      });
      return;
    }

    if (!serviceDescription || serviceDescription.length < 10) {
      toast.error("Service Description Required", {
        description: "Please describe the service you need (minimum 10 characters)",
      });
      return;
    }

    createBookingMutation.mutate({
      officeId: office.id,
      serviceDescription,
      requirements,
      scheduledDate: selectedDate.toISOString(),
      scheduledTime: selectedTime,
      duration: 60,
    });
  };

  if (!office) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading office details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/offices/${slug}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Office
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-2">{office.officeName}</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Select Date
                </CardTitle>
                <CardDescription>Choose your preferred appointment date</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time Slot Selection */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Select Time Slot
                  </CardTitle>
                  <CardDescription>
                    Available slots for {selectedDate.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading available slots...</p>
                    </div>
                  ) : slots && slots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {slots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className="w-full"
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No available slots for this date</p>
                      <p className="text-sm text-gray-400 mt-1">Please select a different date</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>Describe the service you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="serviceDescription">
                    Service Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="serviceDescription"
                    placeholder="Describe the service you need (minimum 10 characters)"
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Additional Requirements (Optional)</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Any specific requirements or documents needed"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedDate || !selectedTime || createBookingMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {createBookingMutation.isPending ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Office</p>
                  <p className="text-sm font-semibold">{office.officeName}</p>
                </div>

                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-sm font-semibold">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {selectedTime && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Time</p>
                    <p className="text-sm font-semibold">{selectedTime}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-sm">60 minutes</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Your booking will be reviewed by the office. You'll receive a confirmation once approved.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
