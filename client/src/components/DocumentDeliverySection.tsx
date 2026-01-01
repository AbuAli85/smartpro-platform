import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Download, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DocumentDeliverySectionProps {
  bookingId: number;
}

export function DocumentDeliverySection({ bookingId }: DocumentDeliverySectionProps) {
  const { t } = useLanguage();

  // Fetch documents for this booking
  const { data: documents, isLoading } = trpc.booking.getBookingDocuments.useQuery({ bookingId });

  const handleDownload = (documentUrl: string, documentName: string) => {
    // Open in new tab for download
    window.open(documentUrl, "_blank");
    toast.success(t("documents.downloadStarted"));
  };

  const handleView = (documentUrl: string) => {
    window.open(documentUrl, "_blank");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("documents.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t("documents.title")}
        </CardTitle>
        <CardDescription>{t("documents.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {!documents || documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{t("documents.noDocuments")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("documents.willBeAvailable")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">{getStatusIcon(doc.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                      <Badge variant="outline" className={cn("text-xs", getStatusColor(doc.status))}>
                        {t(`documents.status.${doc.status}`)}
                      </Badge>
                    </div>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mb-2">{doc.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {doc.uploadedAt && (
                        <span>
                          {t("documents.uploaded")} {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                        </span>
                      )}
                      {doc.fileSize && <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>}
                    </div>
                  </div>
                </div>

                {doc.status === "delivered" && doc.fileUrl && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(doc.fileUrl)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      {t("documents.view")}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDownload(doc.fileUrl, doc.name)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      {t("documents.download")}
                    </Button>
                  </div>
                )}

                {doc.status === "pending" && (
                  <Badge variant="outline" className="ml-4">
                    {t("documents.processing")}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">{t("documents.infoTitle")}</p>
              <p className="text-blue-800">{t("documents.infoMessage")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
