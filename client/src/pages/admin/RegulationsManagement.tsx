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

export default function RegulationsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<any>(null);

  const { data: regulations, isLoading, refetch } = trpc.contentManagement.getRegulations.useQuery({
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    search: searchTerm || undefined,
  });

  const createMutation = trpc.contentManagement.createRegulation.useMutation({
    onSuccess: () => {
      toast.success('Regulation created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create regulation: ${error.message}`);
    },
  });

  const updateMutation = trpc.contentManagement.updateRegulation.useMutation({
    onSuccess: () => {
      toast.success('Regulation updated successfully');
      setIsEditDialogOpen(false);
      setSelectedRegulation(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update regulation: ${error.message}`);
    },
  });

  const deleteMutation = trpc.contentManagement.deleteRegulation.useMutation({
    onSuccess: () => {
      toast.success('Regulation deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedRegulation(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete regulation: ${error.message}`);
    },
  });

  const handleCreate = (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    createMutation.mutate({
      title: data.title as string,
      titleAr: data.titleAr as string || undefined,
      slug: data.slug as string,
      category: data.category as string,
      subcategory: data.subcategory as string || undefined,
      summary: data.summary as string,
      summaryAr: data.summaryAr as string || undefined,
      description: data.description as string,
      descriptionAr: data.descriptionAr as string || undefined,
      issuingAuthority: data.issuingAuthority as string,
      issuingAuthorityAr: data.issuingAuthorityAr as string || undefined,
      authorityWebsite: data.authorityWebsite as string || undefined,
      estimatedCost: data.estimatedCost as string || undefined,
      estimatedDuration: data.estimatedDuration as string || undefined,
      renewalRequired: data.renewalRequired === 'true' ? 1 : 0,
      renewalPeriod: data.renewalPeriod as string || undefined,
      priority: (data.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
      featured: data.featured === 'true' ? 1 : 0,
      displayOrder: data.displayOrder ? Number(data.displayOrder) : undefined,
      status: (data.status as 'draft' | 'published' | 'archived') || 'draft',
    });
  };

  const handleUpdate = (formData: FormData) => {
    if (!selectedRegulation) return;
    const data = Object.fromEntries(formData.entries());
    updateMutation.mutate({
      id: selectedRegulation.id,
      title: data.title as string || undefined,
      titleAr: data.titleAr as string || undefined,
      slug: data.slug as string || undefined,
      category: data.category as string || undefined,
      subcategory: data.subcategory as string || undefined,
      summary: data.summary as string || undefined,
      summaryAr: data.summaryAr as string || undefined,
      description: data.description as string || undefined,
      descriptionAr: data.descriptionAr as string || undefined,
      issuingAuthority: data.issuingAuthority as string || undefined,
      issuingAuthorityAr: data.issuingAuthorityAr as string || undefined,
      authorityWebsite: data.authorityWebsite as string || undefined,
      estimatedCost: data.estimatedCost as string || undefined,
      estimatedDuration: data.estimatedDuration as string || undefined,
      renewalRequired: data.renewalRequired === 'true' ? 1 : 0,
      renewalPeriod: data.renewalPeriod as string || undefined,
      priority: (data.priority as 'low' | 'medium' | 'high' | 'critical') || undefined,
      featured: data.featured === 'true' ? 1 : 0,
      displayOrder: data.displayOrder ? Number(data.displayOrder) : undefined,
      status: (data.status as 'draft' | 'published' | 'archived') || undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedRegulation) return;
    deleteMutation.mutate({ id: selectedRegulation.id });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Regulations Management</CardTitle>
          <CardDescription>
            Manage business regulations and compliance requirements in Oman
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search regulations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="business_registration">Business Registration</SelectItem>
                <SelectItem value="licensing">Licensing</SelectItem>
                <SelectItem value="tax">Tax</SelectItem>
                <SelectItem value="employment">Employment</SelectItem>
                <SelectItem value="health_safety">Health & Safety</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Regulation
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Authority</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regulations?.map((regulation: any) => (
                  <TableRow key={regulation.id}>
                    <TableCell className="font-medium">{regulation.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{regulation.category.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{regulation.issuingAuthority}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(regulation.priority) as any}>
                        {regulation.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={regulation.status === 'published' ? 'default' : 'secondary'}>
                        {regulation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRegulation(regulation);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRegulation(regulation);
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
            <DialogTitle>Create Regulation</DialogTitle>
            <DialogDescription>
              Add a new business regulation or compliance requirement
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
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleAr">Title (Arabic)</Label>
                  <Input id="titleAr" name="titleAr" dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" name="slug" placeholder="e.g., commercial-registration" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business_registration">Business Registration</SelectItem>
                      <SelectItem value="licensing">Licensing</SelectItem>
                      <SelectItem value="tax">Tax</SelectItem>
                      <SelectItem value="employment">Employment</SelectItem>
                      <SelectItem value="health_safety">Health & Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input id="subcategory" name="subcategory" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <Textarea id="summary" name="summary" rows={2} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summaryAr">Summary (Arabic)</Label>
                <Textarea id="summaryAr" name="summaryAr" rows={2} dir="rtl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" name="description" rows={4} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                <Textarea id="descriptionAr" name="descriptionAr" rows={4} dir="rtl" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issuingAuthority">Issuing Authority *</Label>
                  <Input id="issuingAuthority" name="issuingAuthority" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuingAuthorityAr">Issuing Authority (Arabic)</Label>
                  <Input id="issuingAuthorityAr" name="issuingAuthorityAr" dir="rtl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorityWebsite">Authority Website</Label>
                <Input id="authorityWebsite" name="authorityWebsite" type="url" placeholder="https://" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">Estimated Cost</Label>
                  <Input id="estimatedCost" name="estimatedCost" placeholder="e.g., OMR 200-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                  <Input id="estimatedDuration" name="estimatedDuration" placeholder="e.g., 2-4 weeks" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="renewalRequired">Renewal Required</Label>
                  <Select name="renewalRequired" defaultValue="false">
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
                  <Label htmlFor="renewalPeriod">Renewal Period</Label>
                  <Input id="renewalPeriod" name="renewalPeriod" placeholder="e.g., Annual" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="draft">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Regulation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Regulation</DialogTitle>
            <DialogDescription>
              Update the regulation information
            </DialogDescription>
          </DialogHeader>
          {selectedRegulation && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate(new FormData(e.currentTarget));
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input id="edit-title" name="title" defaultValue={selectedRegulation.title} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-titleAr">Title (Arabic)</Label>
                    <Input id="edit-titleAr" name="titleAr" defaultValue={selectedRegulation.titleAr || ''} dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-slug">Slug</Label>
                    <Input id="edit-slug" name="slug" defaultValue={selectedRegulation.slug} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select name="category" defaultValue={selectedRegulation.category}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business_registration">Business Registration</SelectItem>
                        <SelectItem value="licensing">Licensing</SelectItem>
                        <SelectItem value="tax">Tax</SelectItem>
                        <SelectItem value="employment">Employment</SelectItem>
                        <SelectItem value="health_safety">Health & Safety</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-summary">Summary</Label>
                  <Textarea id="edit-summary" name="summary" rows={2} defaultValue={selectedRegulation.summary} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea id="edit-description" name="description" rows={4} defaultValue={selectedRegulation.description} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-issuingAuthority">Issuing Authority</Label>
                    <Input id="edit-issuingAuthority" name="issuingAuthority" defaultValue={selectedRegulation.issuingAuthority} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-authorityWebsite">Authority Website</Label>
                    <Input id="edit-authorityWebsite" name="authorityWebsite" type="url" defaultValue={selectedRegulation.authorityWebsite || ''} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select name="priority" defaultValue={selectedRegulation.priority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-featured">Featured</Label>
                    <Select name="featured" defaultValue={selectedRegulation.featured ? 'true' : 'false'}>
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
                    <Select name="status" defaultValue={selectedRegulation.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
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
                  {updateMutation.isPending ? 'Updating...' : 'Update Regulation'}
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
            <DialogTitle>Delete Regulation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedRegulation?.title}"? This action cannot be undone.
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
