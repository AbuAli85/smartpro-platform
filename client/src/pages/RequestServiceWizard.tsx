import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { FileText, DollarSign, Calendar, MapPin, Zap, Upload, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { RequestWizard, WizardNavigation } from "@/components/RequestWizard";
import { DocumentUploadWithValidation } from "@/components/DocumentUploadWithValidation";

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

interface FormData {
  title: string;
  description: string;
  serviceType: string;
  requirements: string;
  budgetMin: string;
  budgetMax: string;
  deadline: string;
  urgency: "low" | "medium" | "high" | "urgent";
  governorate: string;
  wilayat: string;
  remoteAccepted: boolean;
  documents: Array<{
    url: string;
    fileKey: string;
    fileName: string;
  }>;
}

export default function RequestServiceWizard() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    serviceType: "",
    requirements: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    urgency: "medium",
    governorate: "",
    wilayat: "",
    remoteAccepted: true,
    documents: [],
  });

  const steps = [
    {
      id: 1,
      title: t("marketplace.wizard.step1Title") || "Basic Info",
      description: t("marketplace.wizard.step1Description") || "Service details",
    },
    {
      id: 2,
      title: t("marketplace.wizard.step2Title") || "Requirements",
      description: t("marketplace.wizard.step2Description") || "Budget & timeline",
    },
    {
      id: 3,
      title: t("marketplace.wizard.step3Title") || "Documents",
      description: t("marketplace.wizard.step3Description") || "Upload files",
    },
    {
      id: 4,
      title: t("marketplace.wizard.step4Title") || "Review",
      description: t("marketplace.wizard.step4Description") || "Confirm & submit",
    },
  ];

  const createRequest = trpc.serviceMarketplace.createRequest.useMutation({
    onSuccess: (data) => {
      toast.success(t("marketplace.requestService.successMessage"));
      setLocation(`/marketplace/requests/${data.id}/success`);
    },
    onError: (error) => {
      toast.error(error.message || t("marketplace.requestService.errorMessage"));
    },
  });

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.title.trim().length >= 10 &&
          formData.description.trim().length >= 50 &&
          formData.serviceType
        );
      case 2:
        return true; // Optional fields
      case 3:
        return true; // Optional documents
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      toast.error(t("marketplace.wizard.validationError") || "Please fill in all required fields");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId: number) => {
    // Allow navigation to completed steps
    if (stepId < currentStep || validateStep(currentStep)) {
      setCurrentStep(stepId);
    }
  };

  const handleSubmit = () => {
    if (!validateStep(1)) {
      toast.error(t("marketplace.wizard.validationError") || "Please complete all required fields");
      setCurrentStep(1);
      return;
    }

    createRequest.mutate({
      title: formData.title,
      description: formData.description,
      serviceType: formData.serviceType,
      requirements: formData.requirements || undefined,
      documents: formData.documents.map(d => d.url),
      budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
      budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
      deadline: formData.deadline || undefined,
      urgency: formData.urgency,
      governorate: formData.governorate || undefined,
      wilayat: formData.wilayat || undefined,
      remoteAccepted: formData.remoteAccepted,
    });
  };



  // Helper functions
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
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
                minLength={50}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                {t("marketplace.requestService.descriptionHint")}
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
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
                rows={4}
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
                  placeholder="100"
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
                  placeholder="500"
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

            {/* Location */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="governorate">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {t("marketplace.requestService.governorate")}
                </Label>
                <Select
                  value={formData.governorate}
                  onValueChange={(value) => setFormData({ ...formData, governorate: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("marketplace.requestService.selectGovernorate")} />
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remoteAccepted"
                checked={formData.remoteAccepted}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, remoteAccepted: checked as boolean })
                }
              />
              <Label htmlFor="remoteAccepted" className="font-normal cursor-pointer">
                {t("marketplace.requestService.remoteAccepted")}
              </Label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {t("marketplace.wizard.uploadDocuments") || "Upload Supporting Documents"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("marketplace.wizard.uploadDocumentsHint") || "Upload any relevant documents (ID, business license, etc.). AI will validate your documents automatically."}
              </p>
            </div>
            
            <DocumentUploadWithValidation
              serviceType={formData.serviceType}
              onDocumentsChange={(docs) => setFormData({ ...formData, documents: docs })}
              maxFiles={10}
              maxSizeMB={16}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t("marketplace.wizard.reviewTitle") || "Review Your Request"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("marketplace.wizard.reviewHint") || "Please review all information before submitting"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">{t("marketplace.wizard.step1Title") || "Basic Information"}</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-600">{t("marketplace.requestService.serviceTitle")}</dt>
                    <dd className="font-medium">{formData.title}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">{t("marketplace.requestService.serviceType")}</dt>
                    <dd className="font-medium">{getServiceTypeTranslation(formData.serviceType)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">{t("marketplace.requestService.detailedDescription")}</dt>
                    <dd className="font-medium">{formData.description}</dd>
                  </div>
                </dl>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">{t("marketplace.wizard.step2Title") || "Requirements & Budget"}</h4>
                <dl className="space-y-2 text-sm">
                  {formData.budgetMin && (
                    <div>
                      <dt className="text-gray-600">{t("marketplace.requestService.budgetRange")}</dt>
                      <dd className="font-medium">
                        {formData.budgetMin} - {formData.budgetMax || "Open"} OMR
                      </dd>
                    </div>
                  )}
                  {formData.deadline && (
                    <div>
                      <dt className="text-gray-600">{t("marketplace.requestService.deadline")}</dt>
                      <dd className="font-medium">{formData.deadline}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-600">{t("marketplace.requestService.urgency")}</dt>
                    <dd className="font-medium capitalize">{formData.urgency}</dd>
                  </div>
                  {formData.governorate && (
                    <div>
                      <dt className="text-gray-600">{t("marketplace.requestService.location")}</dt>
                      <dd className="font-medium">
                        {getGovernorateTranslation(formData.governorate)}
                        {formData.wilayat && `, ${formData.wilayat}`}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {formData.documents.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">{t("marketplace.wizard.step3Title") || "Documents"}</h4>
                  <p className="text-sm">
                    {formData.documents.length} {t("marketplace.wizard.filesUploaded") || "files uploaded"}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container py-8 max-w-5xl">
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
            <RequestWizard
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />

            <div className="mt-8">
              {renderStepContent()}
            </div>

            <WizardNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isNextDisabled={!validateStep(currentStep)}
              isSubmitting={createRequest.isPending}
              nextLabel={t("common.next") || "Next"}
              backLabel={t("common.back") || "Back"}
              submitLabel={t("marketplace.requestService.submitButton") || "Submit Request"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
