import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface RequestWizardProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export function RequestWizard({ steps, currentStep, onStepClick, className }: RequestWizardProps) {
  return (
    <div className={cn("w-full py-8", className)}>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            const isClickable = onStepClick && (isCompleted || isCurrent);

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center",
                  isClickable && "cursor-pointer"
                )}
                onClick={() => isClickable && onStepClick(stepNumber)}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white",
                    isCompleted && "border-blue-600 bg-blue-600 text-white",
                    isCurrent && "border-blue-600 text-blue-600 shadow-lg scale-110",
                    !isCompleted && !isCurrent && "border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>

                {/* Step label */}
                <div className="mt-3 text-center max-w-[120px]">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCurrent && "text-blue-600",
                      isCompleted && "text-gray-700",
                      !isCompleted && !isCurrent && "text-gray-400"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit?: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  backLabel?: string;
  submitLabel?: string;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSubmit,
  isNextDisabled = false,
  isSubmitting = false,
  nextLabel = "Next",
  backLabel = "Back",
  submitLabel = "Submit Request",
}: WizardNavigationProps) {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep || isSubmitting}
        className={cn(
          "px-6 py-2 rounded-lg font-medium transition-all",
          isFirstStep || isSubmitting
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        )}
      >
        {backLabel}
      </button>

      <div className="text-sm text-gray-500">
        Step {currentStep} of {totalSteps}
      </div>

      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isNextDisabled || isSubmitting}
          className={cn(
            "px-6 py-2 rounded-lg font-medium transition-all",
            isNextDisabled || isSubmitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
          )}
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
          className={cn(
            "px-6 py-2 rounded-lg font-medium transition-all",
            isNextDisabled || isSubmitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
          )}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}
