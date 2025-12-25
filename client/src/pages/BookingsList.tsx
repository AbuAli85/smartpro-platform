import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, XCircle, Star } from "lucide-react";
import CancellationDialog from "@/components/CancellationDialog";
import ReviewDialog from "@/components/ReviewDialog";

export default function BookingsList() {
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  
  const { data: bookings, isLoading, refetch } = trpc.booking.getMyBookings.useQuery();

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
        <Navigation />
        <div className="container py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
            <span className="ml-3 text-gray-600">Loading bookings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">My Bookings</h1>
        
        {!bookings || bookings.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>View and manage your service bookings</CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No bookings yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking: any) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{booking.officeName || "Office Booking"}</CardTitle>
                      <CardDescription className="mt-2">
                        {booking.serviceDescription}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {booking.scheduledDate
                          ? new Date(booking.scheduledDate).toLocaleDateString()
                          : "Date not scheduled"}
                      </span>
                    </div>
                    {booking.scheduledTime && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{booking.scheduledTime}</span>
                      </div>
                    )}
                    {booking.price && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-semibold">Price:</span>
                        <span>{booking.price} OMR</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      {canCancel(booking.status) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setCancelBookingId(booking.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Booking
                        </Button>
                      )}
                      {booking.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewBooking(booking)}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Write Review
                        </Button>
                      )}
                    </div>

                    {booking.status === "cancelled" && booking.cancellationReason && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-red-900">Cancellation Reason:</p>
                        <p className="text-sm text-red-700 mt-1">{booking.cancellationReason}</p>
                        {booking.refundAmount && (
                          <p className="text-sm text-green-600 mt-2">
                            Refund: {booking.refundAmount} OMR
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {cancelBookingId && (
        <CancellationDialog
          bookingId={cancelBookingId}
          open={!!cancelBookingId}
          onOpenChange={(open) => !open && setCancelBookingId(null)}
          onSuccess={() => {
            refetch();
            setCancelBookingId(null);
          }}
        />
      )}

      {reviewBooking && (
        <ReviewDialog
          officeId={reviewBooking.officeId}
          bookingId={reviewBooking.id}
          officeName={reviewBooking.officeName || "Office"}
          open={!!reviewBooking}
          onOpenChange={(open) => !open && setReviewBooking(null)}
          onSuccess={() => {
            refetch();
            setReviewBooking(null);
          }}
        />
      )}
    </div>
  );
}
