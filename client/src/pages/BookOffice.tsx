import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import ChatWidget from "@/components/ChatWidget";
import { BookingWizard } from "@/components/BookingWizard";
import { Step1ServiceSelection } from "@/components/booking-steps/Step1ServiceSelection";
import { Step2ServiceRequirements } from "@/components/booking-steps/Step2ServiceRequirements";
import { Step3TimeSlotSelection } from "@/components/booking-steps/Step3TimeSlotSelection";
import { Step4ReviewConfirmation } from "@/components/booking-steps/Step4ReviewConfirmation";
import { ServiceComparison } from "@/components/ServiceComparison";
import { ServiceRecommendationQuiz } from "@/components/ServiceRecommendationQuiz";
import { RecommendationResults } from "@/components/RecommendationResults";
import { getServiceConfig } from "@/../../shared/serviceRequirements";

export default function BookOffice() {
  const { t } = useLanguage();
  const { vibrate } = useHapticFeedback();
  
  // Wizard steps with translations
  const WIZARD_STEPS = [
    {
      id: 1,
      title: t("booking.selectService"),
      description: t("booking.chooseYourService"),
    },
    {
      id: 2,
      title: t("booking.requirements"),
      description: t("booking.provideDetails"),
    },
    {
      id: 3,
      title: t("booking.dateTime"),
      description: t("booking.pickSlot"),
    },
    {
      id: 4,
      title: t("booking.review"),
      description: t("booking.confirmBooking"),
    },
  ];
  const [, params] = useRoute("/offices/:id/book");
  const [, setLocation] = useLocation();
  const officeId = params?.id ? parseInt(params.id) : 0;

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [usePoints, setUsePoints] = useState(false);

  // Comparison state
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  // Recommendation state
  const [quizOpen, setQuizOpen] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<any>(null);

  const handleToggleComparison = (serviceId: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else if (prev.length < 3) {
        return [...prev, serviceId];
      }
      return prev;
    });
  };

  // Recommendation handlers
  const handleQuizComplete = (answers: any) => {
    setQuizAnswers(answers);
    setQuizOpen(false);
    // Wait for quiz to close, then show results
    setTimeout(() => {
      setRecommendationsOpen(true);
    }, 300);
  };

  const handleSelectRecommendedService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    toast.success(t("booking.serviceSelected"), {
      description: t("booking.serviceMatchDescription"),
    });
  };

  // Get office details
  const { data: office } = trpc.sanadOffice.getById.useQuery({ id: officeId }, { enabled: officeId > 0 });

  // Get recommendations query
  const { data: recommendations } = trpc.sanadOffice.recommendServices.useQuery(
    {
      officeId: office?.id || 0,
      answers: quizAnswers,
    },
    {
      enabled: !!office && !!quizAnswers,
    }
  );

  // Get available services for this office
  const { data: services } = trpc.sanadOffice.getServices.useQuery(
    { officeId: office?.id || 0 },
    { enabled: !!office }
  );

  // Get selected service details
  const selectedService = services?.find((s) => s.id === parseInt(selectedServiceId));

  // Get user loyalty points
  const { data: loyalty } = trpc.loyalty.getMyLoyalty.useQuery();

  // Calculate price with points discount
  const POINTS_TO_REDEEM = 100;
  const DISCOUNT_AMOUNT = 5; // 5 OMR discount for 100 points
  const basePrice = selectedService?.price ? parseFloat(selectedService.price) : 0;
  const discount =
    usePoints && loyalty && loyalty.availablePoints >= POINTS_TO_REDEEM
      ? DISCOUNT_AMOUNT
      : 0;

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

  // Transform slots to include workload (mock data for now)
  const transformedSlots = slots?.map((slot) => ({
    ...slot,
    workload: (Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low") as "low" | "medium" | "high",
  })) || [];

  const createBookingMutation = trpc.booking.create.useMutation({
    onSuccess: () => {
      vibrate('success'); // Haptic feedback on success
      toast.success("Booking Created!", {
        description: "Your booking request has been submitted successfully.",
      });
      setLocation("/bookings");
    },
    onError: (error) => {
      vibrate('error'); // Haptic feedback on error
      toast.error(t("booking.bookingFailed"), {
        description: error.message,
      });
    },
  });

  // Validation functions for each step
  const validateStep1 = () => {
    if (!selectedServiceId) {
      toast.error(t("booking.pleaseSelectService"));
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!selectedService) return false;

    // Check if all required fields are filled
    const config = getServiceConfig(selectedService.serviceName);

    const requiredFields = config.formFields.filter((field: any) => field.required);
    const missingFields = requiredFields.filter(
      (field: any) => !formData[field.id] || formData[field.id] === ""
    );

    if (missingFields.length > 0) {
      toast.error(t("booking.missingRequiredInfo"), {
        description: t("booking.pleaseFillIn").replace("{fields}", missingFields.map((f: any) => f.label).join(", ")),
      });
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!selectedDate) {
      toast.error(t("booking.pleaseSelectDate"));
      return false;
    }
    if (!selectedTime) {
      toast.error(t("booking.pleaseSelectTimeSlot"));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (!office || !selectedService) return;

    // Build service description from form data
    const serviceDescription = Object.entries(formData)
      .filter(([key, value]) => value && !(value instanceof File))
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    createBookingMutation.mutate({
      officeId: office.id,
      serviceId: parseInt(selectedServiceId),
      serviceDescription: serviceDescription || t("booking.serviceBooking"),
      requirements: formData.additionalNotes || "",
      scheduledDate: selectedDate!.toISOString(),
      scheduledTime: selectedTime,
      duration: 60,
      usePoints: !!(usePoints && loyalty && loyalty.availablePoints >= POINTS_TO_REDEEM),
    });
  };

  if (!office) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading office details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/offices/${officeId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Office Profile
          </Button>
          <h1 className="text-3xl font-bold">Book a Service</h1>
          <p className="text-muted-foreground mt-2">{office.officeName}</p>
        </div>
      </div>

      <div className="container py-8">
        <BookingWizard
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onNext={handleNext}
          onSubmit={handleSubmit}
          isSubmitting={createBookingMutation.isPending}
        >
          {currentStep === 1 && (
            <>
              <Step1ServiceSelection
                services={(services || []).map(s => ({
                  ...s,
                  estimatedDuration: s.estimatedDeliveryDays ? `${s.estimatedDeliveryDays} days` : "3-5 days",
                  price: s.price || "0",
                  description: s.description || undefined,
                }))}
                selectedServiceId={selectedServiceId}
                onServiceSelect={setSelectedServiceId}
                selectedForComparison={selectedForComparison}
                onToggleComparison={handleToggleComparison}
                onOpenComparison={() => setComparisonOpen(true)}
                onOpenRecommendation={() => setQuizOpen(true)}
              />
              <ServiceRecommendationQuiz
                open={quizOpen}
                onOpenChange={setQuizOpen}
                onComplete={handleQuizComplete}
              />
              <RecommendationResults
                open={recommendationsOpen}
                onOpenChange={setRecommendationsOpen}
                recommendations={recommendations || []}
                onSelectService={handleSelectRecommendedService}
              />
              <ServiceComparison
                services={(services || []).map(s => ({
                  ...s,
                  estimatedDuration: s.estimatedDeliveryDays ? `${s.estimatedDeliveryDays} days` : "3-5 days",
                  price: s.price || "0",
                  description: s.description || undefined,
                }))}
                selectedServices={selectedForComparison}
                onToggleService={handleToggleComparison}
                onSelectService={(serviceId) => {
                  setSelectedServiceId(serviceId);
                  setComparisonOpen(false);
                }}
                open={comparisonOpen}
                onOpenChange={setComparisonOpen}
              />
            </>
          )}

          {currentStep === 2 && selectedService && (
            <Step2ServiceRequirements
              serviceName={selectedService.serviceName}
              formData={formData}
              onFormDataChange={setFormData}
            />
          )}

          {currentStep === 3 && (
            <Step3TimeSlotSelection
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
              availableSlots={transformedSlots}
              isLoadingSlots={loadingSlots}
            />
          )}

          {currentStep === 4 && selectedService && (
            <Step4ReviewConfirmation
              officeName={office.officeName}
              serviceName={selectedService.serviceName}
              servicePrice={selectedService.price || "0"}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              formData={formData}
              usePoints={usePoints}
              onUsePointsChange={setUsePoints}
              loyaltyPoints={loyalty?.availablePoints}
              discount={discount}
              onEditStep={setCurrentStep}
            />
          )}
        </BookingWizard>
      </div>

      {office && <ChatWidget officeId={office.id} officeName={office.officeName} />}
    </div>
  );
}
