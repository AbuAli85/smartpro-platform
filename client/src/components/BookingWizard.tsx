import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface BookingWizardProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
  onNext?: () => boolean; // Returns true if validation passes
  onBack?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

export function BookingWizard({
  steps,
  currentStep,
  onStepChange,
  children,
  onNext,
  onBack,
  onSubmit,
  isSubmitting = false,
}: BookingWizardProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;

  const handleNext = () => {
    if (onNext) {
      const isValid = onNext();
      if (!isValid) return;
    }
    if (currentStep < steps.length) {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div key={step.id} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <button
                    onClick={() => {
                      if (stepNumber < currentStep) {
                        onStepChange(stepNumber);
                      }
                    }}
                    disabled={stepNumber > currentStep}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all relative z-10",
                      isCompleted &&
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                      isCurrent &&
                        "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !isCompleted &&
                        !isCurrent &&
                        "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span>{stepNumber}</span>
                    )}
                  </button>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isCurrent && "text-primary",
                        !isCurrent && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-6 left-1/2 w-full h-0.5 -z-0",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                    style={{ transform: "translateY(-50%)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isFirstStep || isSubmitting}
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
        </div>

        {isLastStep ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Confirm Booking"}
          </Button>
        ) : (
          <Button onClick={handleNext}>Next Step</Button>
        )}
      </div>
    </div>
  );
}
