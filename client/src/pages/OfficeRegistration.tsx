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
import { Building2, MapPin, Phone, Mail, FileText, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Basic Information", icon: Building2 },
  { id: 2, title: "Location & Contact", icon: MapPin },
  { id: 3, title: "Services & Verification", icon: FileText },
];

export default function OfficeRegistration() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
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
    termsAccepted: false,
  });

  const registerOfficeMutation = trpc.officeOwner.registerOffice.useMutation({
    onSuccess: () => {
      toast.success("Office registered successfully!", {
        description: "Your application is under review. We'll notify you once approved.",
      });
      setLocation("/my-offices");
    },
    onError: (error: any) => {
      toast.error("Registration failed", {
        description: error.message,
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
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
      serviceIds: formData.selectedServices.map(id => parseInt(id)),
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.officeName && formData.description && formData.licenseNumber;
      case 2:
        return formData.address && formData.city && formData.region && formData.phone && formData.email;
      case 3:
        return formData.selectedServices.length > 0 && formData.termsAccepted;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Register Your Sanad Office</h1>
          <p className="text-muted-foreground text-lg">
            Join SmartPro platform and connect with thousands of SMEs
          </p>
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
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your Sanad office"}
              {currentStep === 2 && "Where can clients find you?"}
              {currentStep === 3 && "What services do you offer?"}
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
                    <Label htmlFor="city">City *</Label>
                    <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Riyadh">Riyadh</SelectItem>
                        <SelectItem value="Jeddah">Jeddah</SelectItem>
                        <SelectItem value="Dammam">Dammam</SelectItem>
                        <SelectItem value="Mecca">Mecca</SelectItem>
                        <SelectItem value="Medina">Medina</SelectItem>
                        <SelectItem value="Khobar">Khobar</SelectItem>
                        <SelectItem value="Tabuk">Tabuk</SelectItem>
                        <SelectItem value="Abha">Abha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Riyadh">Riyadh Region</SelectItem>
                        <SelectItem value="Makkah">Makkah Region</SelectItem>
                        <SelectItem value="Eastern">Eastern Region</SelectItem>
                        <SelectItem value="Madinah">Madinah Region</SelectItem>
                        <SelectItem value="Asir">Asir Region</SelectItem>
                        <SelectItem value="Tabuk">Tabuk Region</SelectItem>
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
                      placeholder="+966 XX XXX XXXX"
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
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || registerOfficeMutation.isPending}
                >
                  {registerOfficeMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
