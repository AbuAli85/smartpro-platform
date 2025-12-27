import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { FileText, DollarSign, Calendar, MapPin, Zap } from "lucide-react";

const SERVICE_TYPES = [
  "Commercial Registration",
  "Tax Registration",
  "VAT Registration",
  "Business License",
  "Trade License",
  "Legal Consultation",
  "Accounting Services",
  "Document Translation",
  "Other",
];

const GOVERNORATES = [
  "Muscat",
  "Dhofar",
  "Musandam",
  "Al Buraimi",
  "Ad Dakhiliyah",
  "Al Batinah North",
  "Al Batinah South",
  "Ash Sharqiyah North",
  "Ash Sharqiyah South",
  "Al Dhahirah",
  "Al Wusta",
];

export default function RequestServicePage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceType: "",
    requirements: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    urgency: "medium" as "low" | "medium" | "high" | "urgent",
    governorate: "",
    wilayat: "",
    remoteAccepted: true,
  });

  const createRequest = trpc.serviceMarketplace.createRequest.useMutation({
    onSuccess: (data) => {
      toast.success("Service request posted successfully!");
      setLocation(`/marketplace/requests/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post service request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createRequest.mutate({
      title: formData.title,
      description: formData.description,
      serviceType: formData.serviceType,
      requirements: formData.requirements || undefined,
      budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
      budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
      deadline: formData.deadline || undefined,
      urgency: formData.urgency,
      governorate: formData.governorate || undefined,
      wilayat: formData.wilayat || undefined,
      remoteAccepted: formData.remoteAccepted,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container py-8 max-w-4xl">
        <Breadcrumb
          items={[
            { label: "Marketplace", href: "/marketplace" },
            { label: "Request Service" },
          ]}
          className="mb-6"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Request a Service</CardTitle>
            <CardDescription>
              Post your service needs and receive competitive bids from qualified Sanad offices
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Service Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Need Commercial Registration for New Restaurant"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  minLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 10 characters - Be specific and clear
                </p>
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label htmlFor="serviceType">
                  Service Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Detailed Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you need in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  minLength={50}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 50 characters - Include all relevant details
                </p>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Special Requirements (Optional)
                </Label>
                <Textarea
                  id="requirements"
                  placeholder="Any specific requirements, documents needed, or preferences..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Budget Range */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Minimum Budget (OMR)
                  </Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 100"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">Maximum Budget (OMR)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 500"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                  />
                </div>
              </div>

              {/* Deadline & Urgency */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Deadline (Optional)
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">
                    <Zap className="w-4 h-4 inline mr-2" />
                    Urgency
                  </Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value: any) => setFormData({ ...formData, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Flexible timeline</SelectItem>
                      <SelectItem value="medium">Medium - Within a month</SelectItem>
                      <SelectItem value="high">High - Within 2 weeks</SelectItem>
                      <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Preference */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="governorate">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Preferred Governorate
                  </Label>
                  <Select
                    value={formData.governorate}
                    onValueChange={(value) => setFormData({ ...formData, governorate: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any location" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOVERNORATES.map((gov) => (
                        <SelectItem key={gov} value={gov}>
                          {gov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wilayat">Wilayat (Optional)</Label>
                  <Input
                    id="wilayat"
                    placeholder="Specific wilayat"
                    value={formData.wilayat}
                    onChange={(e) => setFormData({ ...formData, wilayat: e.target.value })}
                  />
                </div>
              </div>

              {/* Remote Accepted */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remoteAccepted"
                  checked={formData.remoteAccepted}
                  onChange={(e) =>
                    setFormData({ ...formData, remoteAccepted: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="remoteAccepted" className="cursor-pointer">
                  I accept remote service delivery (no physical visit required)
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/marketplace")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRequest.isPending}
                  className="flex-1"
                >
                  {createRequest.isPending ? "Posting..." : "Post Service Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
