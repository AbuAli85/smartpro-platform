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
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function SuccessStoriesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const { data: stories, isLoading, refetch } = trpc.contentManagement.getSuccessStories.useQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchTerm || undefined,
  });

  const createMutation = trpc.contentManagement.createSuccessStory.useMutation({
    onSuccess: () => {
      toast.success('Success story created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create success story: ${error.message}`);
    },
  });

  const updateMutation = trpc.contentManagement.updateSuccessStory.useMutation({
    onSuccess: () => {
      toast.success('Success story updated successfully');
      setIsEditDialogOpen(false);
      setSelectedStory(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update success story: ${error.message}`);
    },
  });

  const deleteMutation = trpc.contentManagement.deleteSuccessStory.useMutation({
    onSuccess: () => {
      toast.success('Success story deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedStory(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete success story: ${error.message}`);
    },
  });

  const handleCreate = (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    createMutation.mutate({
      businessName: data.businessName as string,
      businessNameAr: data.businessNameAr as string || undefined,
      ownerName: data.ownerName as string,
      ownerNameAr: data.ownerNameAr as string || undefined,
      governorate: data.governorate as string,
      wilayat: data.wilayat as string || undefined,
      industry: data.industry as string,
      serviceType: data.serviceType as string || undefined,
      yearEstablished: data.yearEstablished ? Number(data.yearEstablished) : undefined,
      challenge: data.challenge as string,
      challengeAr: data.challengeAr as string || undefined,
      solution: data.solution as string,
      solutionAr: data.solutionAr as string || undefined,
      results: data.results as string,
      resultsAr: data.resultsAr as string || undefined,
      testimonial: data.testimonial as string || undefined,
      testimonialAr: data.testimonialAr as string || undefined,
      jobsCreated: data.jobsCreated ? Number(data.jobsCreated) : undefined,
      revenueGrowth: data.revenueGrowth as string || undefined,
      customersServed: data.customersServed ? Number(data.customersServed) : undefined,
      smartproImpact: data.smartproImpact as string || undefined,
      smartproImpactAr: data.smartproImpactAr as string || undefined,
      featured: data.featured === 'true' ? 1 : 0,
      displayOrder: data.displayOrder ? Number(data.displayOrder) : undefined,
      status: (data.status as 'draft' | 'published' | 'archived') || 'draft',
    });
  };

  const handleUpdate = (formData: FormData) => {
    if (!selectedStory) return;
    const data = Object.fromEntries(formData.entries());
    updateMutation.mutate({
      id: selectedStory.id,
      businessName: data.businessName as string || undefined,
      businessNameAr: data.businessNameAr as string || undefined,
      ownerName: data.ownerName as string || undefined,
      ownerNameAr: data.ownerNameAr as string || undefined,
      governorate: data.governorate as string || undefined,
      wilayat: data.wilayat as string || undefined,
      industry: data.industry as string || undefined,
      serviceType: data.serviceType as string || undefined,
      yearEstablished: data.yearEstablished ? Number(data.yearEstablished) : undefined,
      challenge: data.challenge as string || undefined,
      challengeAr: data.challengeAr as string || undefined,
      solution: data.solution as string || undefined,
      solutionAr: data.solutionAr as string || undefined,
      results: data.results as string || undefined,
      resultsAr: data.resultsAr as string || undefined,
      testimonial: data.testimonial as string || undefined,
      testimonialAr: data.testimonialAr as string || undefined,
      jobsCreated: data.jobsCreated ? Number(data.jobsCreated) : undefined,
      revenueGrowth: data.revenueGrowth as string || undefined,
      customersServed: data.customersServed ? Number(data.customersServed) : undefined,
      smartproImpact: data.smartproImpact as string || undefined,
      smartproImpactAr: data.smartproImpactAr as string || undefined,
      featured: data.featured === 'true' ? 1 : 0,
      displayOrder: data.displayOrder ? Number(data.displayOrder) : undefined,
      status: (data.status as 'draft' | 'published' | 'archived') || undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedStory) return;
    deleteMutation.mutate({ id: selectedStory.id });
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Success Stories Management</CardTitle>
          <CardDescription>
            Manage Omani business success stories showcasing SmartPro's impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Story
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Governorate</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories?.map((story: any) => (
                  <TableRow key={story.id}>
                    <TableCell className="font-medium">{story.businessName}</TableCell>
                    <TableCell>{story.ownerName}</TableCell>
                    <TableCell>{story.governorate}</TableCell>
                    <TableCell>{story.industry}</TableCell>
                    <TableCell>
                      <Badge variant={story.status === 'published' ? 'default' : 'secondary'}>
                        {story.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {story.featured ? (
                        <Badge variant="outline">Featured</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStory(story);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStory(story);
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
            <DialogTitle>Create Success Story</DialogTitle>
            <DialogDescription>
              Add a new success story showcasing Omani business achievements
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
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input id="businessName" name="businessName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessNameAr">Business Name (Arabic)</Label>
                  <Input id="businessNameAr" name="businessNameAr" dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input id="ownerName" name="ownerName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerNameAr">Owner Name (Arabic)</Label>
                  <Input id="ownerNameAr" name="ownerNameAr" dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="governorate">Governorate *</Label>
                  <Input id="governorate" name="governorate" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wilayat">Wilayat</Label>
                  <Input id="wilayat" name="wilayat" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearEstablished">Year Established</Label>
                  <Input id="yearEstablished" name="yearEstablished" type="number" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input id="industry" name="industry" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Input id="serviceType" name="serviceType" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenge">Challenge *</Label>
                <Textarea id="challenge" name="challenge" rows={3} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="challengeAr">Challenge (Arabic)</Label>
                <Textarea id="challengeAr" name="challengeAr" rows={3} dir="rtl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">Solution *</Label>
                <Textarea id="solution" name="solution" rows={3} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solutionAr">Solution (Arabic)</Label>
                <Textarea id="solutionAr" name="solutionAr" rows={3} dir="rtl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="results">Results *</Label>
                <Textarea id="results" name="results" rows={3} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resultsAr">Results (Arabic)</Label>
                <Textarea id="resultsAr" name="resultsAr" rows={3} dir="rtl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testimonial">Testimonial</Label>
                <Textarea id="testimonial" name="testimonial" rows={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testimonialAr">Testimonial (Arabic)</Label>
                <Textarea id="testimonialAr" name="testimonialAr" rows={2} dir="rtl" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobsCreated">Jobs Created</Label>
                  <Input id="jobsCreated" name="jobsCreated" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenueGrowth">Revenue Growth</Label>
                  <Input id="revenueGrowth" name="revenueGrowth" placeholder="e.g., 200%" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customersServed">Customers Served</Label>
                  <Input id="customersServed" name="customersServed" type="number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smartproImpact">SmartPro Impact</Label>
                <Textarea id="smartproImpact" name="smartproImpact" rows={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smartproImpactAr">SmartPro Impact (Arabic)</Label>
                <Textarea id="smartproImpactAr" name="smartproImpactAr" rows={2} dir="rtl" />
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Story'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Similar structure to Create Dialog but with defaultValues */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Success Story</DialogTitle>
            <DialogDescription>
              Update the success story information
            </DialogDescription>
          </DialogHeader>
          {selectedStory && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate(new FormData(e.currentTarget));
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-businessName">Business Name</Label>
                    <Input id="edit-businessName" name="businessName" defaultValue={selectedStory.businessName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-businessNameAr">Business Name (Arabic)</Label>
                    <Input id="edit-businessNameAr" name="businessNameAr" defaultValue={selectedStory.businessNameAr || ''} dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-ownerName">Owner Name</Label>
                    <Input id="edit-ownerName" name="ownerName" defaultValue={selectedStory.ownerName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-ownerNameAr">Owner Name (Arabic)</Label>
                    <Input id="edit-ownerNameAr" name="ownerNameAr" defaultValue={selectedStory.ownerNameAr || ''} dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-governorate">Governorate</Label>
                    <Input id="edit-governorate" name="governorate" defaultValue={selectedStory.governorate} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-wilayat">Wilayat</Label>
                    <Input id="edit-wilayat" name="wilayat" defaultValue={selectedStory.wilayat || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-yearEstablished">Year Established</Label>
                    <Input id="edit-yearEstablished" name="yearEstablished" type="number" defaultValue={selectedStory.yearEstablished || ''} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-industry">Industry</Label>
                    <Input id="edit-industry" name="industry" defaultValue={selectedStory.industry} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-serviceType">Service Type</Label>
                    <Input id="edit-serviceType" name="serviceType" defaultValue={selectedStory.serviceType || ''} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-challenge">Challenge</Label>
                  <Textarea id="edit-challenge" name="challenge" rows={3} defaultValue={selectedStory.challenge} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-solution">Solution</Label>
                  <Textarea id="edit-solution" name="solution" rows={3} defaultValue={selectedStory.solution} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-results">Results</Label>
                  <Textarea id="edit-results" name="results" rows={3} defaultValue={selectedStory.results} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-featured">Featured</Label>
                    <Select name="featured" defaultValue={selectedStory.featured ? 'true' : 'false'}>
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
                    <Label htmlFor="edit-displayOrder">Display Order</Label>
                    <Input id="edit-displayOrder" name="displayOrder" type="number" defaultValue={selectedStory.displayOrder || 0} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select name="status" defaultValue={selectedStory.status}>
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
                  {updateMutation.isPending ? 'Updating...' : 'Update Story'}
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
            <DialogTitle>Delete Success Story</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedStory?.businessName}"? This action cannot be undone.
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
