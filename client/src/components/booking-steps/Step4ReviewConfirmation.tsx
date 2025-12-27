import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Edit,
  Gift,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Step4Props {
  officeName: string;
  serviceName: string;
  servicePrice: string;
  selectedDate: Date | undefined;
  selectedTime: string;
  formData: Record<string, any>;
  usePoints: boolean;
  onUsePointsChange: (use: boolean) => void;
  loyaltyPoints?: number;
  discount?: number;
  onEditStep: (step: number) => void;
}

export function Step4ReviewConfirmation({
  officeName,
  serviceName,
  servicePrice,
  selectedDate,
  selectedTime,
  formData,
  usePoints,
  onUsePointsChange,
  loyaltyPoints = 0,
  discount = 0,
  onEditStep,
}: Step4Props) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const basePrice = parseFloat(servicePrice);
  const finalPrice = Math.max(0, basePrice - discount);

  // Count uploaded documents
  const uploadedDocs = Object.entries(formData).filter(
    ([key, value]) => value instanceof File
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Your Booking</h2>
        <p className="text-muted-foreground">
          Please review all details before confirming your booking
        </p>
      </div>

      {/* Office & Service Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Office</p>
              <p className="font-semibold">{officeName}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(1)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          <Separator />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Service</p>
              <p className="font-semibold">{serviceName}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(1)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedTime || "Not selected"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(3)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submitted Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submitted Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              {Object.entries(formData).map(([key, value]) => {
                if (!value || key === "additionalNotes") return null;

                return (
                  <div key={key}>
                    <p className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="font-medium">
                      {value instanceof File ? (
                        <span className="flex items-center gap-2 text-primary">
                          <CheckCircle2 className="w-4 h-4" />
                          {value.name}
                        </span>
                      ) : (
                        value.toString()
                      )}
                    </p>
                  </div>
                );
              })}

              {uploadedDocs > 0 && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {uploadedDocs} document{uploadedDocs > 1 ? "s" : ""} uploaded successfully
                  </p>
                </div>
              )}

              {formData.additionalNotes && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">Additional Notes</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                    {formData.additionalNotes}
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(2)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="font-semibold">{basePrice.toFixed(3)} OMR</span>
            </div>

            {loyaltyPoints >= 100 && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="usePoints"
                    checked={usePoints}
                    onCheckedChange={(checked) => onUsePointsChange(checked as boolean)}
                  />
                  <label
                    htmlFor="usePoints"
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Use 100 loyalty points for 5 OMR discount
                  </label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Available points: {loyaltyPoints}
                </p>
              </div>
            )}

            {usePoints && discount > 0 && (
              <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                <span>Loyalty Discount</span>
                <span className="font-semibold">-{discount.toFixed(3)} OMR</span>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold">Total Amount</span>
              <span className="font-bold text-primary">
                {finalPrice.toFixed(3)} OMR
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-5 h-5" />
            Cancellation Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
            <li className="flex items-start gap-2">
              <span className="font-semibold mt-0.5">•</span>
              <span>
                Free cancellation up to 24 hours before your appointment
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold mt-0.5">•</span>
              <span>
                Cancellations within 24 hours may incur a 10% penalty fee
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold mt-0.5">•</span>
              <span>
                No-shows will forfeit the full booking amount
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm cursor-pointer leading-relaxed"
            >
              I have reviewed all the details above and agree to the{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              . I understand the cancellation policy and confirm that all
              information provided is accurate.
            </label>
          </div>

          {!acceptedTerms && (
            <p className="text-xs text-muted-foreground mt-3 ml-8">
              Please accept the terms and conditions to proceed with booking
            </p>
          )}
        </CardContent>
      </Card>

      {/* Final Note */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                What happens next?
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your booking will be reviewed by the office. You'll receive a
                confirmation email once approved, typically within 24 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
