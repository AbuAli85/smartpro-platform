import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package, DollarSign, Calendar, X } from "lucide-react";

export default function ServiceBundles() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountPercentage: "",
    validFrom: "",
    validUntil: "",
    selectedServices: [] as number[],
  });

  // Get user's office
  const { data: userOffices } = trpc.sanadOffice.getMyOffices.useQuery();
  const officeId = userOffices?.[0]?.id;

  // Fetch bundles
  const { data: bundles, isLoading: bundlesLoading, refetch: refetchBundles } =
    trpc.serviceBundle.getOfficeBundles.useQuery(
      { officeId: officeId! },
      { enabled: !!officeId }
    );

  // Fetch services for selection
  const { data: services, isLoading: servicesLoading } = trpc.sanadOffice.getServices.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  // Create bundle mutation
  const createMutation = trpc.serviceBundle.createBundle.useMutation({
    onSuccess: () => {
      toast.success("Bundle created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      refetchBundles();
    },
    onError: (error: any) => {
      toast.error("Failed to create bundle", {
        description: error.message,
      });
    },
  });

  // Update bundle mutation
  const updateMutation = trpc.serviceBundle.updateBundle.useMutation({
    onSuccess: () => {
      toast.success("Bundle updated successfully");
      setIsEditDialogOpen(false);
      setSelectedBundle(null);
      resetForm();
      refetchBundles();
    },
    onError: (error: any) => {
      toast.error("Failed to update bundle", {
        description: error.message,
      });
    },
  });

  // Delete bundle mutation
  const deleteMutation = trpc.serviceBundle.deleteBundle.useMutation({
    onSuccess: () => {
      toast.success("Bundle deleted successfully");
      refetchBundles();
    },
    onError: (error: any) => {
      toast.error("Failed to delete bundle", {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      discountPercentage: "",
      validFrom: "",
      validUntil: "",
      selectedServices: [],
    });
  };

  const handleServiceToggle = (serviceId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const calculateBundlePrice = () => {
    if (!services) return { original: 0, discounted: 0, savings: 0 };

    const selectedServicesList = services.filter((s: any) =>
      formData.selectedServices.includes(s.id)
    );

    const original = selectedServicesList.reduce(
      (sum: number, s: any) => sum + (parseFloat(s.price) || 0),
      0
    );

    const discount = parseFloat(formData.discountPercentage) || 0;
    const discounted = original * (1 - discount / 100);
    const savings = original - discounted;

    return { original, discounted, savings };
  };

  const handleCreate = () => {
    if (!formData.name || formData.selectedServices.length < 2) {
      toast.error("Please provide a name and select at least 2 services");
      return;
    }

    if (!formData.discountPercentage || parseFloat(formData.discountPercentage) < 1) {
      toast.error("Please provide a discount percentage (minimum 1%)");
      return;
    }

    if (!officeId) {
      toast.error("No office found");
      return;
    }

    const selectedServicesList = services!.filter((s: any) =>
      formData.selectedServices.includes(s.id)
    );

    createMutation.mutate({
      officeId,
      name: formData.name,
      description: formData.description || undefined,
      discountPercentage: parseFloat(formData.discountPercentage),
      validFrom: formData.validFrom || undefined,
      validUntil: formData.validUntil || undefined,
      services: selectedServicesList.map((s: any) => ({
        serviceId: s.id,
        serviceName: s.serviceName,
        servicePrice: parseFloat(s.price) || 0,
      })),
    });
  };

  const handleEdit = (bundle: any) => {
    setSelectedBundle(bundle);
    setFormData({
      name: bundle.name,
      description: bundle.description || "",
      discountPercentage: bundle.discountPercentage || "",
      validFrom: bundle.validFrom ? new Date(bundle.validFrom).toISOString().split("T")[0] : "",
      validUntil: bundle.validUntil ? new Date(bundle.validUntil).toISOString().split("T")[0] : "",
      selectedServices: bundle.services?.map((s: any) => s.serviceId) || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedBundle || !formData.name) {
      toast.error("Please provide a name");
      return;
    }

    if (!officeId) {
      toast.error("No office found");
      return;
    }

    updateMutation.mutate({
      bundleId: selectedBundle.id,
      officeId,
      name: formData.name,
      description: formData.description || undefined,
      discountPercentage: formData.discountPercentage
        ? parseFloat(formData.discountPercentage)
        : undefined,
      validFrom: formData.validFrom || undefined,
      validUntil: formData.validUntil || undefined,
    });
  };

  const handleDelete = (bundleId: number) => {
    if (!officeId) return;
    if (confirm("Are you sure you want to delete this bundle?")) {
      deleteMutation.mutate({ bundleId, officeId });
    }
  };

  const handleToggleActive = (bundle: any) => {
    if (!officeId) return;
    updateMutation.mutate({
      bundleId: bundle.id,
      officeId,
      isActive: !bundle.isActive,
    });
  };

  if (!officeId) {
    return (
      <div className="container py-8 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No Office Found</h3>
            <p className="text-muted-foreground">
              Please register your office first before creating bundles.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pricing = calculateBundlePrice();

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Service Bundles</h1>
          <p className="text-muted-foreground">
            Create package deals to increase value and attract more customers
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} disabled={!services || services.length < 2}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bundle
        </Button>
      </div>

      {bundlesLoading || servicesLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading bundles...
          </CardContent>
        </Card>
      ) : !services || services.length < 2 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Not Enough Services</h3>
            <p className="text-muted-foreground">
              You need at least 2 services to create a bundle. Add more services first.
            </p>
          </CardContent>
        </Card>
      ) : !bundles || bundles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bundles Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first service bundle to offer package deals
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Bundle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Bundles ({bundles.length})</CardTitle>
            <CardDescription>
              Manage package deals and discounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bundle Name</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bundles.map((bundle: any) => (
                  <TableRow key={bundle.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{bundle.name}</p>
                        {bundle.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {bundle.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {bundle.services?.length || 0} services
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        {bundle.discountPercentage}% OFF
                      </div>
                    </TableCell>
                    <TableCell>
                      {bundle.validFrom || bundle.validUntil ? (
                        <div className="text-sm">
                          {bundle.validFrom && (
                            <div>From: {new Date(bundle.validFrom).toLocaleDateString()}</div>
                          )}
                          {bundle.validUntil && (
                            <div>Until: {new Date(bundle.validUntil).toLocaleDateString()}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Always</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={bundle.isActive}
                        onCheckedChange={() => handleToggleActive(bundle)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(bundle)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(bundle.id)}
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

      {/* Create Bundle Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Service Bundle</DialogTitle>
            <DialogDescription>
              Combine multiple services into a package deal with a discount
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bundle Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Business Startup Package"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what's included in this bundle..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Services * (minimum 2)</Label>
              <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                {services?.map((service: any) => (
                  <div key={service.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <label
                      htmlFor={`service-${service.id}`}
                      className="flex-1 flex items-center justify-between cursor-pointer"
                    >
                      <span>{service.serviceName}</span>
                      <span className="text-sm text-muted-foreground">
                        {service.price} {service.currency}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount Percentage * (1-50%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPercentage: e.target.value })
                  }
                  placeholder="15"
                />
              </div>
              <div className="space-y-2">
                <Label>Bundle Savings</Label>
                <div className="h-10 px-3 border rounded-md flex items-center bg-muted">
                  <span className="text-green-600 font-semibold">
                    Save {pricing.savings.toFixed(3)} OMR
                  </span>
                </div>
              </div>
            </div>

            {formData.selectedServices.length >= 2 && formData.discountPercentage && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Original Price:</span>
                      <span className="line-through text-muted-foreground">
                        {pricing.original.toFixed(3)} OMR
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-primary">
                      <span>Bundle Price:</span>
                      <span>{pricing.discounted.toFixed(3)} OMR</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>You Save:</span>
                      <span>{pricing.savings.toFixed(3)} OMR ({formData.discountPercentage}%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From (Optional)</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
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
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Bundle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bundle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bundle</DialogTitle>
            <DialogDescription>Update bundle details and settings</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Bundle Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-discountPercentage">Discount Percentage (1-50%)</Label>
              <Input
                id="edit-discountPercentage"
                type="number"
                min="1"
                max="50"
                value={formData.discountPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, discountPercentage: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-validFrom">Valid From</Label>
                <Input
                  id="edit-validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-validUntil">Valid Until</Label>
                <Input
                  id="edit-validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedBundle(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Bundle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
