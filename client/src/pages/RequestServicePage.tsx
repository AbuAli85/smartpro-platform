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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      toast.success(t("marketplace.requestService.successMessage"));
      setLocation(`/marketplace/requests/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || t("marketplace.requestService.errorMessage"));
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

  // Helper function to get translated service type
  const getServiceTypeTranslation = (type: string) => {
    const typeMap: Record<string, string> = {
      "Commercial Registration": t("marketplace.serviceTypes.commercialRegistration"),
      "Tax Registration": t("marketplace.serviceTypes.taxRegistration"),
      "VAT Registration": t("marketplace.serviceTypes.vatRegistration"),
      "Business License": t("marketplace.serviceTypes.businessLicense"),
      "Trade License": t("marketplace.serviceTypes.tradeLicense"),
      "Legal Consultation": t("marketplace.serviceTypes.legalConsultation"),
      "Accounting Services": t("marketplace.serviceTypes.accountingServices"),
      "Document Translation": t("marketplace.serviceTypes.documentTranslation"),
      "Other": t("marketplace.serviceTypes.other"),
    };
    return typeMap[type] || type;
  };

  // Helper function to get translated governorate
  const getGovernorateTranslation = (gov: string) => {
    const govMap: Record<string, string> = {
      "Muscat": t("marketplace.governorates.muscat"),
      "Dhofar": t("marketplace.governorates.dhofar"),
      "Musandam": t("marketplace.governorates.musandam"),
      "Al Buraimi": t("marketplace.governorates.alBuraimi"),
      "Ad Dakhiliyah": t("marketplace.governorates.adDakhiliyah"),
      "Al Batinah North": t("marketplace.governorates.alBatinahNorth"),
      "Al Batinah South": t("marketplace.governorates.alBatinahSouth"),
      "Ash Sharqiyah North": t("marketplace.governorates.ashSharqiyahNorth"),
      "Ash Sharqiyah South": t("marketplace.governorates.ashSharqiyahSouth"),
      "Al Dhahirah": t("marketplace.governorates.alDhahirah"),
      "Al Wusta": t("marketplace.governorates.alWusta"),
    };
    return govMap[gov] || gov;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container py-8 max-w-4xl">
        <Breadcrumb
          items={[
            { label: t("marketplace.title"), href: "/marketplace" },
            { label: t("marketplace.requestService.title") },
          ]}
          className="mb-6"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{t("marketplace.requestService.title")}</CardTitle>
            <CardDescription>
              {t("marketplace.requestService.subtitle")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t("marketplace.requestService.serviceTitle")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder={t("marketplace.requestService.serviceTitlePlaceholder")}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  minLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  {t("marketplace.requestService.serviceTitleHint")}
                </p>
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label htmlFor="serviceType">
                  {t("marketplace.requestService.serviceType")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("marketplace.requestService.selectServiceType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getServiceTypeTranslation(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("marketplace.requestService.detailedDescription")} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder={t("marketplace.requestService.descriptionPlaceholder")}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  minLength={50}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  {t("marketplace.requestService.descriptionHint")}
                </p>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements">
                  <FileText className="w-4 h-4 inline mr-2" />
                  {t("marketplace.requestService.specialRequirements")}
                </Label>
                <Textarea
                  id="requirements"
                  placeholder={t("marketplace.requestService.requirementsPlaceholder")}
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
                    {t("marketplace.requestService.minimumBudget")}
                  </Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={t("marketplace.requestService.budgetPlaceholder", { amount: "100" })}
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">{t("marketplace.requestService.maximumBudget")}</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={t("marketplace.requestService.budgetPlaceholder", { amount: "500" })}
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
                    {t("marketplace.requestService.deadline")}
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
                    {t("marketplace.requestService.urgency")}
                  </Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value: any) => setFormData({ ...formData, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("marketplace.requestService.urgencyLow")}</SelectItem>
                      <SelectItem value="medium">{t("marketplace.requestService.urgencyMedium")}</SelectItem>
                      <SelectItem value="high">{t("marketplace.requestService.urgencyHigh")}</SelectItem>
                      <SelectItem value="urgent">{t("marketplace.requestService.urgencyUrgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Preference */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="governorate">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {t("marketplace.requestService.preferredGovernorate")}
                  </Label>
                  <Select
                    value={formData.governorate}
                    onValueChange={(value) => setFormData({ ...formData, governorate: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("marketplace.requestService.anyLocation")} />
                    </SelectTrigger>
                    <SelectContent>
                      {GOVERNORATES.map((gov) => (
                        <SelectItem key={gov} value={gov}>
                          {getGovernorateTranslation(gov)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wilayat">{t("marketplace.requestService.wilayat")}</Label>
                  <Input
                    id="wilayat"
                    placeholder={t("marketplace.requestService.wilayatPlaceholder")}
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
                  {t("marketplace.requestService.remoteAccepted")}
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/marketplace")}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={createRequest.isPending}
                  className="flex-1"
                >
                  {createRequest.isPending ? t("marketplace.requestService.posting") : t("marketplace.requestService.postRequest")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
