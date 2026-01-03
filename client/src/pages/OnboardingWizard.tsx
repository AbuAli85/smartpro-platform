import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  CheckCircle, Building2, DollarSign, Calendar, 
  Rocket, ArrowRight, ArrowLeft, Upload, Eye 
} from "lucide-react";
import { useLocation } from "wouter";
import DocumentUpload from "@/components/DocumentUpload";
import OfficePreview from "@/components/OfficePreview";

const STEPS = [
  { id: 1, title: "Office Profile", icon: Building2, description: "Complete your office information" },
  { id: 2, title: "Availability", icon: Calendar, description: "Set your working hours" },
  { id: 3, title: "Launch", icon: Rocket, description: "Activate your office" },
];

export default function OnboardingWizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Step 1: Office Profile
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tagline, setTagline] = useState("");
  const [fullDescription, setFullDescription] = useState("");



  // Step 3: Availability
  const [workingHours, setWorkingHours] = useState({
    monday: { enabled: true, start: "09:00", end: "17:00" },
    tuesday: { enabled: true, start: "09:00", end: "17:00" },
    wednesday: { enabled: true, start: "09:00", end: "17:00" },
    thursday: { enabled: true, start: "09:00", end: "17:00" },
    friday: { enabled: false, start: "09:00", end: "17:00" },
    saturday: { enabled: false, start: "09:00", end: "17:00" },
    sunday: { enabled: true, start: "09:00", end: "17:00" },
  });

  const { data: myOffices } = trpc.officeOwner.getMyOffices.useQuery();

  const updateProfileMutation = trpc.officeOwner.updateOfficeProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setCurrentStep(2);
    },
    onError: (error: any) => {
      toast.error("Failed to update profile", {
        description: error.message,
      });
    },
  });



  const updateAvailabilityMutation = trpc.officeOwner.updateOfficeAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability updated successfully");
      setCurrentStep(3);
    },
    onError: (error: any) => {
      toast.error("Failed to update availability", {
        description: error.message,
      });
    },
  });

  const activateOfficeMutation = trpc.officeOwner.activateOffice.useMutation({
    onSuccess: () => {
      toast.success("Office activated successfully!");
      setIsComplete(true);
    },
    onError: (error: any) => {
      toast.error("Failed to activate office", {
        description: error.message,
      });
    },
  });

  const office = myOffices?.[0]; // Get first office
  const progress = (currentStep / STEPS.length) * 100;

  const handleStep1Submit = () => {
    if (!office) return;
    
    updateProfileMutation.mutate({
      officeId: office.id,
      logoUrl: logoUrl || undefined,
      coverUrl: coverUrl || undefined,
      tagline,
      description: fullDescription,
    });
  };



  const handleStep2Submit = () => {
    if (!office) return;
    
    updateAvailabilityMutation.mutate({
      officeId: office.id,
      workingHours,
    });
  };

  const handleActivate = () => {
    if (!office) return;
    
    activateOfficeMutation.mutate({
      officeId: office.id,
    });
  };

  if (!office) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Office Found</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any registered offices yet.
            </p>
            <Button onClick={() => setLocation("/register-office")}>
              Register Office
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">🎉 Congratulations!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Your office is now live on SmartPro
            </p>
            <p className="text-muted-foreground mb-8">
              SMEs across Oman can now discover your services and book appointments with you.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setLocation(`/offices/${office.id}`)}>
                View Office Profile
              </Button>
              <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to SmartPro! 👋</h1>
        <p className="text-muted-foreground">
          Let's get your office set up and ready to receive bookings
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex-1">
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isActive ? 'bg-primary border-primary text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-muted border-muted-foreground/20 text-muted-foreground' : ''}
                  `}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                  )}
                </div>
                <div className="mt-2">
                  <div className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {STEPS[currentStep - 1] && (
              <>
                {(() => {
                  const Icon = STEPS[currentStep - 1].icon;
                  return <Icon className="h-6 w-6" />;
                })()}
                {STEPS[currentStep - 1].title}
              </>
            )}
          </CardTitle>
          <CardDescription>
            {STEPS[currentStep - 1]?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Office Profile */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <DocumentUpload
                label="Office Logo (Optional)"
                accept=".png,.jpg,.jpeg,.svg"
                maxSizeMB={2}
                onUploadComplete={(url) => setLogoUrl(url)}
                currentUrl={logoUrl}
                onRemove={() => setLogoUrl("")}
              />

              <DocumentUpload
                label="Cover Image (Optional)"
                accept=".png,.jpg,.jpeg"
                maxSizeMB={5}
                onUploadComplete={(url) => setCoverUrl(url)}
                currentUrl={coverUrl}
                onRemove={() => setCoverUrl("")}
              />

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline *</Label>
                <Input
                  id="tagline"
                  placeholder="e.g., Your trusted partner for business services"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A short, catchy phrase that describes your office
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell SMEs about your office, expertise, and what makes you unique..."
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  rows={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Provide detailed information about your services and experience
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <div className="flex gap-2">
                  <Button variant="outline" disabled>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    disabled={!office}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Profile
                  </Button>
                </div>
                <Button 
                  onClick={handleStep1Submit}
                  disabled={!tagline || !fullDescription || updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Availability */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-4 block">Working Hours</Label>
                <div className="space-y-3">
                  {Object.entries(workingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-32">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hours.enabled}
                            onChange={(e) => {
                              setWorkingHours(prev => ({
                                ...prev,
                                [day]: { ...prev[day as keyof typeof prev], enabled: e.target.checked }
                              }));
                            }}
                            className="rounded"
                          />
                          <span className="font-medium capitalize">{day}</span>
                        </label>
                      </div>
                      {hours.enabled && (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={hours.start}
                            onChange={(e) => {
                              setWorkingHours(prev => ({
                                ...prev,
                                [day]: { ...prev[day as keyof typeof prev], start: e.target.value }
                              }));
                            }}
                            className="w-32"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={hours.end}
                            onChange={(e) => {
                              setWorkingHours(prev => ({
                                ...prev,
                                [day]: { ...prev[day as keyof typeof prev], end: e.target.value }
                              }));
                            }}
                            className="w-32"
                          />
                        </div>
                      )}
                      {!hours.enabled && (
                        <span className="text-muted-foreground text-sm">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={handleStep2Submit}
                  disabled={updateAvailabilityMutation.isPending}
                >
                  {updateAvailabilityMutation.isPending ? "Saving..." : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Launch */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Rocket className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Ready to Launch!</h3>
                <p className="text-muted-foreground mb-8">
                  Your office is all set up. Click the button below to make it live on SmartPro.
                </p>

                <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
                  <h4 className="font-semibold mb-4">What happens next:</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Your office will appear in public listings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>SMEs can discover and book your services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>You'll receive booking notifications via email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Access your dashboard to manage bookings</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={handleStep2Submit}
                  disabled={updateAvailabilityMutation.isPending}
                >
                  {updateAvailabilityMutation.isPending ? "Saving..." : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Launch */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Rocket className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Ready to Launch!</h3>
                <p className="text-muted-foreground mb-8">
                  Your office is all set up. Click the button below to make it live on SmartPro.
                </p>

                <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
                  <h4 className="font-semibold mb-4">What happens next:</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Your office will appear in public listings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>SMEs can discover and book your services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>You'll receive booking notifications via email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Access your dashboard to manage bookings</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={handleActivate}
                  disabled={activateOfficeMutation.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  {activateOfficeMutation.isPending ? "Activating..." : "🚀 Launch My Office"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skip Option */}
      <div className="text-center mt-6">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
          Skip for now, I'll complete this later
        </Button>
      </div>

      {/* Office Preview Dialog */}
      {office && (
        <OfficePreview
          open={showPreview}
          onOpenChange={setShowPreview}
          office={{
            name: office.officeName,
            logoUrl: logoUrl || office.logoUrl || undefined,
            coverImageUrl: coverUrl || office.coverImageUrl || undefined,
            description: fullDescription || office.description || undefined,
            governorate: office.governorate,
            wilayat: office.wilayat,
            phone: office.phone,
            email: office.email,
            website: office.website || undefined,
            averageRating: parseFloat(office.averageRating),
            totalReviews: office.totalReviews,
            workingHours: workingHours,
          }}
        />
      )}
    </div>
  );
}
