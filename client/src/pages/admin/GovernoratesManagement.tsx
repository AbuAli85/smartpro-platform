import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function GovernoratesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGovernorate, setSelectedGovernorate] = useState<any>(null);

  const { data: governorates, isLoading, refetch } = trpc.contentManagement.getGovernorates.useQuery({
    region: regionFilter === 'all' ? undefined : regionFilter,
    search: searchTerm || undefined,
  });

  const createMutation = trpc.contentManagement.createGovernorate.useMutation({
    onSuccess: () => {
      toast.success('Governorate created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create governorate: ${error.message}`);
    },
  });

  const updateMutation = trpc.contentManagement.updateGovernorate.useMutation({
    onSuccess: () => {
      toast.success('Governorate updated successfully');
      setIsEditDialogOpen(false);
      setSelectedGovernorate(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update governorate: ${error.message}`);
    },
  });

  const deleteMutation = trpc.contentManagement.deleteGovernorate.useMutation({
    onSuccess: () => {
      toast.success('Governorate deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedGovernorate(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete governorate: ${error.message}`);
    },
  });

  const handleCreate = (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    createMutation.mutate({
      name: data.name as string,
      nameAr: data.nameAr as string,
      slug: data.slug as string,
      region: data.region as 'coastal' | 'interior' | 'south' | 'musandam',
      capitalCity: data.capitalCity as string || undefined,
      capitalCityAr: data.capitalCityAr as string || undefined,
      area: data.area ? Number(data.area) : undefined,
      population: data.population ? Number(data.population) : undefined,
      populationYear: data.populationYear ? Number(data.populationYear) : undefined,
      overview: data.overview as string || undefined,
      overviewAr: data.overviewAr as string || undefined,
      economicProfile: data.economicProfile as string || undefined,
      economicProfileAr: data.economicProfileAr as string || undefined,
      totalBusinesses: data.totalBusinesses ? Number(data.totalBusinesses) : undefined,
      smeCount: data.smeCount ? Number(data.smeCount) : undefined,
      registeredOfficesCount: data.registeredOfficesCount ? Number(data.registeredOfficesCount) : undefined,
      governmentOfficePhone: data.governmentOfficePhone as string || undefined,
      governmentOfficeEmail: data.governmentOfficeEmail as string || undefined,
      featured: data.featured === 'true' ? 1 : 0,
      displayOrder: data.displayOrder ? Number(data.displayOrder) : undefined,
      status: (data.status as 'draft' | 'active' | 'inactive') || 'active',
    });
  };

  const handleUpdate = (formData: FormData) => {
    if (!selectedGovernorate) return;
    const data = Object.fromEntries(formData.entries());
    updateMutation.mutate({
      id: selectedGovernorate.id,
      name: data.name as string || undefined,
      nameAr: data.nameAr as string || undefined,
      slug: data.slug as string || undefined,
      region: data.region as 'coastal' | 'interior' | 'south' | 'musandam' || undefined,
      capitalCity: data.capitalCity as string || undefined,
      capitalCityAr: data.capitalCityAr as string || undefined,
      area: data.area ? Number(data.area) : undefined,
      population: data.population ? Number(data.population) : undefined,
      populationYear: data.populationYear ? Number(data.populationYear) : undefined,
      overview: data.overview as string || undefined,
      overviewAr: data.overviewAr as string || undefined,
      economicProfile: data.economicProfile as string || undefined,
      economicProfileAr: data.economicProfileAr as string || undefined,
      totalBusinesses: data.totalBusinesses ? Number(data.totalBusinesses) : undefined,
      smeCount: data.smeCount ? Number(data.smeCount) : undefined,
      registeredOfficesCount: data.registeredOfficesCount ? Number(data.registeredOfficesCount) : undefined,
      governmentOfficePhone: data.governmentOfficePhone as string || undefined,
      governmentOfficeEmail: data.governmentOfficeEmail as string || undefined,
      featured: data.featured === 'true' ? 1 : 0,
      displayOrder: data.displayOrder ? Number(data.displayOrder) : undefined,
      status: (data.status as 'draft' | 'active' | 'inactive') || undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedGovernorate) return;
    deleteMutation.mutate({ id: selectedGovernorate.id });
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Governorates Management</CardTitle>
          <CardDescription>
            Manage Omani governorates information and regional data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search governorates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="coastal">Coastal</SelectItem>
                <SelectItem value="interior">Interior</SelectItem>
                <SelectItem value="south">South</SelectItem>
                <SelectItem value="musandam">Musandam</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Governorate
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Capital</TableHead>
                  <TableHead>Population</TableHead>
                  <TableHead>Businesses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {governorates?.map((governorate: any) => (
                  <TableRow key={governorate.id}>
                    <TableCell className="font-medium">{governorate.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{governorate.region}</Badge>
                    </TableCell>
                    <TableCell>{governorate.capitalCity || '-'}</TableCell>
                    <TableCell>{governorate.population?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{governorate.totalBusinesses?.toLocaleString() || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={governorate.status === 'active' ? 'default' : 'secondary'}>
                        {governorate.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedGovernorate(governorate);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedGovernorate(governorate);
                            setIsDeleteDialogOpen(true);
                          }}
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Governorate</DialogTitle>
            <DialogDescription>
              Add a new governorate with comprehensive regional information
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate(new FormData(e.currentTarget));
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (English) *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameAr">Name (Arabic) *</Label>
                  <Input id="nameAr" name="nameAr" dir="rtl" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" name="slug" placeholder="e.g., muscat" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select name="region" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coastal">Coastal</SelectItem>
                      <SelectItem value="interior">Interior</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                      <SelectItem value="musandam">Musandam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capitalCity">Capital City</Label>
                  <Input id="capitalCity" name="capitalCity" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capitalCityAr">Capital City (Arabic)</Label>
                  <Input id="capitalCityAr" name="capitalCityAr" dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Area (km²)</Label>
                  <Input id="area" name="area" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="population">Population</Label>
                  <Input id="population" name="population" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="populationYear">Population Year</Label>
                  <Input id="populationYear" name="populationYear" type="number" placeholder="e.g., 2023" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="overview">Overview</Label>
                <Textarea id="overview" name="overview" rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overviewAr">Overview (Arabic)</Label>
                <Textarea id="overviewAr" name="overviewAr" rows={3} dir="rtl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="economicProfile">Economic Profile</Label>
                <Textarea id="economicProfile" name="economicProfile" rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="economicProfileAr">Economic Profile (Arabic)</Label>
                <Textarea id="economicProfileAr" name="economicProfileAr" rows={3} dir="rtl" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalBusinesses">Total Businesses</Label>
                  <Input id="totalBusinesses" name="totalBusinesses" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smeCount">SME Count</Label>
                  <Input id="smeCount" name="smeCount" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registeredOfficesCount">Registered Offices</Label>
                  <Input id="registeredOfficesCount" name="registeredOfficesCount" type="number" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="governmentOfficePhone">Government Office Phone</Label>
                  <Input id="governmentOfficePhone" name="governmentOfficePhone" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="governmentOfficeEmail">Government Office Email</Label>
                  <Input id="governmentOfficeEmail" name="governmentOfficeEmail" type="email" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="featured">Featured</Label>
                  <Select name="featured" defaultValue="false">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input id="displayOrder" name="displayOrder" type="number" defaultValue="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Governorate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Governorate</DialogTitle>
            <DialogDescription>
              Update the governorate information
            </DialogDescription>
          </DialogHeader>
          {selectedGovernorate && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate(new FormData(e.currentTarget));
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name (English)</Label>
                    <Input id="edit-name" name="name" defaultValue={selectedGovernorate.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nameAr">Name (Arabic)</Label>
                    <Input id="edit-nameAr" name="nameAr" defaultValue={selectedGovernorate.nameAr} dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-slug">Slug</Label>
                    <Input id="edit-slug" name="slug" defaultValue={selectedGovernorate.slug} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-region">Region</Label>
                    <Select name="region" defaultValue={selectedGovernorate.region}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coastal">Coastal</SelectItem>
                        <SelectItem value="interior">Interior</SelectItem>
                        <SelectItem value="south">South</SelectItem>
                        <SelectItem value="musandam">Musandam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-capitalCity">Capital City</Label>
                    <Input id="edit-capitalCity" name="capitalCity" defaultValue={selectedGovernorate.capitalCity || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-population">Population</Label>
                    <Input id="edit-population" name="population" type="number" defaultValue={selectedGovernorate.population || ''} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-overview">Overview</Label>
                  <Textarea id="edit-overview" name="overview" rows={3} defaultValue={selectedGovernorate.overview || ''} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-economicProfile">Economic Profile</Label>
                  <Textarea id="edit-economicProfile" name="economicProfile" rows={3} defaultValue={selectedGovernorate.economicProfile || ''} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-totalBusinesses">Total Businesses</Label>
                    <Input id="edit-totalBusinesses" name="totalBusinesses" type="number" defaultValue={selectedGovernorate.totalBusinesses || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-featured">Featured</Label>
                    <Select name="featured" defaultValue={selectedGovernorate.featured ? 'true' : 'false'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select name="status" defaultValue={selectedGovernorate.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Governorate'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Governorate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedGovernorate?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
