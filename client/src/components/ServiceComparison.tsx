import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RTLDialog as Dialog,
  RTLDialogContent as DialogContent,
  RTLDialogDescription as DialogDescription,
  RTLDialogHeader as DialogHeader,
  RTLDialogTitle as DialogTitle,
} from "@/components/RTLDialog";
import {
  CheckCircle2,
  X,
  DollarSign,
  Clock,
  FileText,
  TrendingDown,
  Zap,
  Award,
} from "lucide-react";
import { getServiceConfig } from "@/../../shared/serviceRequirements";
import { cn } from "@/lib/utils";

interface Service {
  id: number;
  serviceName: string;
  price: string;
  estimatedDuration: string;
  description?: string;
}

interface ServiceComparisonProps {
  services: Service[];
  selectedServices: string[];
  onToggleService: (serviceId: string) => void;
  onSelectService: (serviceId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceComparison({
  services,
  selectedServices,
  onToggleService,
  onSelectService,
  open,
  onOpenChange,
}: ServiceComparisonProps) {
  const comparedServices = services.filter((s) =>
    selectedServices.includes(s.id.toString())
  );

  // Find best value and fastest service
  const prices = comparedServices.map((s) => parseFloat(s.price));
  const lowestPrice = Math.min(...prices);
  const bestValueServiceId = comparedServices.find(
    (s) => parseFloat(s.price) === lowestPrice
  )?.id;

  // Parse duration to find fastest (assuming format like "3-5 days" or "5 days")
  const getFastestDays = (duration: string): number => {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 999;
  };

  const durations = comparedServices.map((s) => getFastestDays(s.estimatedDuration));
  const fastestDuration = Math.min(...durations);
  const fastestServiceId = comparedServices.find(
    (s) => getFastestDays(s.estimatedDuration) === fastestDuration
  )?.id;

  if (comparedServices.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compare Services</DialogTitle>
            <DialogDescription>
              Select 2-3 services from the list to compare their features
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No services selected for comparison
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Select services from the booking page to compare them here
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Service Comparison</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Compare features, pricing, and requirements side-by-side
          </DialogDescription>
        </DialogHeader>

        {/* Mobile Warning */}
        <div className="md:hidden bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 Tip: Rotate your device to landscape mode for better comparison view
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header Row - Service Names */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `200px repeat(${comparedServices.length}, 1fr)` }}>
              <div className="font-semibold text-muted-foreground">
                {comparedServices.length} Services
              </div>
              {comparedServices.map((service) => {
                const config = getServiceConfig(service.serviceName);
                const isBestValue = service.id === bestValueServiceId;
                const isFastest = service.id === fastestServiceId;

                return (
                  <Card key={service.id} className={cn(
                    "relative",
                    (isBestValue || isFastest) && "ring-2 ring-primary"
                  )}>
                    <CardHeader className="pb-3">
                      {(isBestValue || isFastest) && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {isBestValue && isFastest ? "Best Value & Fastest" : isBestValue ? "Best Value" : "Fastest"}
                          </Badge>
                        </div>
                      )}
                      <CardTitle className="text-lg">{service.serviceName}</CardTitle>
                      {service.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {service.description}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {/* Price Row */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `200px repeat(${comparedServices.length}, 1fr)` }}>
              <div className="flex items-center gap-2 font-medium">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>Price</span>
              </div>
              {comparedServices.map((service) => {
                const price = parseFloat(service.price);
                const isCheapest = price === lowestPrice;
                const priceDiff = price - lowestPrice;

                return (
                  <Card key={service.id} className="p-4">
                    <div className="space-y-1">
                      <p className={cn(
                        "text-2xl font-bold",
                        isCheapest && "text-green-600 dark:text-green-400"
                      )}>
                        {price.toFixed(3)} OMR
                      </p>
                      {!isCheapest && priceDiff > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{priceDiff.toFixed(3)} OMR more
                        </p>
                      )}
                      {isCheapest && (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <TrendingDown className="w-3 h-3" />
                          <span>Lowest price</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Duration Row */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `200px repeat(${comparedServices.length}, 1fr)` }}>
              <div className="flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Turnaround Time</span>
              </div>
              {comparedServices.map((service) => {
                const config = getServiceConfig(service.serviceName);
                const isFastest = service.id === fastestServiceId;

                return (
                  <Card key={service.id} className="p-4">
                    <div className="space-y-1">
                      <p className={cn(
                        "font-semibold",
                        isFastest && "text-blue-600 dark:text-blue-400"
                      )}>
                        {config.turnaroundTime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Typical: {service.estimatedDuration}
                      </p>
                      {isFastest && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                          <Zap className="w-3 h-3" />
                          <span>Fastest option</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            <Separator className="my-4" />

            {/* What's Included Row */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `200px repeat(${comparedServices.length}, 1fr)` }}>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <span>What's Included</span>
              </div>
              {comparedServices.map((service) => {
                const config = getServiceConfig(service.serviceName);

                return (
                  <Card key={service.id} className="p-4">
                    <ul className="space-y-2">
                      {config.whatsIncluded.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>

            {/* Required Documents Row */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `200px repeat(${comparedServices.length}, 1fr)` }}>
              <div className="flex items-center gap-2 font-medium">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Required Documents</span>
              </div>
              {comparedServices.map((service) => {
                const config = getServiceConfig(service.serviceName);

                return (
                  <Card key={service.id} className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {config.requiredDocuments.map((doc, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {config.requiredDocuments.length} document{config.requiredDocuments.length > 1 ? "s" : ""} required
                    </p>
                  </Card>
                );
              })}
            </div>

            {/* Action Buttons Row */}
            <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: `200px repeat(${comparedServices.length}, 1fr)` }}>
              <div></div>
              {comparedServices.map((service) => (
                <div key={service.id} className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      onSelectService(service.id.toString());
                      onOpenChange(false);
                    }}
                  >
                    Select This Service
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onToggleService(service.id.toString())}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove from Comparison
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Comparing {comparedServices.length} service{comparedServices.length > 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                selectedServices.forEach(id => onToggleService(id));
              }}
            >
              Clear All
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
