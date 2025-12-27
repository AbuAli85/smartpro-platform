import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Medal,
  Award,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Recommendation {
  serviceId: number;
  serviceName: string;
  matchScore: number;
  reasons: string[];
  price: string;
  estimatedDuration: string;
}

interface RecommendationResultsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendations: Recommendation[];
  onSelectService: (serviceId: string) => void;
}

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return { Icon: Trophy, color: "text-yellow-500", label: "Best Match" };
    case 1:
      return { Icon: Medal, color: "text-gray-400", label: "Great Match" };
    case 2:
      return { Icon: Award, color: "text-amber-600", label: "Good Match" };
    default:
      return { Icon: CheckCircle2, color: "text-primary", label: "Match" };
  }
};

const getMatchScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  return "text-orange-600";
};

const getMatchScoreBg = (score: number) => {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-blue-50 border-blue-200";
  return "bg-orange-50 border-orange-200";
};

export function RecommendationResults({
  open,
  onOpenChange,
  recommendations,
  onSelectService,
}: RecommendationResultsProps) {
  const handleSelectService = (serviceId: number) => {
    onSelectService(serviceId.toString());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <DialogTitle>Your Personalized Recommendations</DialogTitle>
          </div>
          <DialogDescription>
            Based on your answers, here are the top {recommendations.length} services that best match your needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {recommendations.map((recommendation, index) => {
            const { Icon, color, label } = getRankIcon(index);
            const matchScoreColor = getMatchScoreColor(recommendation.matchScore);
            const matchScoreBg = getMatchScoreBg(recommendation.matchScore);

            return (
              <Card
                key={recommendation.serviceId}
                className={cn(
                  "transition-all hover:shadow-lg cursor-pointer border-2",
                  index === 0 && "border-primary/50 shadow-md"
                )}
                onClick={() => handleSelectService(recommendation.serviceId)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Rank Icon */}
                      <div className={cn("w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0", index === 0 && "bg-primary/10")}>
                        <Icon className={cn("w-5 h-5", color)} />
                      </div>

                      {/* Service Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">
                            {recommendation.serviceName}
                          </CardTitle>
                          {index === 0 && (
                            <Badge variant="default" className="bg-primary">
                              {label}
                            </Badge>
                          )}
                        </div>

                        {/* Match Score */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className={cn("px-3 py-1 rounded-full border", matchScoreBg)}>
                            <span className={cn("text-sm font-semibold", matchScoreColor)}>
                              {recommendation.matchScore}% Match
                            </span>
                          </div>
                          <Progress
                            value={recommendation.matchScore}
                            className="h-2 flex-1 max-w-[120px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Reasons */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Why this service?
                    </p>
                    <div className="space-y-1.5">
                      {recommendation.reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{recommendation.price} OMR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {recommendation.estimatedDuration}
                      </span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button
                    className="w-full"
                    variant={index === 0 ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectService(recommendation.serviceId);
                    }}
                  >
                    Select This Service
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Not what you're looking for?
          </p>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Browse All Services
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
