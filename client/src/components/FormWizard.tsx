import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface WizardStep {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  fields: string[]; // Field names that belong to this step
  optional?: boolean;
}

interface FormWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  children: ReactNode;
  formData: Record<string, any>;
  errors?: Record<string, string>;
  isSubmitting?: boolean;
  persistKey?: string; // LocalStorage key for persistence
}

export function FormWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  children,
  formData,
  errors = {},
  isSubmitting = false,
  persistKey,
}: FormWizardProps) {
  const { t, language } = useLanguage();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Load progress from localStorage
  useEffect(() => {
    if (persistKey) {
      const saved = localStorage.getItem(`wizard_progress_${persistKey}`);
      if (saved) {
        const { completed, step } = JSON.parse(saved);
        setCompletedSteps(new Set(completed));
        onStepChange(step);
      }
    }
  }, [persistKey]);

  // Save progress to localStorage
  useEffect(() => {
    if (persistKey) {
      localStorage.setItem(
        `wizard_progress_${persistKey}`,
        JSON.stringify({
          completed: Array.from(completedSteps),
          step: currentStep,
        })
      );
    }
  }, [currentStep, completedSteps, persistKey]);

  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Check if current step is valid
  const isStepValid = () => {
    if (currentStepData.optional) return true;
    
    const stepFields = currentStepData.fields;
    const hasRequiredFields = stepFields.some(field => {
      const value = formData[field];
      return value === undefined || value === null || value === "";
    });

    return !hasRequiredFields;
  };

  // Check if step has errors
  const hasStepErrors = () => {
    return currentStepData.fields.some(field => errors[field]);
  };

  const handleNext = () => {
    if (!isStepValid()) {
      return;
    }

    setCompletedSteps(prev => new Set(prev).add(currentStep));

    if (currentStep < totalSteps - 1) {
      onStepChange(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or next step
    if (completedSteps.has(stepIndex) || stepIndex === currentStep + 1) {
      onStepChange(stepIndex);
    }
  };

  const getStepTitle = (step: WizardStep) => {
    return language === "ar" && step.titleAr ? step.titleAr : step.title;
  };

  const getStepDescription = (step: WizardStep) => {
    return language === "ar" && step.descriptionAr ? step.descriptionAr : step.description;
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {t("wizard.step")} {currentStep + 1} {t("common.of")} {totalSteps}
              </span>
              <span className="text-gray-500">
                {Math.round(progress)}% {t("wizard.complete")}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = index === currentStep;
          const isAccessible = isCompleted || isCurrent || index === currentStep + 1;

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              disabled={!isAccessible}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all min-w-fit
                ${isCurrent ? "border-blue-600 bg-blue-50 text-blue-900" : ""}
                ${isCompleted ? "border-green-600 bg-green-50 text-green-900" : ""}
                ${!isCurrent && !isCompleted ? "border-gray-300 bg-white text-gray-600" : ""}
                ${!isAccessible ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
              `}
            >
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                  ${isCurrent ? "bg-blue-600 text-white" : ""}
                  ${isCompleted ? "bg-green-600 text-white" : ""}
                  ${!isCurrent && !isCompleted ? "bg-gray-300 text-gray-600" : ""}
                `}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className="font-medium text-sm">{getStepTitle(step)}</span>
              {step.optional && (
                <Badge variant="outline" className="text-xs">
                  {t("wizard.optional")}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{getStepTitle(currentStepData)}</CardTitle>
              {currentStepData.description && (
                <CardDescription className="text-base mt-2">
                  {getStepDescription(currentStepData)}
                </CardDescription>
              )}
            </div>
            {currentStepData.optional && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {t("wizard.optional")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Validation Errors */}
          {hasStepErrors() && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900 mb-1">
                  {t("wizard.pleaseFixErrors")}
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  {currentStepData.fields
                    .filter(field => errors[field])
                    .map(field => (
                      <li key={field}>• {errors[field]}</li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">{children}</div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("wizard.back")}
        </Button>

        <div className="flex items-center gap-2">
          {currentStep < totalSteps - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid() || hasStepErrors() || isSubmitting}
              className="gap-2"
            >
              {t("wizard.next")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid() || hasStepErrors() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {t("wizard.submitting")}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t("wizard.submit")}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Clear Progress Button (Development) */}
      {persistKey && (
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem(`wizard_progress_${persistKey}`);
              setCompletedSteps(new Set());
              onStepChange(0);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            {t("wizard.resetProgress")}
          </Button>
        </div>
      )}
    </div>
  );
}
