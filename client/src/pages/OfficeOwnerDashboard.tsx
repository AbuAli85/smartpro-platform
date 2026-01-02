import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Calendar, CheckCircle, XCircle, Star, TrendingUp, DollarSign, Users, MessageSquare, Settings, Edit, Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function OfficeOwnerDashboard() {
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [reviewResponse, setReviewResponse] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  // Fetch offices owned by current user
  const { data: offices, isLoading: officesLoading } = trpc.officeOwner.getMyOffices.useQuery();

  // Select first office by default
  const officeId = selectedOfficeId || offices?.[0]?.id;

  // Fetch office data
  const { data: bookings, refetch: refetchBookings } = trpc.officeOwner.getOfficeBookings.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  const { data: metrics } = trpc.officeOwner.getOfficeMetrics.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  const { data: reviews, refetch: refetchReviews } = trpc.officeOwner.getOfficeReviews.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  // Mutations
  const updateBookingStatus = trpc.booking.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Booking status updated");
      refetchBookings();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const respondToReviewMutation = trpc.officeOwner.respondToReview.useMutation({
    onSuccess: () => {
      toast.success("Response added successfully");
      setReviewResponse("");
      setSelectedReviewId(null);
      refetchReviews();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleStatus = trpc.officeOwner.toggleOfficeStatus.useMutation({
    onSuccess: () => {
      toast.success("Office status updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleApproveBooking = (bookingId: number) => {
    updateBookingStatus.mutate({ bookingId, status: "confirmed" });
  };

  const handleRejectBooking = (bookingId: number) => {
    updateBookingStatus.mutate({ bookingId, status: "cancelled" });
  };

  const handleRespondToReview = () => {
    if (!selectedReviewId || !reviewResponse.trim()) return;
    respondToReviewMutation.mutate({
      reviewId: selectedReviewId,
      response: reviewResponse,
    });
  };

  if (officesLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!offices || offices.length === 0) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Offices Found</CardTitle>
            <CardDescription>
              You don't have any registered offices yet. Register your office to start managing bookings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const selectedOffice = offices.find(o => o.id === officeId);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Office Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your office bookings, services, and reviews
          </p>
        </div>

        {offices.length > 1 && (
          <Select
            value={officeId?.toString()}
            onValueChange={(value) => setSelectedOfficeId(parseInt(value))}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select office" />
            </SelectTrigger>
            <SelectContent>
              {offices.map((office) => (
                <SelectItem key={office.id} value={office.id.toString()}>
                  {office.officeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Performance Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.completedBookings} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.pendingBookings} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRevenue} OMR</div>
              <p className="text-xs text-muted-foreground">
                From completed bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.averageRating ? Number(metrics.averageRating).toFixed(1) : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalReviews} reviews
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="hours">Operating Hours</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Requests</CardTitle>
              <CardDescription>
                Manage incoming booking requests and appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!bookings || bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No bookings yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.customerName}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.customerEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.scheduledTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.serviceDescription}</TableCell>
                        <TableCell>{booking.price} OMR</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "pending"
                                ? "secondary"
                                : booking.status === "completed"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {booking.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveBooking(booking.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectBooking(booking.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                Respond to customer feedback and reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!reviews || reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No reviews yet
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">Customer Review</CardTitle>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{review.reviewText}</p>

                        {review.responseText ? (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium mb-1">Your Response:</p>
                            <p className="text-sm">{review.responseText}</p>
                          </div>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedReviewId(review.id)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Respond
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Respond to Review</DialogTitle>
                                <DialogDescription>
                                  Write a professional response to this customer review
                                </DialogDescription>
                              </DialogHeader>
                              <Textarea
                                placeholder="Thank you for your feedback..."
                                value={reviewResponse}
                                onChange={(e) => setReviewResponse(e.target.value)}
                                rows={4}
                              />
                              <DialogFooter>
                                <Button onClick={handleRespondToReview}>
                                  Submit Response
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage Services</CardTitle>
                  <CardDescription>
                    Add, edit, or remove services offered by your office
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Service</DialogTitle>
                      <DialogDescription>
                        Create a new service offering for your office
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Service Name</Label>
                        <Input placeholder="e.g., Company Registration" />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea placeholder="Describe the service..." rows={3} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Price (OMR)</Label>
                          <Input type="number" placeholder="0.00" />
                        </div>
                        <div>
                          <Label>Estimated Days</Label>
                          <Input type="number" placeholder="1" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button>Add Service</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Service management coming soon. Use the Add Service button above.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operating Hours Tab */}
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription>
                Set your office working hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Operating hours management coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Office Settings</CardTitle>
              <CardDescription>
                Manage your office availability and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <p className="font-medium">Office Information</p>
                  <p className="text-sm text-muted-foreground">
                    Update your office details, contact info, and description
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Office Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Office Information</DialogTitle>
                      <DialogDescription>
                        Update your office details and contact information
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      <div>
                        <Label>Office Name</Label>
                        <Input defaultValue={selectedOffice?.officeName} />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea defaultValue={selectedOffice?.description || ""} rows={4} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Email</Label>
                          <Input type="email" defaultValue={selectedOffice?.email} />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input defaultValue={selectedOffice?.phone} />
                        </div>
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Textarea defaultValue={selectedOffice?.addressLine1} rows={2} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Governorate</Label>
                          <Input defaultValue={selectedOffice?.governorate} />
                        </div>
                        <div>
                          <Label>Wilayat</Label>
                          <Input defaultValue={selectedOffice?.wilayat} />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Office Status</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOffice?.status === "active"
                      ? "Your office is currently accepting bookings"
                      : "Your office is currently not accepting bookings"}
                  </p>
                </div>
                <Button
                  variant={selectedOffice?.status === "active" ? "destructive" : "default"}
                  onClick={() =>
                    toggleStatus.mutate({
                      officeId: officeId!,
                      isAvailable: selectedOffice?.status !== "active",
                    })
                  }
                >
                  {selectedOffice?.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
