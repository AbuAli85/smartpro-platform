import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  XCircle,
  Star,
  CalendarDays,
  List,
  Phone,
  Mail,
  Building2,
  FileText,
  DollarSign,
  User,
  MessageSquare,
} from "lucide-react";
import { BookingCalendar } from "@/components/BookingCalendar";
import CancellationDialog from "@/components/CancellationDialog";
import ReviewDialog from "@/components/ReviewDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";

export default function BookingsList() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  
  const { data: bookings, isLoading, refetch } = trpc.booking.getMyBookings.useQuery();

  // Pull-to-refresh functionality
  const pullToRefreshState = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    },
    enabled: !isLoading,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const canCancel = (status: string) => {
    return status === "pending" || status === "confirmed";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container py-8">
          <Breadcrumb items={[{ label: t("bookings.title") }]} className="mb-6" />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
            <span className="ml-3 text-gray-600">{t("common.loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Pull-to-refresh indicator */}
      <PullToRefreshIndicator {...pullToRefreshState} />
      <div className="container py-8">
        <Breadcrumb items={[{ label: t("bookings.title") }]} className="mb-6" />
        <h1 className="text-4xl font-bold mb-8">{t("bookings.title")}</h1>
        
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              {t("bookings.listView")}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {t("bookings.calendarView")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {!bookings || bookings.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t("bookings.history")}</CardTitle>
                  <CardDescription>{t("bookings.historyDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t("bookings.noBookings")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {bookings.map((booking: any) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <CardTitle className="text-xl">
                              {booking.serviceName || t("bookings.serviceBookingDefault")}
                            </CardTitle>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-base">
                            {booking.officeName}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {canCancel(booking.status) && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setCancelBookingId(booking.id)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              {t("actions.cancel")}
                            </Button>
                          )}
                          {booking.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReviewBooking(booking)}
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column - Booking Details */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                              {t("booking.details")}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {booking.scheduledDate
                                    ? new Date(booking.scheduledDate).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                     : t("bookings.dateNotScheduled")}
                                </span>
                              </div>
                              {booking.scheduledTime && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{booking.scheduledTime}</span>
                                </div>
                              )}
                              {booking.price && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-semibold">
                                     {booking.price} {booking.currency || t("bookings.defaultCurrency")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {booking.serviceDescription && (
                            <div>
                              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                                {t("booking.serviceDescription")}
                              </h3>
                              <p className="text-sm">{booking.serviceDescription}</p>
                            </div>
                          )}

                          {booking.requirements && (
                            <div>
                              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                                Requirements
                              </h3>
                              <p className="text-sm whitespace-pre-wrap">{booking.requirements}</p>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Office Information */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                              {t("booking.officeInformation")}
                            </h3>
                            <div className="space-y-2">
                              {booking.officePhone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <a
                                    href={`tel:${booking.officePhone}`}
                                    className="text-sm text-primary hover:underline"
                                  >
                                    {booking.officePhone}
                                  </a>
                                </div>
                              )}
                              {booking.officeEmail && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <a
                                    href={`mailto:${booking.officeEmail}`}
                                    className="text-sm text-primary hover:underline"
                                  >
                                    {booking.officeEmail}
                                  </a>
                                </div>
                              )}
                              {booking.officeAddress && (
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                  <span className="text-sm">
                                    {booking.officeAddress}
                                    {booking.officeWilayat && `, ${booking.officeWilayat}`}
                                    {booking.officeGovernorate && `, ${booking.officeGovernorate}`}
                                  </span>
                                </div>
                              )}
                              {booking.officeRating && (
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-medium">
                                    {booking.officeRating} / 5.0
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setLocation(`/offices/${booking.officeId}`)}
                          >
                            <Building2 className="w-4 h-4 mr-2" />
                            {t("actions.viewOfficeProfile")}
                          </Button>
                        </div>
                      </div>

                      {/* Cancellation Info */}
                      {booking.status === "cancelled" && booking.cancellationReason && (
                        <>
                          <Separator className="my-4" />
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-start gap-2 mb-2">
                              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-red-900">
                                  Booking Cancelled
                                </p>
                                {booking.cancelledAt && (
                                  <p className="text-xs text-red-700 mt-1">
                                    Cancelled on{" "}
                                    {new Date(booking.cancelledAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-red-800 mt-2">{booking.cancellationReason}</p>
                            {booking.refundAmount && (
                              <div className="mt-3 pt-3 border-t border-red-300">
                                <p className="text-sm font-medium text-green-700">
                                  Refund Amount: {booking.refundAmount} OMR
                                </p>
                                {booking.cancellationPenalty && booking.cancellationPenalty > 0 && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Cancellation Fee: {booking.cancellationPenalty} OMR
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Notes */}
                      {booking.notes && (
                        <>
                          <Separator className="my-4" />
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Notes</p>
                              <p className="text-sm mt-1">{booking.notes}</p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Booking Timeline */}
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {t("booking.created")} {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                        {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                          <span>
                            {t("booking.updated")} {new Date(booking.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <BookingCalendar bookings={bookings || []} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {cancelBookingId !== null && (
        <CancellationDialog
          bookingId={cancelBookingId}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setCancelBookingId(null);
              refetch();
            }
          }}
          onSuccess={() => {
            setCancelBookingId(null);
            refetch();
          }}
        />
      )}
      {reviewBooking && (
        <ReviewDialog
          bookingId={reviewBooking.id}
          officeId={reviewBooking.officeId}
          officeName={reviewBooking.officeName || t("bookings.office")}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setReviewBooking(null);
              refetch();
            }
          }}
          onSuccess={() => {
            setReviewBooking(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
