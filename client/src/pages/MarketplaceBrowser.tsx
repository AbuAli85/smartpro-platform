import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, DollarSign, MapPin, Clock, Building2, Filter } from "lucide-react";
import { BidSubmissionDialog } from "@/components/BidSubmissionDialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MarketplaceBrowser() {
  const { t } = useLanguage();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  
  // Filters
  const [serviceType, setServiceType] = useState<string>("all");
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [location, setLocation] = useState<string>("all");

  const { data: requests, isLoading, refetch } = trpc.serviceMarketplace.listRequests.useQuery({
    status: "open",
    category: serviceType !== "all" ? serviceType : undefined,
    governorate: location !== "all" ? location : undefined,
  });

  const handleOpenBidDialog = (request: any) => {
    setSelectedRequest(request);
    setBidDialogOpen(true);
  };

  const handleBidSubmitted = () => {
    toast.success("Bid Submitted Successfully!");
    refetch();
    setBidDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("pages.serviceRequestMarketplace")}</h1>
          <p className="text-muted-foreground">
            {t("pages.serviceRequestMarketplaceDesc")}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Service Type</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="Commercial Registration">Commercial Registration</SelectItem>
                    <SelectItem value="Tax Registration">Tax Registration</SelectItem>
                    <SelectItem value="VAT Registration">VAT Registration</SelectItem>
                    <SelectItem value="License Renewal">License Renewal</SelectItem>
                    <SelectItem value="Legal Consultation">Legal Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Min Budget (OMR)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                />
              </div>

              <div>
                <Label>Max Budget (OMR)</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>

              <div>
                <Label>Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Muscat">Muscat</SelectItem>
                    <SelectItem value="Salalah">Salalah</SelectItem>
                    <SelectItem value="Sohar">Sohar</SelectItem>
                    <SelectItem value="Nizwa">Nizwa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Requests Grid */}
        {requests && requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request: any) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.serviceType}</CardTitle>
                      <CardDescription className="mt-1">
                        Posted {new Date(request.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={request.urgency === "urgent" ? "destructive" : "secondary"}>
                      {request.urgency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {request.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {request.minBudget} - {request.maxBudget} OMR
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        Deadline: {new Date(request.deadline).toLocaleDateString()}
                      </span>
                    </div>

                    {request.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{request.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span>{request.bidCount || 0} bids submitted</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleOpenBidDialog(request)}
                  >
                    Submit Bid
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t("empty.noServiceRequestsFound")}</h3>
              <p className="text-muted-foreground">
                {t("empty.noServiceRequestsFoundDesc")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedRequest && (
        <BidSubmissionDialog
          open={bidDialogOpen}
          onOpenChange={setBidDialogOpen}
          request={selectedRequest}
          onBidSubmitted={handleBidSubmitted}
        />
      )}
    </div>
  );
}
