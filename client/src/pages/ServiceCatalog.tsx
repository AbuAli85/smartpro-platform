import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit, Trash2, DollarSign, Clock, Tag } from "lucide-react";

const SERVICE_CATEGORIES = [
  "Business Registration",
  "Tax & Accounting",
  "Legal Services",
  "HR & Payroll",
  "Immigration",
  "Licensing & Permits",
  "Consulting",
  "Other",
];

const PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Hourly Rate" },
  { value: "custom", label: "Custom Quote" },
];

export default function ServiceCatalog() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [formData, setFormData] = useState({
    serviceName: "",
    serviceNameAr: "",
    category: "",
    description: "",
    descriptionAr: "",
    price: "",
    priceType: "fixed" as "fixed" | "hourly" | "custom",
    estimatedDeliveryDays: "",
  });

  // Get user's office first
  const { data: userOffices } = trpc.sanadOffice.getMyOffices.useQuery();
  const officeId = userOffices?.[0]?.id;

  // Fetch services
  const { data: services, isLoading, refetch } = trpc.sanadOffice.getServices.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  // Create service mutation
  const createMutation = trpc.sanadOffice.createService.useMutation({
    onSuccess: () => {
      toast.success("Service created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to create service", {
        description: error.message,
      });
    },
  });

  // Update service mutation
  const updateMutation = trpc.sanadOffice.updateService.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully");
      setIsEditDialogOpen(false);
      setSelectedService(null);
      resetForm();
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to update service", {
        description: error.message,
      });
    },
  });

  // Delete service mutation
  const deleteMutation = trpc.sanadOffice.deleteService.useMutation({
    onSuccess: () => {
      toast.success("Service deleted successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to delete service", {
        description: error.message,
      });
    },
  });

  // Toggle service active status
  const toggleActiveMutation = trpc.sanadOffice.updateService.useMutation({
    onSuccess: () => {
      toast.success("Service status updated");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to update service status", {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      serviceName: "",
      serviceNameAr: "",
      category: "",
      description: "",
      descriptionAr: "",
      price: "",
      priceType: "fixed",
      estimatedDeliveryDays: "",
    });
  };

  const handleCreate = () => {
    if (!formData.serviceName || !formData.category) {
      toast.error("Please fill in required fields");
      return;
    }

    if (!officeId) {
      toast.error("No office found. Please register an office first.");
      return;
    }

    createMutation.mutate({
      officeId,
      serviceName: formData.serviceName,
      serviceNameAr: formData.serviceNameAr || undefined,
      category: formData.category,
      description: formData.description || undefined,
      descriptionAr: formData.descriptionAr || undefined,
      price: formData.price || undefined,
      priceType: formData.priceType,
      estimatedDeliveryDays: formData.estimatedDeliveryDays
        ? parseInt(formData.estimatedDeliveryDays)
        : undefined,
    });
  };

  const handleEdit = (service: any) => {
    setSelectedService(service);
    setFormData({
      serviceName: service.serviceName,
      serviceNameAr: service.serviceNameAr || "",
      category: service.category,
      description: service.description || "",
      descriptionAr: service.descriptionAr || "",
      price: service.price ? String(service.price) : "",
      priceType: service.priceType || "fixed",
      estimatedDeliveryDays: service.estimatedDeliveryDays ? String(service.estimatedDeliveryDays) : "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedService || !formData.serviceName || !formData.category) {
      toast.error("Please fill in required fields");
      return;
    }

    updateMutation.mutate({
      serviceId: selectedService.id,
      serviceName: formData.serviceName,
      serviceNameAr: formData.serviceNameAr || undefined,
      category: formData.category,
      description: formData.description || undefined,
      descriptionAr: formData.descriptionAr || undefined,
      price: formData.price || undefined,
      priceType: formData.priceType,
      estimatedDeliveryDays: formData.estimatedDeliveryDays
        ? parseInt(formData.estimatedDeliveryDays)
        : undefined,
    });
  };

  const handleDelete = (serviceId: number) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteMutation.mutate({ serviceId });
    }
  };

  const handleToggleActive = (serviceId: number, currentStatus: boolean) => {
    toggleActiveMutation.mutate({
      serviceId,
      isActive: !currentStatus,
    });
  };

  if (!officeId) {
    return (
      <div className="container py-8 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No Office Found</h3>
            <p className="text-muted-foreground">
              Please register your office first before managing services.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Service Catalog</h1>
          <p className="text-muted-foreground">
            Manage your office's service offerings
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading services...
          </CardContent>
        </Card>
      ) : !services || services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Services Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first service offering
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Services ({services.length})</CardTitle>
            <CardDescription>
              Manage pricing, delivery times, and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service: any) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.serviceName}</p>
                        {service.serviceNameAr && (
                          <p className="text-sm text-muted-foreground" dir="rtl">
                            {service.serviceNameAr}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {service.price ? (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {service.price} {service.currency}
                          {service.priceType === "hourly" && "/hr"}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Custom</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {service.estimatedDeliveryDays ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.estimatedDeliveryDays} days
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={service.isActive}
                        onCheckedChange={() =>
                          handleToggleActive(service.id, service.isActive)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Service Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service offering for your office
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  value={formData.serviceName}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceName: e.target.value })
                  }
                  placeholder="e.g., Business License Registration"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceNameAr">Service Name (Arabic)</Label>
                <Input
                  id="serviceNameAr"
                  value={formData.serviceNameAr}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceNameAr: e.target.value })
                  }
                  placeholder="اسم الخدمة"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this service includes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionAr">Description (Arabic)</Label>
              <Textarea
                id="descriptionAr"
                value={formData.descriptionAr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionAr: e.target.value })
                }
                placeholder="وصف الخدمة"
                dir="rtl"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceType">Price Type</Label>
                <Select
                  value={formData.priceType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, priceType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (OMR) {formData.priceType === "custom" && "(Optional)"}
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.000"
                  disabled={formData.priceType === "custom"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDeliveryDays">
                Estimated Delivery (Days)
              </Label>
              <Input
                id="estimatedDeliveryDays"
                type="number"
                value={formData.estimatedDeliveryDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDeliveryDays: e.target.value,
                  })
                }
                placeholder="e.g., 5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service details and pricing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-serviceName">Service Name *</Label>
                <Input
                  id="edit-serviceName"
                  value={formData.serviceName}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-serviceNameAr">Service Name (Arabic)</Label>
                <Input
                  id="edit-serviceNameAr"
                  value={formData.serviceNameAr}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceNameAr: e.target.value })
                  }
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descriptionAr">Description (Arabic)</Label>
              <Textarea
                id="edit-descriptionAr"
                value={formData.descriptionAr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionAr: e.target.value })
                }
                dir="rtl"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priceType">Price Type</Label>
                <Select
                  value={formData.priceType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, priceType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (OMR)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.001"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  disabled={formData.priceType === "custom"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-estimatedDeliveryDays">
                Estimated Delivery (Days)
              </Label>
              <Input
                id="edit-estimatedDeliveryDays"
                type="number"
                value={formData.estimatedDeliveryDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDeliveryDays: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedService(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
