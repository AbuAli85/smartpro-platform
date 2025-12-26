import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";

interface ServiceCatalogProps {
  officeId: number;
}

const SERVICE_CATEGORIES = [
  "Business Registration",
  "Document Attestation",
  "NOC Certificates",
  "License Renewal",
  "Tax Services",
  "Legal Consultation",
  "Immigration Services",
  "Other",
];

const PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Hourly Rate" },
  { value: "custom", label: "Custom Quote" },
];

export function ServiceCatalog({ officeId }: ServiceCatalogProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  
  const { data: services, refetch } = trpc.sanadOffice.getServices.useQuery({ officeId });
  const createService = trpc.sanadOffice.createService.useMutation({
    onSuccess: () => {
      toast.success("Service added successfully");
      refetch();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateService = trpc.sanadOffice.updateService.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully");
      refetch();
      setEditingService(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteService = trpc.sanadOffice.deleteService.useMutation({
    onSuccess: () => {
      toast.success("Service deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      officeId,
      serviceName: formData.get("serviceName") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      priceType: formData.get("priceType") as "fixed" | "hourly" | "custom",
      estimatedDeliveryDays: parseInt(formData.get("estimatedDeliveryDays") as string) || undefined,
    };

    if (editingService) {
      updateService.mutate({ serviceId: editingService.id, ...data });
    } else {
      createService.mutate(data);
    }
  };

  const handleDelete = (serviceId: number) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteService.mutate({ serviceId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Service Catalog</h2>
          <p className="text-muted-foreground">Manage your office services and pricing</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Add a new service to your catalog with pricing and delivery details
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="serviceName">Service Name *</Label>
                  <Input
                    id="serviceName"
                    name="serviceName"
                    placeholder="e.g., Business License Registration"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" required>
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

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what this service includes..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priceType">Price Type *</Label>
                    <Select name="priceType" defaultValue="fixed" required>
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

                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (OMR)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="estimatedDeliveryDays">Estimated Delivery (days)</Label>
                  <Input
                    id="estimatedDeliveryDays"
                    name="estimatedDeliveryDays"
                    type="number"
                    placeholder="e.g., 3"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createService.isPending}>
                  {createService.isPending ? "Adding..." : "Add Service"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services && services.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No services added yet</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {services?.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{service.serviceName}</CardTitle>
                  <CardDescription>{service.category}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingService(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {service.description && (
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
              )}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {service.price ? `${service.price} ${service.currency}` : "Custom Quote"}
                  </span>
                </div>
                {service.estimatedDeliveryDays && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{service.estimatedDeliveryDays} days</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update service details and pricing
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-serviceName">Service Name *</Label>
                <Input
                  id="edit-serviceName"
                  name="serviceName"
                  defaultValue={editingService?.serviceName}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select name="category" defaultValue={editingService?.category} required>
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

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingService?.description || ""}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-priceType">Price Type *</Label>
                  <Select name="priceType" defaultValue={editingService?.priceType} required>
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

                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Price (OMR)</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="0.001"
                    defaultValue={editingService?.price || ""}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-estimatedDeliveryDays">Estimated Delivery (days)</Label>
                <Input
                  id="edit-estimatedDeliveryDays"
                  name="estimatedDeliveryDays"
                  type="number"
                  defaultValue={editingService?.estimatedDeliveryDays || ""}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingService(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateService.isPending}>
                {updateService.isPending ? "Updating..." : "Update Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
