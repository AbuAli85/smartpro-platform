import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Building2, CheckCircle, XCircle, Eye, MapPin, Phone, 
  Mail, Calendar, FileText, AlertCircle 
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";

function OfficeVerificationPage() {
  const [selectedOffice, setSelectedOffice] = useState<any>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [previewDocuments, setPreviewDocuments] = useState<any[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: pendingOffices, isLoading, refetch } = trpc.admin.getPendingOfficeRegistrations.useQuery();

  const approveMutation = trpc.admin.approveOfficeRegistration.useMutation({
    onSuccess: () => {
      toast.success("Office approved successfully");
      setIsApproveDialogOpen(false);
      setSelectedOffice(null);
      setVerificationNotes("");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to approve office", {
        description: error.message,
      });
    },
  });

  const rejectMutation = trpc.admin.rejectOfficeRegistration.useMutation({
    onSuccess: () => {
      toast.success("Office registration rejected");
      setIsRejectDialogOpen(false);
      setSelectedOffice(null);
      setRejectionReason("");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to reject office", {
        description: error.message,
      });
    },
  });

  const handleApprove = (office: any) => {
    setSelectedOffice(office);
    setIsApproveDialogOpen(true);
  };

  const handleReject = (office: any) => {
    setSelectedOffice(office);
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (!selectedOffice) return;
    
    approveMutation.mutate({
      officeId: selectedOffice.id,
      notes: verificationNotes || undefined,
    });
  };

  const confirmReject = () => {
    if (!selectedOffice || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    rejectMutation.mutate({
      officeId: selectedOffice.id,
      reason: rejectionReason,
    });
  };

  const handlePreviewDocuments = (office: any) => {
    const docs = [];
    
    // Add license document
    if (office.license_document_url) {
      docs.push({
        url: office.license_document_url,
        label: "Business License",
        type: office.license_document_url.match(/\.pdf$/i) ? "pdf" : "image",
      });
    }
    
    // Add certificates (handle both string and array)
    if (office.certificate_urls) {
      const certUrls = Array.isArray(office.certificate_urls) 
        ? office.certificate_urls 
        : [office.certificate_urls];
      
      certUrls.forEach((url: string, index: number) => {
        docs.push({
          url,
          label: `Certificate ${index + 1}`,
          type: url.match(/\.pdf$/i) ? "pdf" : "image",
        });
      });
    }
    
    // Add permits (handle both string and array)
    if (office.permit_urls) {
      const permitUrls = Array.isArray(office.permit_urls) 
        ? office.permit_urls 
        : [office.permit_urls];
      
      permitUrls.forEach((url: string, index: number) => {
        docs.push({
          url,
          label: `Permit ${index + 1}`,
          type: url.match(/\.pdf$/i) ? "pdf" : "image",
        });
      });
    }
    
    setPreviewDocuments(docs);
    setPreviewIndex(0);
    setIsPreviewOpen(true);
  };

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Office Verification</h1>
        <p className="text-muted-foreground">
          Review and verify pending office registrations
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading pending registrations...
          </CardContent>
        </Card>
      ) : !pendingOffices || pendingOffices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              No pending office registrations to review
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingOffices.map((office: any) => (
            <Card key={office.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                      {office.logoUrl ? (
                        <img src={office.logoUrl} alt={office.officeName} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <Building2 className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{office.officeName}</CardTitle>
                      {office.officeNameAr && (
                        <p className="text-lg text-muted-foreground" dir="rtl">{office.officeNameAr}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {office.verificationStatus}
                        </Badge>
                        <Badge variant="outline">
                          ID: {office.id}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      onClick={() => handleApprove(office)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleReject(office)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Business Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">License Number:</span>
                          <span className="ml-2 font-medium">{office.commercialRegistration}</span>
                        </div>
                        {office.tradeLicense && (
                          <div>
                            <span className="text-muted-foreground">Trade License:</span>
                            <span className="ml-2 font-medium">{office.tradeLicense}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Owner ID:</span>
                          <span className="ml-2 font-medium">{office.ownerId}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>{office.addressLine1}</p>
                        {office.addressLine2 && <p>{office.addressLine2}</p>}
                        <p>{office.wilayat}, {office.governorate}</p>
                        {office.postalCode && <p>Postal Code: {office.postalCode}</p>}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${office.email}`} className="text-primary hover:underline">
                            {office.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${office.phone}`} className="text-primary hover:underline">
                            {office.phone}
                          </a>
                        </div>
                        {office.website && (
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <a href={office.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {office.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {office.description || "No description provided"}
                      </p>
                      {office.descriptionAr && (
                        <p className="text-sm text-muted-foreground mt-2" dir="rtl">
                          {office.descriptionAr}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Registration Date
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(office.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {office.yearEstablished && (
                      <div>
                        <h4 className="font-semibold mb-2">Year Established</h4>
                        <p className="text-sm text-muted-foreground">{office.yearEstablished}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Employee Count</h4>
                      <p className="text-sm text-muted-foreground">
                        {office.employeeCount || 1} employees
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Preview Section */}
                {(office.license_document_url || office.certificate_urls || office.permit_urls) && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Uploaded Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {office.license_document_url && (
                        <div className="border rounded-lg p-4">
                          <p className="text-sm font-medium mb-2">Business License</p>
                          {office.license_document_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img 
                              src={office.license_document_url} 
                              alt="Business License" 
                              className="w-full h-48 object-contain bg-muted rounded"
                            />
                          ) : (
                            <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full mt-2"
                            onClick={() => handlePreviewDocuments(office)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview All Documents
                          </Button>
                        </div>
                      )}
                      {office.certificate_urls && (
                        <div className="border rounded-lg p-4">
                          <p className="text-sm font-medium mb-2">Certificates</p>
                          {office.certificate_urls.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img 
                              src={office.certificate_urls} 
                              alt="Certificates" 
                              className="w-full h-48 object-contain bg-muted rounded"
                            />
                          ) : (
                            <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full mt-2"
                            onClick={() => handlePreviewDocuments(office)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview All Documents
                          </Button>
                        </div>
                      )}
                      {office.permit_urls && (
                        <div className="border rounded-lg p-4">
                          <p className="text-sm font-medium mb-2">Permits</p>
                          {office.permit_urls.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img 
                              src={office.permit_urls} 
                              alt="Permits" 
                              className="w-full h-48 object-contain bg-muted rounded"
                            />
                          ) : (
                            <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full mt-2"
                            onClick={() => handlePreviewDocuments(office)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview All Documents
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Office Registration</DialogTitle>
            <DialogDescription>
              Confirm approval for {selectedOffice?.officeName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    This will activate the office
                  </h4>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Office status will be set to "active"</li>
                    <li>• Office will appear in public listings</li>
                    <li>• Owner will receive approval notification email</li>
                    <li>• Owner will be guided through onboarding wizard</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Verification Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any internal notes about this verification..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? "Approving..." : "Approve Office"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Office Registration</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedOffice?.officeName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                    This will reject the registration
                  </h4>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    <li>• Office will not be activated</li>
                    <li>• Owner will receive rejection notification with reason</li>
                    <li>• Office can re-apply after addressing issues</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this registration is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                This reason will be sent to the office owner via email
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmReject}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
              variant="destructive"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        documents={previewDocuments}
        initialIndex={previewIndex}
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}

export default function OfficeVerification() {
  return (
    <ProtectedRoute requirePermission="canVerifyOffices">
      <OfficeVerificationPage />
    </ProtectedRoute>
  );
}
