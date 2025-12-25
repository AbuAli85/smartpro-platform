import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, TrendingUp, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import AvailabilityEditor from "@/components/AvailabilityEditor";

export default function OfficeDashboard() {
  const [selectedTab, setSelectedTab] = useState("bookings");

  // Get office owned by current user
  const { data: myOffice, isLoading: loadingOffice } = trpc.sanadOffice.getMyOffice.useQuery();

  // Get bookings for this office
  const { data: bookings, refetch: refetchBookings } = trpc.booking.getOfficeBookings.useQuery(
    { officeId: myOffice?.id || 0 },
    { enabled: !!myOffice }
  );

  // Get office statistics
  const { data: stats } = trpc.sanadOffice.getOfficeStats.useQuery(
    { officeId: myOffice?.id || 0 },
    { enabled: !!myOffice }
  );

  const updateBookingMutation = trpc.booking.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Booking updated successfully");
      refetchBookings();
    },
    onError: (error) => {
      toast.error("Failed to update booking", { description: error.message });
    },
  });

  const handleUpdateBooking = (bookingId: number, status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled") => {
    updateBookingMutation.mutate({ bookingId, status });
  };

  if (loadingOffice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your office...</p>
        </div>
      </div>
    );
  }

  if (!myOffice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Office Found</CardTitle>
            <CardDescription>
              You don't have a registered office yet. Please register your Sanad office to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/register-office">Register Office</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "outline", icon: AlertCircle },
      confirmed: { variant: "default", icon: CheckCircle2 },
      completed: { variant: "secondary", icon: CheckCircle2 },
      cancelled: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-[#003366]">{myOffice.officeName}</h1>
          <p className="text-gray-600 mt-1">Office Dashboard</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingBookings || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.monthlyBookings || 0}</div>
              <p className="text-xs text-muted-foreground">Current month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.uniqueCustomers || 0}</div>
              <p className="text-xs text-muted-foreground">Unique clients</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="profile">Office Profile</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Requests</CardTitle>
                <CardDescription>Manage your customer bookings and appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {!bookings || bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">Booking #{booking.id}</h3>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <strong>Date:</strong>{" "}
                                {booking.scheduledDate
                                  ? new Date(booking.scheduledDate).toLocaleDateString()
                                  : "Not scheduled"}
                              </p>
                              <p>
                                <strong>Time:</strong> {booking.scheduledTime || "Not set"}
                              </p>
                              <p>
                                <strong>Service:</strong> {booking.serviceDescription}
                              </p>
                              {booking.requirements && (
                                <p>
                                  <strong>Requirements:</strong> {booking.requirements}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {booking.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateBooking(booking.id, "confirmed")}
                                  disabled={updateBookingMutation.isPending}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateBooking(booking.id, "cancelled")}
                                  disabled={updateBookingMutation.isPending}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleUpdateBooking(booking.id, "completed")}
                                disabled={updateBookingMutation.isPending}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Manage Availability</CardTitle>
                <CardDescription>Set your working hours and available time slots</CardDescription>
              </CardHeader>
              <CardContent>
                <AvailabilityEditor officeId={myOffice.id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Office Profile</CardTitle>
                <CardDescription>View and edit your office information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Office Name</label>
                    <p className="mt-1 text-gray-900">{myOffice.officeName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{myOffice.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-gray-900">{myOffice.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-gray-900">
                      {myOffice.wilayat}, {myOffice.governorate}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <Badge variant={myOffice.verificationStatus === "verified" ? "default" : "outline"}>
                        {myOffice.verificationStatus}
                      </Badge>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
