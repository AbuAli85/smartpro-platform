import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Star, Award, CheckCircle2, MapPin, Phone, Mail, Clock } from "lucide-react";
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
import { useBookingDraft } from "@/hooks/useBookingDraft";

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

  // Booking draft auto-save
  const { autoSaveDraft, loadDraft, clearDraft, promptRestoreDraft } = useBookingDraft(officeId);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [usePoints, setUsePoints] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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

  // Validate officeId
  const isValidOfficeId = officeId > 0 && !isNaN(officeId);

  // Get office details
  const { data: office, error: officeError } = trpc.sanadOffice.getById.useQuery(
    { id: officeId },
    { enabled: isValidOfficeId }
  );

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
      // Clear draft on successful booking
      clearDraft();
      toast.success(t("booking.createdSuccess"), {
        description: t("booking.createdDescription"),
      });
      setLocation("/bookings");
    },
    onError: (error) => {
      vibrate('error'); // Haptic feedback on error
      toast.error(t("booking.bookingFailed"), {
        description: error.message || t("booking.bookingFailed"),
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

  // Auto-save draft whenever form data changes
  useEffect(() => {
    if (selectedServiceId || Object.keys(formData).length > 0 || selectedDate || selectedTime) {
      autoSaveDraft({
        officeId,
        selectedServiceId,
        formData,
        selectedDate,
        selectedTime,
        currentStep,
      });
    }
  }, [selectedServiceId, formData, selectedDate, selectedTime, currentStep, officeId, autoSaveDraft]);

  // Prompt to restore draft on mount
  useEffect(() => {
    const handleRestore = () => {
      const draft = loadDraft();
      if (draft) {
        setSelectedServiceId(draft.selectedServiceId);
        setFormData(draft.formData);
        setSelectedDate(draft.selectedDate);
        setSelectedTime(draft.selectedTime || "");
        setCurrentStep(draft.currentStep);
        toast.success(t("booking.draftRestored"), {
          description: t("booking.continueWhereYouLeft"),
        });
      }
    };

    const handleDiscard = () => {
      clearDraft();
      toast.info(t("booking.draftDiscarded"));
    };

    // Only prompt if we don't have any form data yet
    if (!selectedServiceId && Object.keys(formData).length === 0) {
      promptRestoreDraft(handleRestore, handleDiscard);
    }
  }, []); // Only run on mount

  const handleSubmit = () => {
    if (!office || !selectedService) return;

    // Validate terms acceptance
    if (!termsAccepted) {
      toast.error(t("booking.acceptTermsToProceed"));
      vibrate('error');
      return;
    }

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

  // Handle invalid office ID
  if (!isValidOfficeId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{t("office.notFound")}</p>
          <Button onClick={() => setLocation("/offices")}>
            {t("office.browseOffices")}
          </Button>
        </div>
      </div>
    );
  }

  // Handle office error
  if (officeError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{t("office.notFound")}</p>
          <Button onClick={() => setLocation("/offices")}>
            {t("office.browseOffices")}
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!office) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("booking.loadingOffice")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Enhanced Header with Office Branding */}
      <div className="bg-card border-b shadow-sm">
        <div className="container py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/offices/${officeId}`)}
            className="mb-6 hover:bg-accent/50 transition-colors"
            aria-label={t("booking.backToOfficeProfile")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("booking.backToOfficeProfile")}
          </Button>
          
          {/* Office Identity Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Office Logo */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <span className="text-3xl font-bold text-primary">
                  {office.officeName.charAt(0)}
                </span>
              </div>
            </div>
            
            {/* Office Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{office.officeName}</h1>
                {office.isVerified && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("office.verified")}
                  </Badge>
                )}
              </div>
              
              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.8</span>
                  <span>({office.reviewsCount || 0} {t("office.reviews")})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-primary" />
                  <span>{t("office.certified")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{office.governorate}, {office.wilayat}</span>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                {office.phone && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{office.phone}</span>
                  </div>
                )}
                {office.email && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{office.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Wizard */}
          <div className="lg:col-span-2">
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
              onTermsAccepted={setTermsAccepted}
            />
          )}
            </BookingWizard>
          </div>
          
          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6 shadow-lg border-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t("booking.bookingSummary")}
              </h3>
              
              {/* Office Summary */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("booking.office")}</p>
                  <p className="font-medium">{office.officeName}</p>
                </div>
                
                {/* Selected Service */}
                {selectedService && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">{t("booking.selectedService")}</p>
                    <p className="font-medium">{selectedService.serviceName}</p>
                    <p className="text-lg font-bold text-primary mt-2">
                      {selectedService.price} {t("common.omr")}
                    </p>
                  </div>
                )}
                
                {/* Selected Date & Time */}
                {selectedDate && selectedTime && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">{t("booking.dateTime")}</p>
                    <p className="font-medium">
                      {selectedDate.toLocaleDateString("ar-OM", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedTime}</p>
                  </div>
                )}
                
                {/* Loyalty Points Discount */}
                {usePoints && discount > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{t("booking.pointsDiscount")}</span>
                      <span className="text-green-600 font-medium">-{discount} {t("common.omr")}</span>
                    </div>
                  </div>
                )}
                
                {/* Total Price */}
                {selectedService && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{t("booking.total")}</span>
                      <span className="text-2xl font-bold text-primary">
                        {(basePrice - discount).toFixed(3)} {t("common.omr")}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Progress Indicator */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("booking.step")} {currentStep} {t("booking.of")} {WIZARD_STEPS.length}
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-300"
                      style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Help Section */}
                <div className="pt-4 border-t bg-muted/50 -mx-6 -mb-6 p-6 rounded-b-lg">
                  <p className="text-sm font-medium mb-2">{t("booking.needHelp")}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {t("booking.contactOffice")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // Open chat widget
                      const chatButton = document.querySelector('[data-chat-widget]');
                      if (chatButton instanceof HTMLElement) {
                        chatButton.click();
                      }
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {t("booking.chatWithOffice")}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {office && <ChatWidget officeId={office.id} officeName={office.officeName} />}
    </div>
  );
}
