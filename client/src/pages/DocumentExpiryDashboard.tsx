import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AlertTriangle, Calendar, CheckCircle2, Clock, FileText, Upload } from "lucide-react";
import { useState } from "react";

export default function DocumentExpiryDashboard() {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    type: "license" | "tradeLicense" | "taxRegistration";
    currentDate: string | null;
  } | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState("");

  // Get user's office
  const { data: userOffices, refetch } = trpc.sanadOffice.getMyOffices.useQuery();
  const office = userOffices?.[0];

  const updateExpiryMutation = trpc.sanadOffice.updateExpiryDates.useMutation({
    onSuccess: () => {
      toast.success("Expiry date updated successfully");
      setIsUpdateDialogOpen(false);
      setSelectedDocument(null);
      setNewExpiryDate("");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to update expiry date", {
        description: error.message,
      });
    },
  });

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { status: "unknown", label: "Not Set", color: "secondary", days: null };

    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "expired", label: "Expired", color: "destructive", days: Math.abs(diffDays) };
    } else if (diffDays <= 7) {
      return { status: "critical", label: "Expires Soon", color: "destructive", days: diffDays };
    } else if (diffDays <= 30) {
      return { status: "warning", label: "Expiring Soon", color: "warning", days: diffDays };
    } else {
      return { status: "valid", label: "Valid", color: "success", days: diffDays };
    }
  };

  const handleUpdateExpiry = () => {
    if (!office || !selectedDocument || !newExpiryDate) return;

    const updates: any = {};
    if (selectedDocument.type === "license") {
      updates.licenseExpiryDate = newExpiryDate;
    } else if (selectedDocument.type === "tradeLicense") {
      updates.tradeLicenseExpiryDate = newExpiryDate;
    } else if (selectedDocument.type === "taxRegistration") {
      updates.taxRegistrationExpiryDate = newExpiryDate;
    }

    updateExpiryMutation.mutate({
      officeId: office.id,
      ...updates,
    });
  };

  if (!office) {
    return (
      <div className="container py-8 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No Office Found</h3>
            <p className="text-muted-foreground">
              Please register your office first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const documents = [
    {
      type: "license" as const,
      name: "Business License",
      expiryDate: office.licenseExpiryDate ? new Date(office.licenseExpiryDate).toISOString().split('T')[0] : null,
      icon: FileText,
    },
    {
      type: "tradeLicense" as const,
      name: "Trade License",
      expiryDate: office.tradeLicenseExpiryDate ? new Date(office.tradeLicenseExpiryDate).toISOString().split('T')[0] : null,
      icon: FileText,
    },
    {
      type: "taxRegistration" as const,
      name: "Tax Registration",
      expiryDate: office.taxRegistrationExpiryDate ? new Date(office.taxRegistrationExpiryDate).toISOString().split('T')[0] : null,
      icon: FileText,
    },
  ];

  const criticalDocs = documents.filter((doc) => {
    const status = getExpiryStatus(doc.expiryDate);
    return status.status === "expired" || status.status === "critical";
  });

  const warningDocs = documents.filter((doc) => {
    const status = getExpiryStatus(doc.expiryDate);
    return status.status === "warning";
  });

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Expiry Tracking</h1>
        <p className="text-muted-foreground">
          Monitor and manage your business document expiration dates
        </p>
      </div>

      {/* Alert Summary */}
      {(criticalDocs.length > 0 || warningDocs.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {criticalDocs.length > 0 && (
            <Card className="border-destructive">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-lg">Urgent Action Required</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {criticalDocs.length} document{criticalDocs.length > 1 ? "s" : ""} expired or expiring within 7 days
                </p>
              </CardContent>
            </Card>
          )}

          {warningDocs.length > 0 && (
            <Card className="border-yellow-500">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-lg">Upcoming Renewals</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {warningDocs.length} document{warningDocs.length > 1 ? "s" : ""} expiring within 30 days
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Document Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {documents.map((doc) => {
          const status = getExpiryStatus(doc.expiryDate);
          const Icon = doc.icon;

          return (
            <Card key={doc.type} className={status.status === "expired" || status.status === "critical" ? "border-destructive" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{doc.name}</CardTitle>
                    </div>
                  </div>
                  <Badge
                    variant={
                      status.status === "expired" || status.status === "critical"
                        ? "destructive"
                        : status.status === "warning"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {doc.expiryDate ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Expires on:</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {new Date(doc.expiryDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {status.days !== null && (
                      <div className="pt-2 border-t">
                        {status.status === "expired" ? (
                          <p className="text-sm text-destructive font-medium">
                            Expired {status.days} day{status.days !== 1 ? "s" : ""} ago
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {status.days} day{status.days !== 1 ? "s" : ""} remaining
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      No expiry date set for this document
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedDocument({
                      type: doc.type,
                      currentDate: doc.expiryDate,
                    });
                    setNewExpiryDate(doc.expiryDate || "");
                    setIsUpdateDialogOpen(true);
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Update Expiry Date
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Renewal Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Renewal Tips
          </CardTitle>
          <CardDescription>
            Stay compliant and avoid service interruptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Start renewal process at least 30 days before expiration</li>
            <li>• Keep digital copies of all renewed documents</li>
            <li>• Update expiry dates immediately after renewal</li>
            <li>• Set calendar reminders for upcoming renewals</li>
            <li>• Expired documents may result in service suspension</li>
          </ul>
        </CardContent>
      </Card>

      {/* Update Expiry Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Expiry Date</DialogTitle>
            <DialogDescription>
              Set or update the expiration date for this document
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newExpiryDate">New Expiry Date</Label>
              <Input
                id="newExpiryDate"
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-muted-foreground">
                We'll send you reminders 30 days and 7 days before expiration
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdateDialogOpen(false);
                setSelectedDocument(null);
                setNewExpiryDate("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateExpiry}
              disabled={!newExpiryDate || updateExpiryMutation.isPending}
            >
              {updateExpiryMutation.isPending ? "Updating..." : "Update Date"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
