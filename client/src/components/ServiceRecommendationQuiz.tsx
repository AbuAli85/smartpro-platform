import { useState } from "react";
import {
  RTLDialog as Dialog,
  RTLDialogContent as DialogContent,
  RTLDialogDescription as DialogDescription,
  RTLDialogHeader as DialogHeader,
  RTLDialogTitle as DialogTitle,
} from "@/components/RTLDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizAnswers {
  businessType: string;
  urgency: string;
  budget: string;
  complexity: string;
  documentsReady: string;
}

interface ServiceRecommendationQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (answers: QuizAnswers) => void;
}

const QUESTIONS = [
  {
    id: "businessType",
    title: "What type of business do you have?",
    description: "This helps us understand your business structure",
    icon: Building2,
    options: [
      { value: "startup", label: "Startup", description: "New business, less than 2 years old" },
      { value: "sme", label: "SME", description: "Small to medium enterprise" },
      { value: "enterprise", label: "Enterprise", description: "Large established company" },
      { value: "individual", label: "Individual", description: "Freelancer or sole proprietor" },
    ],
  },
  {
    id: "urgency",
    title: "How soon do you need this service?",
    description: "We'll prioritize services that match your timeline",
    icon: Clock,
    options: [
      { value: "immediate", label: "Immediate", description: "Within 1-2 days" },
      { value: "within_week", label: "Within a Week", description: "3-7 days" },
      { value: "within_month", label: "Within a Month", description: "Up to 30 days" },
      { value: "flexible", label: "Flexible", description: "No rush, whenever convenient" },
    ],
  },
  {
    id: "budget",
    title: "What's your budget range?",
    description: "We'll suggest services that fit your budget",
    icon: DollarSign,
    options: [
      { value: "low", label: "Budget-Friendly", description: "Under 50 OMR" },
      { value: "medium", label: "Standard", description: "50-150 OMR" },
      { value: "high", label: "Premium", description: "150-500 OMR" },
      { value: "no_limit", label: "No Limit", description: "Quality over cost" },
    ],
  },
  {
    id: "complexity",
    title: "How complex is your requirement?",
    description: "This helps us match you with the right service level",
    icon: FileText,
    options: [
      { value: "simple", label: "Simple", description: "Standard, straightforward process" },
      { value: "moderate", label: "Moderate", description: "Some customization needed" },
      { value: "complex", label: "Complex", description: "Highly customized or specialized" },
    ],
  },
  {
    id: "documentsReady",
    title: "Do you have all required documents ready?",
    description: "This affects how quickly we can process your request",
    icon: CheckCircle2,
    options: [
      { value: "yes", label: "Yes, All Ready", description: "I have everything prepared" },
      { value: "partial", label: "Partially", description: "I have some documents" },
      { value: "no", label: "Not Yet", description: "I need help gathering documents" },
    ],
  },
];

export function ServiceRecommendationQuiz({
  open,
  onOpenChange,
  onComplete,
}: ServiceRecommendationQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQuestion];
  const Icon = question.icon;

  const handleAnswer = (value: string) => {
    const newAnswers = {
      ...answers,
      [question.id]: value,
    };
    setAnswers(newAnswers);

    // Auto-advance to next question
    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Quiz complete
      setTimeout(() => {
        onComplete(newAnswers as QuizAnswers);
        // Reset quiz
        setCurrentQuestion(0);
        setAnswers({});
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    setCurrentQuestion(0);
    setAnswers({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <DialogTitle>Find Your Perfect Service</DialogTitle>
          </div>
          <DialogDescription>
            Answer {QUESTIONS.length} quick questions to get personalized service recommendations
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">{question.title}</h3>
              <p className="text-sm text-muted-foreground">{question.description}</p>
            </div>
          </div>

          {/* Options */}
          <div className="grid gap-3 mt-6">
            {question.options.map((option) => {
              const isSelected = answers[question.id as keyof QuizAnswers] === option.value;

              return (
                <Card
                  key={option.value}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
                    isSelected && "border-primary border-2 bg-primary/5"
                  )}
                  onClick={() => handleAnswer(option.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{option.label}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button variant="ghost" onClick={handleSkip}>
            Skip Quiz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
