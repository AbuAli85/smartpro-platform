import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2, Gift } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function BookOffice() {
  const [, params] = useRoute("/offices/:slug/book");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [usePoints, setUsePoints] = useState(false);

  // Get office details
  const { data: office } = trpc.sanadOffice.getBySlug.useQuery({ slug });

  // Get available services for this office
  const { data: services } = trpc.sanadOffice.getServices.useQuery(
    { officeId: office?.id || 0 },
    { enabled: !!office }
  );

  // Get selected service details
  const selectedService = services?.find(s => s.id === parseInt(selectedServiceId));

  // Get user loyalty points
  const { data: loyalty } = trpc.loyalty.getMyLoyalty.useQuery();

  // Calculate price with points discount
  const POINTS_TO_REDEEM = 100;
  const DISCOUNT_AMOUNT = 5; // 5 OMR discount for 100 points
  const basePrice = selectedService?.price ? parseFloat(selectedService.price) : 0;
  const discount = usePoints && loyalty && loyalty.availablePoints >= POINTS_TO_REDEEM ? DISCOUNT_AMOUNT : 0;
  const finalPrice = Math.max(0, basePrice - discount);

  // Check if user has enough points
  const hasEnoughPoints = loyalty && loyalty.availablePoints >= POINTS_TO_REDEEM;

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
    if (!selectedServiceId) {
      toast.error("Please select a service");
      return;
    }
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

    // Check if using points and validate
    if (usePoints && (!loyalty || loyalty.availablePoints < POINTS_TO_REDEEM)) {
      toast.error("Insufficient Points", {
        description: `You need ${POINTS_TO_REDEEM} points to redeem this discount`,
      });
      return;
    }

    createBookingMutation.mutate({
      officeId: office.id,
      serviceId: parseInt(selectedServiceId),
      serviceDescription,
      requirements,
      scheduledDate: selectedDate.toISOString(),
      scheduledTime: selectedTime,
      duration: 60,
      usePoints: !!(usePoints && hasEnoughPoints),
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
                  <Label htmlFor="service">
                    Select Service <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.serviceName} - {service.price} OMR ({service.estimatedDeliveryDays} days)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedService && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedService.description}
                    </p>
                  )}
                </div>

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

                {selectedService && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Service</p>
                    <p className="text-sm font-semibold">{selectedService.serviceName}</p>
                    <p className="text-sm text-gray-600">{selectedService.price} OMR</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-sm">60 minutes</p>
                </div>

                {/* Points Redemption */}
                {selectedService && loyalty && (
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="usePoints"
                          checked={usePoints}
                          onCheckedChange={(checked) => setUsePoints(checked as boolean)}
                          disabled={!hasEnoughPoints}
                        />
                        <Label
                          htmlFor="usePoints"
                          className={`text-sm cursor-pointer ${!hasEnoughPoints ? 'text-gray-400' : ''}`}
                        >
                          Use 100 points for 5 OMR discount
                        </Label>
                      </div>
                      <Gift className="h-4 w-4 text-[#003366]" />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Available points: <span className="font-semibold text-[#003366]">{loyalty.availablePoints}</span>
                      {!hasEnoughPoints && (
                        <span className="block text-yellow-600 mt-1">
                          Need {POINTS_TO_REDEEM - loyalty.availablePoints} more points
                        </span>
                      )}
                    </div>

                    {usePoints && hasEnoughPoints && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Base Price:</span>
                          <span>{basePrice.toFixed(2)} OMR</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-green-600">
                          <span>Points Discount:</span>
                          <span>-{discount.toFixed(2)} OMR</span>
                        </div>
                        <div className="flex items-center justify-between text-base font-bold mt-2 pt-2 border-t border-green-200">
                          <span>Final Price:</span>
                          <span className="text-[#003366]">{finalPrice.toFixed(2)} OMR</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
