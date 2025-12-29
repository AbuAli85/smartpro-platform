import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Building2, Plus, MapPin, Phone, Mail, Globe, CheckCircle2, Clock, XCircle, Settings, Eye } from "lucide-react";
import { toast } from "sonner";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MyOffices() {
  const { t } = useLanguage();
  const { data: offices, isLoading, refetch } = trpc.officeOwner.getMyOffices.useQuery();

  // Pull-to-refresh functionality
  const pullToRefreshState = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    },
    enabled: !isLoading,
  });
  const toggleStatusMutation = trpc.officeOwner.toggleOfficeStatus.useMutation({
    onSuccess: () => {
      toast.success("Office status updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to update status", {
        description: error.message,
      });
    },
  });

  const getStatusBadge = (office: any) => {
    // Check verification status first
    if (office.verificationStatus === "pending_verification" || office.verificationStatus === "unverified") {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending Verification
        </Badge>
      );
    }
    if (office.verificationStatus === "rejected") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    // If verified, check active status
    if (office.status === "active") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const handleToggleStatus = (officeId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    toggleStatusMutation.mutate({
      officeId,
      isAvailable: newStatus === "active",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">{t("pages.myOffices")}</h1>
          </div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isVerified = (office: any) => office.verificationStatus === "verified";

  return (
    <div className="container py-8">
      {/* Pull-to-refresh indicator */}
      <PullToRefreshIndicator {...pullToRefreshState} />
      
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-4xl font-bold mb-2">My Offices</h1>
            <p className="text-muted-foreground">Manage your registered Sanad offices</p>
          </div>
          <Link href="/office-registration">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Register New Office
            </Button>
        </Link>
      </div>

      {!offices || offices.length === 0 ? (
        <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("empty.noOfficesYet")}</h3>
              <p className="text-muted-foreground mb-6">
                {t("empty.noOfficesYetDesc")}
              </p>
              <Link href="/office-registration">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("actions.registerYourFirstOffice")}
                </Button>
              </Link>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
            {offices.map((office) => (
              <Card key={office.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">{office.officeName}</CardTitle>
                        {getStatusBadge(office)}
                      </div>
                      <CardDescription className="text-base">
                        {office.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {office.wilayat}, {office.governorate}
                        </p>
                        <p className="text-sm text-muted-foreground">{office.addressLine1}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Contact</p>
                        <p className="text-sm text-muted-foreground">{office.phone}</p>
                        <p className="text-sm text-muted-foreground">{office.email}</p>
                      </div>
                    </div>

                    {office.website && (
                      <div className="flex items-start gap-2">
                        <Globe className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Website</p>
                          <a
                            href={office.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {office.website}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Commercial Registration</p>
                        <p className="text-sm text-muted-foreground">{office.commercialRegistration}</p>
                      </div>
                    </div>
                  </div>

                  {!isVerified(office) && office.verificationStatus !== "rejected" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-900">Verification Pending</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Your office registration is under review by our admin team. 
                            You'll receive an email notification once it's approved.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {office.verificationStatus === "rejected" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900">Registration Rejected</p>
                          <p className="text-sm text-red-700 mt-1">
                            Your office registration was not approved. Please contact support for more information.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link href={`/office/${office.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Public Profile
                      </Button>
                    </Link>

                    {isVerified(office) && (
                      <>
                        <Link href={`/owner/dashboard?officeId=${office.id}`}>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage Office
                          </Button>
                        </Link>

                        <Button
                          variant={office.status === "active" ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleStatus(office.id, office.status)}
                          disabled={toggleStatusMutation.isPending}
                        >
                          {office.status === "active" ? "Set Inactive" : "Set Active"}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
