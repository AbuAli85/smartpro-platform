import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFormatNumber } from "@/hooks/useFormatNumber";
import { DollarSign, CreditCard, FileText, Download, CheckCircle, Clock, XCircle, Receipt } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PaymentInformationCardProps {
  bookingId: number;
  price?: string | number;
  status: string;
}

export function PaymentInformationCard({ bookingId, price, status }: PaymentInformationCardProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useFormatNumber();

  // Fetch payment details for this booking
  const { data: paymentInfo, isLoading } = trpc.booking.getPaymentInfo.useQuery({ bookingId });

  const getPaymentStatusIcon = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "refunded":
        return <Receipt className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "refunded":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDownloadInvoice = () => {
    if (paymentInfo?.invoiceUrl) {
      window.open(paymentInfo.invoiceUrl, "_blank");
      toast.success(t("payment.invoiceDownloadStarted"));
    } else {
      toast.error(t("payment.invoiceNotAvailable"));
    }
  };

  const handleDownloadReceipt = () => {
    if (paymentInfo?.receiptUrl) {
      window.open(paymentInfo.receiptUrl, "_blank");
      toast.success(t("payment.receiptDownloadStarted"));
    } else {
      toast.error(t("payment.receiptNotAvailable"));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("payment.title")}
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

  const totalAmount = paymentInfo?.totalAmount || parseFloat(price?.toString() || "0");
  const paidAmount = paymentInfo?.paidAmount || 0;
  const remainingAmount = totalAmount - paidAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t("payment.title")}
        </CardTitle>
        <CardDescription>{t("payment.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("payment.totalAmount")}</p>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="flex items-center gap-2">
              {getPaymentStatusIcon(paymentInfo?.paymentStatus || "pending")}
              <Badge variant="outline" className={cn("text-xs", getPaymentStatusColor(paymentInfo?.paymentStatus || "pending"))}>
                {t(`payment.status.${paymentInfo?.paymentStatus || "pending"}`)}
              </Badge>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("payment.serviceCharge")}</span>
              <span className="font-medium">{formatCurrency(paymentInfo?.serviceCharge || totalAmount)}</span>
            </div>
            {paymentInfo?.tax && paymentInfo.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payment.tax")}</span>
                <span className="font-medium">{formatCurrency(paymentInfo.tax)}</span>
              </div>
            )}
            {paymentInfo?.discount && paymentInfo.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t("payment.discount")}</span>
                <span className="font-medium">-{formatCurrency(paymentInfo.discount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>{t("payment.total")}</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Progress */}
          {paidAmount > 0 && paidAmount < totalAmount && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payment.paidAmount")}</span>
                <span className="font-medium text-green-600">{formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payment.remainingAmount")}</span>
                <span className="font-medium text-orange-600">{formatCurrency(remainingAmount)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(paidAmount / totalAmount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Method */}
        {paymentInfo?.paymentMethod && (
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t("payment.paymentMethod")}</p>
              <p className="text-xs text-muted-foreground">{paymentInfo.paymentMethod}</p>
            </div>
          </div>
        )}

        {/* Transaction Details */}
        {paymentInfo?.transactionId && (
          <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("payment.transactionId")}</span>
              <span className="font-mono text-xs">{paymentInfo.transactionId}</span>
            </div>
            {paymentInfo.paidAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payment.paidAt")}</span>
                <span>{format(new Date(paymentInfo.paidAt), "MMM d, yyyy HH:mm")}</span>
              </div>
            )}
          </div>
        )}

        {/* Download Documents */}
        {paymentInfo?.paymentStatus === "paid" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadInvoice}
              disabled={!paymentInfo.invoiceUrl}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              {t("payment.downloadInvoice")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReceipt}
              disabled={!paymentInfo.receiptUrl}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {t("payment.downloadReceipt")}
            </Button>
          </div>
        )}

        {/* Payment Note */}
        {paymentInfo?.note && (
          <div className="text-sm text-muted-foreground p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium text-blue-900 mb-1">{t("payment.note")}</p>
            <p className="text-blue-800">{paymentInfo.note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
