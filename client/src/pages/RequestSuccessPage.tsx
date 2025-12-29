import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Share2, Clock, MapPin, DollarSign, Calendar, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import QRCode from "qrcode";
import { toast } from "sonner";

export default function RequestSuccessPage() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: request, isLoading } = trpc.serviceMarketplace.getRequestById.useQuery(
    { id: parseInt(id!) },
    { enabled: !!id }
  );

  useEffect(() => {
    if (request?.trackingNumber) {
      generateQRCode(request.trackingNumber);
    }
  }, [request?.trackingNumber]);

  const generateQRCode = async (trackingNumber: string) => {
    try {
      // Generate tracking URL
      const trackingUrl = `${window.location.origin}/marketplace/track/${trackingNumber}`;
      
      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(trackingUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#1e40af",
          light: "#ffffff",
        },
      });
      
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl || !request) return;

    const link = document.createElement("a");
    link.download = `tracking-${request.trackingNumber}.png`;
    link.href = qrCodeDataUrl;
    link.click();
    
    toast.success(t("marketplace.success.qrDownloaded") || "QR code downloaded");
  };

  const shareTracking = async () => {
    if (!request) return;

    const trackingUrl = `${window.location.origin}/marketplace/track/${request.trackingNumber}`;
    const shareText = `Track my service request: ${request.title}\nTracking Number: ${request.trackingNumber}\n${trackingUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t("marketplace.success.shareTitle") || "Service Request Tracking",
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error occurred
        copyToClipboard(trackingUrl);
      }
    } else {
      copyToClipboard(trackingUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("marketplace.success.linkCopied") || "Tracking link copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{t("marketplace.requestNotFound")}</p>
            <Button onClick={() => setLocation("/marketplace")} className="mt-4">
              {t("marketplace.backToMarketplace")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t("marketplace.success.title") || "Request Submitted Successfully!"}
          </h1>
          <p className="text-lg text-gray-600">
            {t("marketplace.success.subtitle") || "Your service request has been received and is being processed"}
          </p>
        </div>

        {/* Tracking Information Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl">
              {t("marketplace.success.trackingTitle") || "Tracking Information"}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {t("marketplace.success.trackingSubtitle") || "Save this information to track your request"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="text-center">
                {qrCodeDataUrl && (
                  <div className="bg-white p-4 rounded-lg inline-block shadow-md">
                    <img src={qrCodeDataUrl} alt="Tracking QR Code" className="w-64 h-64" />
                  </div>
                )}
                <div className="mt-4 space-x-2">
                  <Button onClick={downloadQRCode} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {t("marketplace.success.downloadQR") || "Download QR"}
                  </Button>
                  <Button onClick={shareTracking} variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    {t("common.share") || "Share"}
                  </Button>
                </div>
              </div>

              {/* Tracking Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("marketplace.success.trackingNumber") || "Tracking Number"}
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border-2 border-blue-200">
                    <p className="text-2xl font-bold text-blue-600 font-mono">
                      {request.trackingNumber}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("marketplace.requestService.serviceTitle") || "Service Title"}
                  </label>
                  <p className="mt-1 text-lg font-medium">{request.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("marketplace.requestService.serviceType") || "Service Type"}
                  </label>
                  <p className="mt-1">{request.serviceType}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("marketplace.success.submittedOn") || "Submitted On"}
                  </label>
                  <p className="mt-1">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("marketplace.success.requestSummary") || "Request Summary"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {request.budgetMin && (
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {t("marketplace.requestService.budgetRange") || "Budget Range"}
                    </p>
                    <p className="font-medium">
                      {request.budgetMin} - {request.budgetMax || "Open"} OMR
                    </p>
                  </div>
                </div>
              )}

              {request.deadline && (
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {t("marketplace.requestService.deadline") || "Deadline"}
                    </p>
                    <p className="font-medium">{new Date(request.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    {t("marketplace.requestService.urgency") || "Urgency"}
                  </p>
                  <p className="font-medium capitalize">{request.urgency}</p>
                </div>
              </div>

              {request.governorate && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {t("marketplace.requestService.location") || "Location"}
                    </p>
                    <p className="font-medium">
                      {request.governorate}
                      {request.wilayat && `, ${request.wilayat}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("marketplace.success.nextSteps") || "What Happens Next?"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">
                    {t("marketplace.success.step1Title") || "AI Analysis"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t("marketplace.success.step1Description") || "Our AI will analyze your request and match it with qualified offices"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">
                    {t("marketplace.success.step2Title") || "Office Notifications"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t("marketplace.success.step2Description") || "Matched offices will be notified and can submit bids"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">
                    {t("marketplace.success.step3Title") || "Review Bids"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t("marketplace.success.step3Description") || "You'll receive notifications when offices submit bids. Review and choose the best one"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold">
                    {t("marketplace.success.step4Title") || "Service Delivery"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t("marketplace.success.step4Description") || "Work with your chosen office to complete your service"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => setLocation(`/marketplace/requests/${request.id}`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {t("marketplace.success.viewRequest") || "View Request Details"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setLocation("/my-service-requests")}
          >
            {t("marketplace.success.viewAllRequests") || "View All My Requests"}
          </Button>
        </div>

        {/* Email Confirmation Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {t("marketplace.success.emailSent") || "A confirmation email with tracking details has been sent to your registered email address"}
          </p>
        </div>
      </div>
    </div>
  );
}
