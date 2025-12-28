import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Building2, MapPin, Phone, Mail, FileText, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DocumentUpload from "@/components/DocumentUpload";
import MultiDocumentUpload from "@/components/MultiDocumentUpload";
import { OMAN_GOVERNORATES, OMAN_CITIES, getCitiesByGovernorate, getBilingualLabel } from "../../../shared/omanLocations";
import { useAutoSave, loadDraft } from "@/hooks/useAutoSave";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { Save, Clock } from "lucide-react";

const STEPS = [
  { id: 1, title: "Basic Information", icon: Building2 },
  { id: 2, title: "Location & Contact", icon: MapPin },
  { id: 3, title: "Services & Verification", icon: FileText },
  { id: 4, title: "Review & Submit", icon: CheckCircle2 },
];

const DRAFT_KEY = "office-registration-draft";

export default function OfficeRegistration() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showDraftRestorePrompt, setShowDraftRestorePrompt] = useState(false);
  const { vibrate } = useHapticFeedback();
  
  // Initialize form data with draft if available
  const [formData, setFormData] = useState(() => {
    const draft = loadDraft<any>(DRAFT_KEY);
    if (draft) {
      setShowDraftRestorePrompt(true);
      return draft;
    }
    return {
    // Step 1: Basic Information
    officeName: "",
    officeNameAr: "",
    description: "",
    descriptionAr: "",
    licenseNumber: "",
    
    // Step 2: Location & Contact
    address: "",
    addressAr: "",
    city: "",
    region: "",
    phone: "",
    email: "",
    website: "",
    
    // Step 3: Services & Documents
    selectedServices: [] as string[],
    licenseDocumentUrl: "",
    certificateUrls: [] as string[],
    permitUrls: [] as string[],
    licenseExpiryDate: "",
    tradeLicenseExpiryDate: "",
    taxRegistrationExpiryDate: "",
    termsAccepted: false,
    };
  });

  const utils = trpc.useUtils();
  
  // Auto-save hook
  const { lastSaved, isSaving, clearDraft } = useAutoSave({
    key: DRAFT_KEY,
    data: formData,
    interval: 30000, // 30 seconds
    enabled: !registerOfficeMutation.isPending,
  });
  
  const registerOfficeMutation = trpc.officeOwner.registerOffice.useMutation({
    onSuccess: async () => {
      // Clear draft after successful submission
      clearDraft();
      
      vibrate('success'); // Haptic feedback on success
      toast.success("Office registered successfully!", {
        description: "Your application is under review. We'll notify you once approved.",
      });
      
      // Invalidate the getMyOffices query to refetch updated list
      await utils.officeOwner.getMyOffices.invalidate();
      
      setLocation("/my-offices");
    },
    onError: (error: any) => {
      vibrate('error'); // Haptic feedback on error
      toast.error("Registration failed", {
        description: error.message,
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleRestoreDraft = () => {
    setShowDraftRestorePrompt(false);
    toast.success("Draft restored", {
      description: "Your previous progress has been restored.",
    });
  };
  
  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftRestorePrompt(false);
    // Reset form to initial state
    setFormData({
      officeName: "",
      officeNameAr: "",
      description: "",
      descriptionAr: "",
      licenseNumber: "",
      address: "",
      addressAr: "",
      city: "",
      region: "",
      phone: "",
      email: "",
      website: "",
      selectedServices: [] as string[],
      licenseDocumentUrl: "",
      certificateUrls: [] as string[],
      permitUrls: [] as string[],
      licenseExpiryDate: "",
      tradeLicenseExpiryDate: "",
      taxRegistrationExpiryDate: "",
      termsAccepted: false,
    });
    toast.info("Draft discarded", {
      description: "Starting with a fresh form.",
    });
  };

  // Handle governorate change - clear city selection
  const handleGovernorateChange = (value: string) => {
    setFormData(prev => ({ ...prev, region: value, city: "" }));
  };

  // Get filtered cities based on selected governorate
  const availableCities = formData.region 
    ? getCitiesByGovernorate(formData.region)
    : OMAN_CITIES;

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id: string) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    registerOfficeMutation.mutate({
      officeName: formData.officeName,
      officeNameAr: formData.officeNameAr || undefined,
      description: formData.description,
      descriptionAr: formData.descriptionAr || undefined,
      licenseNumber: formData.licenseNumber,
      address: formData.address,
      addressAr: formData.addressAr || undefined,
      city: formData.city,
      region: formData.region,
      phone: formData.phone,
      email: formData.email,
      website: formData.website || undefined,
      serviceIds: formData.selectedServices.map((id: string) => parseInt(id)),
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.officeName && formData.description && formData.licenseNumber;
      case 2:
        return formData.address && formData.city && formData.region && formData.phone && formData.email;
      case 3:
        return formData.selectedServices.length > 0;
      case 4:
        return formData.termsAccepted;
      default:
        return false;
    }
  };
  
  const handleEditStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container max-w-4xl">
        {/* Draft Restore Prompt */}
        {showDraftRestorePrompt && (
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Draft Found
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    We found a saved draft from your previous session. Would you like to continue where you left off?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleRestoreDraft}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Restore Draft
                    </Button>
                    <Button
                      onClick={handleDiscardDraft}
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
                    >
                      Start Fresh
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Register Your Sanad Office</h1>
          <p className="text-muted-foreground text-lg">
            Join SmartPro platform and connect with thousands of SMEs
          </p>
          
          {/* Auto-save Indicator */}
          {lastSaved && (
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
              <Save className="h-4 w-4" />
              <span>
                {isSaving ? "Saving draft..." : `Draft saved at ${lastSaved.toLocaleTimeString()}`}
              </span>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors mb-2",
                      isCompleted && "bg-green-500 text-white",
                      isActive && "bg-primary text-primary-foreground",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <span className={cn(
                    "text-sm font-medium text-center",
                    isActive && "text-foreground",
                    !isActive && "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "h-1 flex-1 mx-4 rounded transition-colors",
                    isCompleted ? "bg-green-500" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <Card className="relative">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your Sanad office"}
              {currentStep === 2 && "Where can clients find you?"}
              {currentStep === 3 && "What services do you provide?"}
              {currentStep === 4 && "Review your information before submitting"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="officeName">Office Name (English) *</Label>
                    <Input
                      id="officeName"
                      placeholder="e.g., Al-Riyadh Business Services"
                      value={formData.officeName}
                      onChange={(e) => handleInputChange("officeName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officeNameAr">Office Name (Arabic)</Label>
                    <Input
                      id="officeNameAr"
                      placeholder="مثال: خدمات الأعمال الرياض"
                      value={formData.officeNameAr}
                      onChange={(e) => handleInputChange("officeNameAr", e.target.value)}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Business License Number *</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="Enter your official license number"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (English) *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your office, services, and what makes you unique..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                  <Textarea
                    id="descriptionAr"
                    placeholder="صف مكتبك وخدماتك وما يميزك..."
                    value={formData.descriptionAr}
                    onChange={(e) => handleInputChange("descriptionAr", e.target.value)}
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location & Contact */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address (English) *</Label>
                    <Input
                      id="address"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressAr">Address (Arabic)</Label>
                    <Input
                      id="addressAr"
                      placeholder="عنوان الشارع"
                      value={formData.addressAr}
                      onChange={(e) => handleInputChange("addressAr", e.target.value)}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Governorate *</Label>
                    <Select value={formData.region} onValueChange={handleGovernorateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select governorate" />
                      </SelectTrigger>
                      <SelectContent>
                        {OMAN_GOVERNORATES.map((gov) => (
                          <SelectItem key={gov.value} value={gov.value}>
                            {getBilingualLabel(gov.labelEn, gov.labelAr)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Select 
                      value={formData.city} 
                      onValueChange={(value) => handleInputChange("city", value)}
                      disabled={!formData.region}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.region ? "Select city" : "Select governorate first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {getBilingualLabel(city.labelEn, city.labelAr)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+968 XX XXX XXXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="office@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.youroffice.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Services & Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Select Services You Offer *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "1", name: "Commercial Registration" },
                      { id: "2", name: "Tax Registration" },
                      { id: "3", name: "VAT Registration" },
                      { id: "4", name: "GOSI Registration" },
                      { id: "5", name: "Municipality License" },
                      { id: "6", name: "Chamber of Commerce" },
                      { id: "7", name: "Trademark Registration" },
                      { id: "8", name: "Legal Consultation" },
                    ].map((service) => (
                      <div key={service.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.selectedServices.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {service.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="space-y-4 border-t pt-6">
                  <div>
                    <h4 className="font-semibold mb-4">Required Documents</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please upload the following documents for verification. All documents will be reviewed by our team.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <DocumentUpload
                      label="Business License *"
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSizeMB={10}
                      onUploadComplete={(url) => handleInputChange("licenseDocumentUrl", url)}
                      currentUrl={formData.licenseDocumentUrl}
                      onRemove={() => handleInputChange("licenseDocumentUrl", "")}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="licenseExpiryDate">License Expiry Date (Optional)</Label>
                      <Input
                        id="licenseExpiryDate"
                        type="date"
                        value={formData.licenseExpiryDate}
                        onChange={(e) => handleInputChange("licenseExpiryDate", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll remind you before your license expires
                      </p>
                    </div>
                  </div>

                  <MultiDocumentUpload
                    label="Certificates (Optional)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSizeMB={10}
                    maxFiles={5}
                    onUploadComplete={(urls) => handleInputChange("certificateUrls", urls)}
                    currentUrls={formData.certificateUrls}
                    onRemove={(index) => {
                      const newUrls = formData.certificateUrls.filter((_: string, i: number) => i !== index);
                      handleInputChange("certificateUrls", newUrls);
                    }}
                  />

                  <MultiDocumentUpload
                    label="Permits (Optional)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSizeMB={10}
                    maxFiles={5}
                    onUploadComplete={(urls) => handleInputChange("permitUrls", urls)}
                    currentUrls={formData.permitUrls}
                    onRemove={(index) => {
                      const newUrls = formData.permitUrls.filter((_: string, i: number) => i !== index);
                      handleInputChange("permitUrls", newUrls);
                    }}
                  />
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleInputChange("termsAccepted", checked)}
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        I accept the terms and conditions *
                      </label>
                      <p className="text-sm text-muted-foreground">
                        By registering, you agree to our platform policies, service standards, and commission structure.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}
            
            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Review Your Application</h3>
                  <p className="text-sm text-muted-foreground">
                    Please review all information before submitting. You can edit any section by clicking the edit button.
                  </p>
                </div>
                
                {/* Basic Information Summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle className="text-base">Basic Information</CardTitle>
                      <CardDescription>Office details and description</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStep(1)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Office Name</p>
                        <p className="text-sm">{formData.officeName}</p>
                      </div>
                      {formData.officeNameAr && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Office Name (Arabic)</p>
                          <p className="text-sm">{formData.officeNameAr}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">License Number</p>
                        <p className="text-sm">{formData.licenseNumber}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Description</p>
                      <p className="text-sm line-clamp-3">{formData.description}</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Location & Contact Summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle className="text-base">Location & Contact</CardTitle>
                      <CardDescription>Address and contact information</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStep(2)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">City</p>
                        <p className="text-sm">{formData.city}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Governorate</p>
                        <p className="text-sm">{formData.region}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-sm">{formData.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-sm">{formData.email}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="text-sm">{formData.address}</p>
                    </div>
                    {formData.website && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Website</p>
                        <p className="text-sm">{formData.website}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Services Summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle className="text-base">Services</CardTitle>
                      <CardDescription>{formData.selectedServices.length} service(s) selected</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStep(3)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedServices.map((serviceId: string) => {
                        const serviceName = [
                          { id: "1", name: "Commercial Registration" },
                          { id: "2", name: "Tax Registration" },
                          { id: "3", name: "VAT Registration" },
                          { id: "4", name: "GOSI Registration" },
                          { id: "5", name: "Municipality License" },
                          { id: "6", name: "Chamber of Commerce" },
                          { id: "7", name: "Trademark Registration" },
                          { id: "8", name: "Legal Consultation" },
                        ].find(s => s.id === serviceId)?.name;
                        return (
                          <span
                            key={serviceId}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {serviceName}
                          </span>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Terms & Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="terms-final"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleInputChange("termsAccepted", checked)}
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor="terms-final"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        I confirm that all information provided is accurate and I accept the terms and conditions *
                      </label>
                      <p className="text-sm text-muted-foreground">
                        By submitting this application, you agree to our platform policies, service standards, and commission structure.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">What happens next?</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Your application will be reviewed within 24-48 hours</li>
                    <li>• We'll verify your business license and credentials</li>
                    <li>• You'll receive an email notification once approved</li>
                    <li>• After approval, you can start receiving service requests</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || registerOfficeMutation.isPending}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid() || registerOfficeMutation.isPending}
                >
                  {currentStep === 3 ? "Review Application" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || registerOfficeMutation.isPending}
                  className="min-w-[180px]"
                >
                  {registerOfficeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              )}
            </div>
            
            {/* Submission Progress Overlay */}
            {registerOfficeMutation.isPending && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <div>
                    <p className="text-lg font-semibold">Submitting Your Application</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please wait while we process your registration...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
