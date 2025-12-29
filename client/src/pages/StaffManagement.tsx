import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Edit, Trash2, Users, Circle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StaffManagement() {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "agent" as "owner" | "manager" | "agent",
  });

  // Get office staff - need to get user's office first
  const { data: userOffices } = trpc.officeOwner.getMyOffices.useQuery();
  const officeId = userOffices?.[0]?.id;
  
  const { data: staff, refetch } = trpc.chatAssignment.getOfficeStaff.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  // Mutations
  const addStaffMutation = trpc.chatAssignment.addStaff.useMutation();
  const updateStaffMutation = trpc.chatAssignment.updateStaff.useMutation();
  const removeStaffMutation = trpc.chatAssignment.removeStaff.useMutation();

  const handleAddStaff = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!officeId) {
      toast.error("No office found");
      return;
    }

    try {
      // Note: This requires userId, but we need to create user first or get existing user
      // For now, this is a simplified version
      await addStaffMutation.mutateAsync({
        officeId,
        userId: 1, // TODO: Implement user lookup/creation
        role: formData.role,
      });

      toast.success("Staff member added successfully");
      setIsAddDialogOpen(false);
      setFormData({ name: "", email: "", role: "agent" });
      refetch();
    } catch (error) {
      toast.error("Failed to add staff member");
      console.error(error);
    }
  };

  const handleEditStaff = async () => {
    if (!selectedStaff || !formData.role) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await updateStaffMutation.mutateAsync({
        staffId: selectedStaff.id,
        role: formData.role,
      });

      toast.success("Staff member updated successfully");
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      setFormData({ name: "", email: "", role: "agent" });
      refetch();
    } catch (error) {
      toast.error("Failed to update staff member");
      console.error(error);
    }
  };

  const handleRemoveStaff = async (staffId: number) => {
    if (!confirm("Are you sure you want to remove this staff member?")) {
      return;
    }

    try {
      await removeStaffMutation.mutateAsync({ staffId });
      toast.success("Staff member removed successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to remove staff member");
      console.error(error);
    }
  };

  const openEditDialog = (staffMember: any) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.userName || "",
      email: staffMember.userEmail || "",
      role: staffMember.role,
    });
    setIsEditDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "manager":
        return "secondary";
      case "agent":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t("pages.staffManagement")}</h1>
            <p className="text-muted-foreground">{t("pages.staffManagementDesc")}</p>
          </div>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          {staff && staff.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.userName || "N/A"}</TableCell>
                    <TableCell>{member.userEmail || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Circle 
                          className={`h-2 w-2 fill-current ${
                            member.availabilityStatus === 'online' ? 'text-green-500' :
                            member.availabilityStatus === 'busy' ? 'text-yellow-500' :
                            'text-gray-400'
                          }`}
                        />
                        <span className="text-sm capitalize">{member.availabilityStatus || 'offline'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.isActive ? "default" : "secondary"}>
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveStaff(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">{t("empty.noStaffYet")}</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                <UserPlus className="h-4 w-4 mr-2" />
                {t("actions.addYourFirstStaffMember")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Add a new staff member to your office team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter staff member name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>Add Staff Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff member role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                disabled
                placeholder="Name (read-only)"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                disabled
                placeholder="Email (read-only)"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStaff}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
