import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Calendar, CheckCircle, XCircle, Star, TrendingUp, DollarSign, Users, MessageSquare, Settings, Edit, Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function OfficeOwnerDashboard() {
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [reviewResponse, setReviewResponse] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Edit office form state
  const [editForm, setEditForm] = useState({
    officeName: "",
    description: "",
    email: "",
    phone: "",
    addressLine1: "",
    governorate: "",
    wilayat: ""
  });

  // Service management state
  const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
  const [editServiceDialogOpen, setEditServiceDialogOpen] = useState(false);
  const [deleteServiceDialogOpen, setDeleteServiceDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    serviceNameAr: "",
    description: "",
    descriptionAr: "",
    price: "",
    estimatedDays: ""
  });

  // Operating hours state
  const daysOfWeek = [
    { key: 'sunday', label: 'Sunday', labelAr: 'الأحد' },
    { key: 'monday', label: 'Monday', labelAr: 'الإثنين' },
    { key: 'tuesday', label: 'Tuesday', labelAr: 'الثلاثاء' },
    { key: 'wednesday', label: 'Wednesday', labelAr: 'الأربعاء' },
    { key: 'thursday', label: 'Thursday', labelAr: 'الخميس' },
    { key: 'friday', label: 'Friday', labelAr: 'الجمعة' },
    { key: 'saturday', label: 'Saturday', labelAr: 'السبت' }
  ];

  const [workingHours, setWorkingHours] = useState<Record<string, { enabled: boolean; start: string; end: string }>>({
    sunday: { enabled: true, start: '08:00', end: '17:00' },
    monday: { enabled: true, start: '08:00', end: '17:00' },
    tuesday: { enabled: true, start: '08:00', end: '17:00' },
    wednesday: { enabled: true, start: '08:00', end: '17:00' },
    thursday: { enabled: true, start: '08:00', end: '17:00' },
    friday: { enabled: false, start: '08:00', end: '17:00' },
    saturday: { enabled: false, start: '08:00', end: '17:00' }
  });

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

  const { data: services, refetch: refetchServices } = trpc.officeOwner.getOfficeServices.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  const { data: availability } = trpc.officeOwner.getOfficeAvailability.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  // Load working hours from availability data
  useEffect(() => {
    if (availability && availability.length > 0) {
      const hoursMap: Record<string, { enabled: boolean; start: string; end: string }> = {};
      availability.forEach((avail: any) => {
        const dayKey = daysOfWeek[avail.dayOfWeek]?.key;
        if (dayKey) {
          hoursMap[dayKey] = {
            enabled: true,
            start: avail.startTime || '08:00',
            end: avail.endTime || '17:00'
          };
        }
      });
      // Fill in disabled days
      daysOfWeek.forEach(day => {
        if (!hoursMap[day.key]) {
          hoursMap[day.key] = { enabled: false, start: '08:00', end: '17:00' };
        }
      });
      setWorkingHours(hoursMap);
    }
  }, [availability]);

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

  const updateOfficeInfo = trpc.officeOwner.updateOfficeInfo.useMutation({
    onSuccess: () => {
      toast.success("Office information updated successfully");
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addService = trpc.officeOwner.addService.useMutation({
    onSuccess: () => {
      toast.success("Service added successfully");
      setAddServiceDialogOpen(false);
      setServiceForm({
        serviceName: "",
        serviceNameAr: "",
        description: "",
        descriptionAr: "",
        price: "",
        estimatedDays: ""
      });
      refetchServices();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateService = trpc.officeOwner.updateService.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully");
      setEditServiceDialogOpen(false);
      setSelectedServiceId(null);
      refetchServices();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteService = trpc.officeOwner.deleteService.useMutation({
    onSuccess: () => {
      toast.success("Service deleted successfully");
      setDeleteServiceDialogOpen(false);
      setSelectedServiceId(null);
      refetchServices();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateOfficeAvailability = trpc.officeOwner.updateOfficeAvailability.useMutation({
    onSuccess: () => {
      toast.success("Operating hours updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Populate form when office is selected
  useEffect(() => {
    if (selectedOffice) {
      setEditForm({
        officeName: selectedOffice.officeName || "",
        description: selectedOffice.description || "",
        email: selectedOffice.email || "",
        phone: selectedOffice.phone || "",
        addressLine1: selectedOffice.addressLine1 || "",
        governorate: selectedOffice.governorate || "",
        wilayat: selectedOffice.wilayat || ""
      });
    }
  }, [selectedOffice]);

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

  const handleSaveOfficeInfo = () => {
    if (!officeId) return;
    
    // Validation
    if (!editForm.officeName.trim()) {
      toast.error("Office name is required");
      return;
    }
    if (!editForm.email.trim() || !editForm.email.includes('@')) {
      toast.error("Valid email is required");
      return;
    }
    if (!editForm.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    updateOfficeInfo.mutate({
      officeId,
      ...editForm
    });
  };

  const handleAddService = () => {
    if (!officeId) return;

    // Validation
    if (!serviceForm.serviceName.trim()) {
      toast.error("Service name (English) is required");
      return;
    }
    if (!serviceForm.serviceNameAr.trim()) {
      toast.error("Service name (Arabic) is required");
      return;
    }
    if (!serviceForm.price || parseFloat(serviceForm.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!serviceForm.estimatedDays || parseInt(serviceForm.estimatedDays) <= 0) {
      toast.error("Valid estimated days is required");
      return;
    }

    addService.mutate({
      officeId,
      serviceName: serviceForm.serviceName,
      serviceNameAr: serviceForm.serviceNameAr,
      description: serviceForm.description || undefined,
      descriptionAr: serviceForm.descriptionAr || undefined,
      price: parseFloat(serviceForm.price),
      estimatedDays: parseInt(serviceForm.estimatedDays)
    });
  };

  const handleEditService = () => {
    if (!selectedServiceId) return;

    // Validation
    if (!serviceForm.serviceName.trim()) {
      toast.error("Service name (English) is required");
      return;
    }
    if (!serviceForm.serviceNameAr.trim()) {
      toast.error("Service name (Arabic) is required");
      return;
    }
    if (!serviceForm.price || parseFloat(serviceForm.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!serviceForm.estimatedDays || parseInt(serviceForm.estimatedDays) <= 0) {
      toast.error("Valid estimated days is required");
      return;
    }

    updateService.mutate({
      serviceId: selectedServiceId,
      serviceName: serviceForm.serviceName,
      serviceNameAr: serviceForm.serviceNameAr,
      description: serviceForm.description || undefined,
      descriptionAr: serviceForm.descriptionAr || undefined,
      price: parseFloat(serviceForm.price),
      estimatedDays: parseInt(serviceForm.estimatedDays)
    });
  };

  const handleDeleteService = () => {
    if (!selectedServiceId) return;
    deleteService.mutate({ serviceId: selectedServiceId });
  };

  const openEditServiceDialog = (service: any) => {
    setSelectedServiceId(service.id);
    setServiceForm({
      serviceName: service.serviceName || "",
      serviceNameAr: service.serviceNameAr || "",
      description: service.description || "",
      descriptionAr: service.descriptionAr || "",
      price: service.price?.toString() || "",
      estimatedDays: service.estimatedDays?.toString() || ""
    });
    setEditServiceDialogOpen(true);
  };

  const openDeleteServiceDialog = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setDeleteServiceDialogOpen(true);
  };

  const handleSaveWorkingHours = () => {
    if (!officeId) return;

    // Validation
    const enabledDays = Object.entries(workingHours).filter(([_, hours]) => hours.enabled);
    if (enabledDays.length === 0) {
      toast.error("Please enable at least one working day");
      return;
    }

    // Validate time ranges
    for (const [day, hours] of enabledDays) {
      if (hours.start >= hours.end) {
        const dayLabel = daysOfWeek.find(d => d.key === day)?.label;
        toast.error(`Invalid time range for ${dayLabel}: start time must be before end time`);
        return;
      }
    }

    updateOfficeAvailability.mutate({
      officeId,
      workingHours
    });
  };

  const toggleDayEnabled = (dayKey: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled
      }
    }));
  };

  const updateDayTime = (dayKey: string, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value
      }
    }));
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
                <Dialog open={addServiceDialogOpen} onOpenChange={setAddServiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Service</DialogTitle>
                      <DialogDescription>
                        Create a new service offering for your office
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Service Name (English) *</Label>
                          <Input 
                            value={serviceForm.serviceName}
                            onChange={(e) => setServiceForm({...serviceForm, serviceName: e.target.value})}
                            placeholder="e.g., Company Registration"
                          />
                        </div>
                        <div>
                          <Label>Service Name (Arabic) *</Label>
                          <Input 
                            value={serviceForm.serviceNameAr}
                            onChange={(e) => setServiceForm({...serviceForm, serviceNameAr: e.target.value})}
                            placeholder="مثال: تسجيل الشركات"
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Description (English)</Label>
                          <Textarea 
                            value={serviceForm.description}
                            onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                            placeholder="Describe the service..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Description (Arabic)</Label>
                          <Textarea 
                            value={serviceForm.descriptionAr}
                            onChange={(e) => setServiceForm({...serviceForm, descriptionAr: e.target.value})}
                            placeholder="وصف الخدمة..."
                            rows={3}
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Price (OMR) *</Label>
                          <Input 
                            type="number"
                            value={serviceForm.price}
                            onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label>Estimated Days *</Label>
                          <Input 
                            type="number"
                            value={serviceForm.estimatedDays}
                            onChange={(e) => setServiceForm({...serviceForm, estimatedDays: e.target.value})}
                            placeholder="1"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddServiceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddService}
                        disabled={addService.isPending}
                      >
                        {addService.isPending ? "Adding..." : "Add Service"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!services || services.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No services yet. Add your first service using the button above.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Est. Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service: any) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{service.serviceName}</div>
                            <div className="text-sm text-muted-foreground" dir="rtl">
                              {service.serviceNameAr}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {service.description || "No description"}
                          </div>
                        </TableCell>
                        <TableCell>{service.price} OMR</TableCell>
                        <TableCell>{service.estimatedDays} days</TableCell>
                        <TableCell>
                          <Badge variant={service.isActive ? "default" : "secondary"}>
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditServiceDialog(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteServiceDialog(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Edit Service Dialog */}
          <Dialog open={editServiceDialogOpen} onOpenChange={setEditServiceDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Service</DialogTitle>
                <DialogDescription>
                  Update service details and pricing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Service Name (English) *</Label>
                    <Input 
                      value={serviceForm.serviceName}
                      onChange={(e) => setServiceForm({...serviceForm, serviceName: e.target.value})}
                      placeholder="e.g., Company Registration"
                    />
                  </div>
                  <div>
                    <Label>Service Name (Arabic) *</Label>
                    <Input 
                      value={serviceForm.serviceNameAr}
                      onChange={(e) => setServiceForm({...serviceForm, serviceNameAr: e.target.value})}
                      placeholder="مثال: تسجيل الشركات"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Description (English)</Label>
                    <Textarea 
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                      placeholder="Describe the service..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Description (Arabic)</Label>
                    <Textarea 
                      value={serviceForm.descriptionAr}
                      onChange={(e) => setServiceForm({...serviceForm, descriptionAr: e.target.value})}
                      placeholder="وصف الخدمة..."
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (OMR) *</Label>
                    <Input 
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Estimated Days *</Label>
                    <Input 
                      type="number"
                      value={serviceForm.estimatedDays}
                      onChange={(e) => setServiceForm({...serviceForm, estimatedDays: e.target.value})}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditServiceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditService}
                  disabled={updateService.isPending}
                >
                  {updateService.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteServiceDialogOpen} onOpenChange={setDeleteServiceDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Service</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this service? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteServiceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteService}
                  disabled={deleteService.isPending}
                >
                  {deleteService.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <div className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 min-w-[120px]">
                      <input
                        type="checkbox"
                        id={`${day.key}-enabled`}
                        checked={workingHours[day.key]?.enabled || false}
                        onChange={() => toggleDayEnabled(day.key)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={`${day.key}-enabled`} className="font-medium">
                        {day.label}
                      </label>
                    </div>
                    
                    {workingHours[day.key]?.enabled && (
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-muted-foreground">From:</Label>
                          <Input
                            type="time"
                            value={workingHours[day.key]?.start || '08:00'}
                            onChange={(e) => updateDayTime(day.key, 'start', e.target.value)}
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-muted-foreground">To:</Label>
                          <Input
                            type="time"
                            value={workingHours[day.key]?.end || '17:00'}
                            onChange={(e) => updateDayTime(day.key, 'end', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      </div>
                    )}
                    
                    {!workingHours[day.key]?.enabled && (
                      <span className="text-sm text-muted-foreground">Closed</span>
                    )}
                  </div>
                ))}
                
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSaveWorkingHours}
                    disabled={updateOfficeAvailability.isPending}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {updateOfficeAvailability.isPending ? "Saving..." : "Save Working Hours"}
                  </Button>
                </div>
              </div>
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
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
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
                        <Label>Office Name *</Label>
                        <Input 
                          value={editForm.officeName}
                          onChange={(e) => setEditForm({...editForm, officeName: e.target.value})}
                          placeholder="Enter office name"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea 
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          rows={4}
                          placeholder="Describe your office and services"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Email *</Label>
                          <Input 
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            placeholder="office@example.com"
                          />
                        </div>
                        <div>
                          <Label>Phone *</Label>
                          <Input 
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            placeholder="+968 XXXX XXXX"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Textarea 
                          value={editForm.addressLine1}
                          onChange={(e) => setEditForm({...editForm, addressLine1: e.target.value})}
                          rows={2}
                          placeholder="Street address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Governorate</Label>
                          <Input 
                            value={editForm.governorate}
                            onChange={(e) => setEditForm({...editForm, governorate: e.target.value})}
                            placeholder="e.g., Muscat"
                          />
                        </div>
                        <div>
                          <Label>Wilayat</Label>
                          <Input 
                            value={editForm.wilayat}
                            onChange={(e) => setEditForm({...editForm, wilayat: e.target.value})}
                            placeholder="e.g., Seeb"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveOfficeInfo}
                        disabled={updateOfficeInfo.isPending}
                      >
                        {updateOfficeInfo.isPending ? "Saving..." : "Save Changes"}
                      </Button>
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
