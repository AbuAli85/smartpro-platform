import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Search, Shield, User, Building2, Briefcase, Users, Crown } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useLanguage } from "@/contexts/LanguageContext";

const ROLE_ICONS = {
  user: User,
  admin: Crown,
  sanad_owner: Building2,
  sanad_staff: Users,
  sme_owner: Briefcase,
  gig_worker: User,
  government_official: Shield,
};

const ROLE_COLORS = {
  user: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  sanad_owner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  sanad_staff: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  sme_owner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  gig_worker: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  government_official: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const ROLE_LABELS = {
  user: "User",
  admin: "Admin",
  sanad_owner: "Sanad Owner",
  sanad_staff: "Sanad Staff",
  sme_owner: "SME Owner",
  gig_worker: "Gig Worker",
  government_official: "Government Official",
};

function UserManagementPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");

  const { data: users, isLoading, refetch } = trpc.admin.getAllUsers.useQuery();
  
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to update role", {
        description: error.message,
      });
    },
  });

  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.openId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsDialogOpen(true);
  };

  const handleUpdateRole = () => {
    if (!selectedUser || !newRole) return;
    
    updateRoleMutation.mutate({
      userId: selectedUser.id,
      role: newRole as any,
    });
  };

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("admin.userManagement")}</h1>
        <p className="text-muted-foreground">
          {t("admin.userManagementSubtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.allUsers")}</CardTitle>
          <CardDescription>
            {t("admin.allUsersDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.searchUsers")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allRoles")}</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sanad_owner">Sanad Owner</SelectItem>
                <SelectItem value="sanad_staff">Sanad Staff</SelectItem>
                <SelectItem value="sme_owner">SME Owner</SelectItem>
                <SelectItem value="gig_worker">Gig Worker</SelectItem>
                <SelectItem value="government_official">Government Official</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("admin.loadingUsers")}
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any) => {
                    const RoleIcon = ROLE_ICONS[user.role as keyof typeof ROLE_ICONS];
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name || "User"} className="w-10 h-10 rounded-full" />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{user.name || "Unnamed User"}</div>
                              <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.email || "No email"}</div>
                          {user.phone && (
                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRoleChange(user)}
                          >
                            Change Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.name || "this user"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <div>
                <Badge className={ROLE_COLORS[selectedUser?.role as keyof typeof ROLE_COLORS]}>
                  {ROLE_LABELS[selectedUser?.role as keyof typeof ROLE_LABELS]}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newRole">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger id="newRole">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sanad_owner">Sanad Owner</SelectItem>
                  <SelectItem value="sanad_staff">Sanad Staff</SelectItem>
                  <SelectItem value="sme_owner">SME Owner</SelectItem>
                  <SelectItem value="gig_worker">Gig Worker</SelectItem>
                  <SelectItem value="government_official">Government Official</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Changing a user's role will immediately affect their permissions and access to features.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole}
              disabled={updateRoleMutation.isPending || newRole === selectedUser?.role}
            >
              {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UserManagement() {
  return (
    <ProtectedRoute requirePermission="canManageUsers">
      <UserManagementPage />
    </ProtectedRoute>
  );
}
