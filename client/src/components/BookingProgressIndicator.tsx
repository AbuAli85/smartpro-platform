import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BookingProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: number;
    title: string;
    titleAr: string;
  }>;
}

export function BookingProgressIndicator({
  currentStep,
  totalSteps,
  steps,
}: BookingProgressIndicatorProps) {
  const { language } = useLanguage();

  return (
    <div className="w-full py-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isUpcoming = step.id > currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300 bg-background
                    ${isCompleted ? 'border-primary bg-primary text-primary-foreground' : ''}
                    ${isCurrent ? 'border-primary text-primary scale-110' : ''}
                    ${isUpcoming ? 'border-muted-foreground text-muted-foreground' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center max-w-[120px]">
                  <p
                    className={`
                      text-xs font-medium transition-colors
                      ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}
                    `}
                  >
                    {language === 'ar' ? step.titleAr : step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Counter */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {language === 'ar' ? (
            <>الخطوة {currentStep} من {totalSteps}</>
          ) : (
            <>Step {currentStep} of {totalSteps}</>
          )}
        </p>
      </div>
    </div>
  );
}
