import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Building2, CheckCircle2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";

// Validation schema
const officeSchema = z.object({
  // Basic Information
  officeName: z.string().min(3, "Office name must be at least 3 characters"),
  officeNameAr: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  whatsapp: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  
  // Registration Details
  commercialRegistration: z.string().min(5, "CR number is required"),
  tradeLicense: z.string().optional(),
  taxRegistration: z.string().optional(),
  
  // Location
  governorate: z.string().min(1, "Governorate is required"),
  wilayat: z.string().min(1, "Wilayat is required"),
  addressLine1: z.string().min(10, "Address must be at least 10 characters"),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  
  // Business Details
  description: z.string().min(50, "Description must be at least 50 characters"),
  descriptionAr: z.string().optional(),
  yearEstablished: z.number().min(1900).max(new Date().getFullYear()),
  employeeCount: z.number().min(1),
  
  // Settings
  acceptsOnlineBookings: z.boolean(),
});

type OfficeFormData = z.infer<typeof officeSchema>;

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
  "Ad Dhahirah",
  "Al Wusta",
];

export default function CreateOffice() {
  const [_, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [crFile, setCrFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [taxFile, setTaxFile] = useState<File | null>(null);

  const form = useForm<OfficeFormData>({
    resolver: zodResolver(officeSchema),
    defaultValues: {
      acceptsOnlineBookings: true,
      employeeCount: 1,
      yearEstablished: new Date().getFullYear(),
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  const createOffice = trpc.sanadOffice.create.useMutation({
    onSuccess: (data) => {
      toast.success("Office registered successfully! Pending verification.");
      navigate(`/offices/${data.slug}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to register office");
    },
  });

  const uploadDocument = async (file: File, type: string): Promise<string> => {
    // Convert file to base64 for upload
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // In production, upload to S3 via tRPC
        // For now, return a placeholder URL
        resolve(`/uploads/${type}/${file.name}`);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: OfficeFormData) => {
    try {
      // Upload documents if provided
      const documents: Record<string, string> = {};
      
      if (crFile) {
        toast.loading("Uploading CR document...");
        documents.crDocument = await uploadDocument(crFile, "cr");
      }
      
      if (licenseFile) {
        toast.loading("Uploading trade license...");
        documents.licenseDocument = await uploadDocument(licenseFile, "license");
      }
      
      if (taxFile) {
        toast.loading("Uploading tax registration...");
        documents.taxDocument = await uploadDocument(taxFile, "tax");
      }

      toast.loading("Creating office...");
      
      await createOffice.mutateAsync({
        ...data,
        website: data.website || undefined,
      });
    } catch (error) {
      console.error("Error creating office:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navigation />
      
      <div className="container max-w-4xl py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Register Your Sanad Office</h1>
          <p className="text-muted-foreground text-lg">
            Join SmartPro and reach thousands of SMEs across Oman
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      step > s ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Tell us about your Sanad office
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="officeName">Office Name (English) *</Label>
                    <Input
                      id="officeName"
                      {...register("officeName")}
                      placeholder="Al Waha Business Services"
                    />
                    {errors.officeName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.officeName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="officeNameAr">Office Name (Arabic)</Label>
                    <Input
                      id="officeNameAr"
                      {...register("officeNameAr")}
                      placeholder="الواحة لخدمات الأعمال"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="info@alwaha.om"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="+968 24123456"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      {...register("whatsapp")}
                      placeholder="+968 91234567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      {...register("website")}
                      placeholder="https://alwaha.om"
                    />
                    {errors.website && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.website.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description (English) *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe your office and services..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                  <Textarea
                    id="descriptionAr"
                    {...register("descriptionAr")}
                    placeholder="وصف مكتبك وخدماتك..."
                    rows={4}
                    dir="rtl"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setStep(2)}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Registration & Location */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Registration & Location</CardTitle>
                <CardDescription>
                  Provide your registration details and location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="commercialRegistration">
                      Commercial Registration *
                    </Label>
                    <Input
                      id="commercialRegistration"
                      {...register("commercialRegistration")}
                      placeholder="CR123456"
                    />
                    {errors.commercialRegistration && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.commercialRegistration.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tradeLicense">Trade License</Label>
                    <Input
                      id="tradeLicense"
                      {...register("tradeLicense")}
                      placeholder="TL789012"
                    />
                  </div>

                  <div>
                    <Label htmlFor="taxRegistration">Tax Registration</Label>
                    <Input
                      id="taxRegistration"
                      {...register("taxRegistration")}
                      placeholder="TAX345678"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="governorate">Governorate *</Label>
                    <Select
                      onValueChange={(value) => setValue("governorate", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select governorate" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOVERNORATES.map((gov) => (
                          <SelectItem key={gov} value={gov}>
                            {gov}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.governorate && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.governorate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="wilayat">Wilayat *</Label>
                    <Input
                      id="wilayat"
                      {...register("wilayat")}
                      placeholder="e.g., Seeb, Salalah"
                    />
                    {errors.wilayat && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.wilayat.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    {...register("addressLine1")}
                    placeholder="Building number, street name"
                  />
                  {errors.addressLine1 && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      {...register("addressLine2")}
                      placeholder="Additional address details"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      {...register("postalCode")}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="yearEstablished">Year Established *</Label>
                    <Input
                      id="yearEstablished"
                      type="number"
                      {...register("yearEstablished", { valueAsNumber: true })}
                      placeholder="2020"
                    />
                    {errors.yearEstablished && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.yearEstablished.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="employeeCount">Number of Employees *</Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      {...register("employeeCount", { valueAsNumber: true })}
                      placeholder="5"
                    />
                    {errors.employeeCount && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.employeeCount.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptsOnlineBookings"
                    checked={watch("acceptsOnlineBookings")}
                    onCheckedChange={(checked) =>
                      setValue("acceptsOnlineBookings", checked as boolean)
                    }
                  />
                  <Label htmlFor="acceptsOnlineBookings" className="cursor-pointer">
                    Accept online bookings
                  </Label>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setStep(3)}>
                    Next Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Document Upload */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Upload your registration documents for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CR Document */}
                <div>
                  <Label>Commercial Registration Document *</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setCrFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {crFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {crFile.name}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF, JPG, or PNG (max 5MB)
                  </p>
                </div>

                {/* Trade License */}
                <div>
                  <Label>Trade License (Optional)</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {licenseFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {licenseFile.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tax Registration */}
                <div>
                  <Label>Tax Registration (Optional)</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setTaxFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {taxFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {taxFile.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Verification Process</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your office will be reviewed by our team</li>
                    <li>• Verification typically takes 1-2 business days</li>
                    <li>• You'll receive an email notification once verified</li>
                    <li>• Your office will appear in search results after approval</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={createOffice.isPending || !crFile}
                  >
                    {createOffice.isPending ? "Submitting..." : "Submit Registration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
