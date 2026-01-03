import { useState, useMemo } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Search, Shield, User, Building2, Briefcase, Users, Crown, 
  MoreVertical, Download, Filter, Calendar, Activity, 
  CheckCircle2, XCircle, AlertCircle, TrendingUp, UserPlus,
  ChevronLeft, ChevronRight, ArrowUpDown, Eye, Ban, RefreshCw
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

type SortField = "name" | "email" | "role" | "createdAt" | "lastSignedIn";
type SortOrder = "asc" | "desc";

function UserManagementPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [mfaFilter, setMfaFilter] = useState<string>("all");

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

  // Advanced filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users.filter((user: any) => {
      // Search filter
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.openId.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Role filter
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all") {
        const userDate = new Date(user.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - userDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case "today":
            matchesDate = daysDiff === 0;
            break;
          case "week":
            matchesDate = daysDiff <= 7;
            break;
          case "month":
            matchesDate = daysDiff <= 30;
            break;
          case "year":
            matchesDate = daysDiff <= 365;
            break;
        }
      }

      // MFA filter
      let matchesMFA = true;
      if (mfaFilter !== "all") {
        matchesMFA = mfaFilter === "enabled" ? user.mfaEnabled : !user.mfaEnabled;
      }
      
      return matchesSearch && matchesRole && matchesDate && matchesMFA;
    });

    // Sorting
    filtered.sort((a: any, b: any) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      // Convert to lowercase for string comparison
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, roleFilter, dateFilter, mfaFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Statistics
  const stats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, active: 0, mfaEnabled: 0 };
    
    return {
      total: users.length,
      admins: users.filter((u: any) => u.role === "admin").length,
      active: users.filter((u: any) => {
        if (!u.lastSignedIn) return false;
        const lastLogin = new Date(u.lastSignedIn);
        const daysSinceLogin = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceLogin <= 30;
      }).length,
      mfaEnabled: users.filter((u: any) => u.mfaEnabled).length,
    };
  }, [users]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedUsers.map((u: any) => u.id));
      setSelectedUsers(allIds);
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const exportToCSV = () => {
    if (!filteredAndSortedUsers.length) {
      toast.error("No data to export");
      return;
    }

    const headers = ["ID", "Name", "Email", "Phone", "Role", "Joined", "Last Login", "MFA Enabled"];
    const rows = filteredAndSortedUsers.map((user: any) => [
      user.id,
      user.name || "",
      user.email || "",
      user.phone || "",
      ROLE_LABELS[user.role as keyof typeof ROLE_LABELS],
      new Date(user.createdAt).toLocaleDateString(),
      user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString() : "Never",
      user.mfaEnabled ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Users exported successfully");
  };

  const getActivityStatus = (user: any) => {
    if (!user.lastSignedIn) return { label: "Never", color: "text-gray-500", icon: XCircle };
    
    const lastLogin = new Date(user.lastSignedIn);
    const daysSinceLogin = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLogin === 0) return { label: "Today", color: "text-green-600", icon: CheckCircle2 };
    if (daysSinceLogin <= 7) return { label: "This week", color: "text-green-500", icon: CheckCircle2 };
    if (daysSinceLogin <= 30) return { label: "This month", color: "text-yellow-600", icon: AlertCircle };
    return { label: "Inactive", color: "text-red-500", icon: XCircle };
  };

  return (
    <div className="container py-8 max-w-[1600px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("admin.userManagement")}</h1>
        <p className="text-muted-foreground">
          {t("admin.userManagementSubtitle")}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administrators</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Crown className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active (30d)</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">MFA Enabled</p>
                <p className="text-2xl font-bold">{stats.mfaEnabled}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("admin.allUsers")}</CardTitle>
              <CardDescription>
                {filteredAndSortedUsers.length} users found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Advanced Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sanad_owner">Sanad Owner</SelectItem>
                  <SelectItem value="sanad_staff">Sanad Staff</SelectItem>
                  <SelectItem value="sme_owner">SME Owner</SelectItem>
                  <SelectItem value="gig_worker">Gig Worker</SelectItem>
                  <SelectItem value="government_official">Government Official</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={(val) => { setDateFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Registration Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={mfaFilter} onValueChange={(val) => { setMfaFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="MFA Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All MFA Status</SelectItem>
                  <SelectItem value="enabled">MFA Enabled</SelectItem>
                  <SelectItem value="disabled">MFA Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.size > 0 && (
              <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedUsers.size} user{selectedUsers.size > 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Bulk Update Role
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedUsers(new Set())}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">{t("admin.loadingUsers")}</p>
            </div>
          ) : filteredAndSortedUsers.length > 0 ? (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("name")}
                          className="hover:bg-transparent"
                        >
                          User
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("email")}
                          className="hover:bg-transparent"
                        >
                          Contact
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("role")}
                          className="hover:bg-transparent"
                        >
                          Role
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Security</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("lastSignedIn")}
                          className="hover:bg-transparent"
                        >
                          Activity
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("createdAt")}
                          className="hover:bg-transparent"
                        >
                          Joined
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user: any) => {
                      const RoleIcon = ROLE_ICONS[user.role as keyof typeof ROLE_ICONS];
                      const activityStatus = getActivityStatus(user);
                      const ActivityIcon = activityStatus.icon;

                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.has(user.id)}
                              onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {user.avatarUrl ? (
                                  <img src={user.avatarUrl} alt={user.name || "User"} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <User className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium truncate">{user.name || "Unnamed User"}</div>
                                <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm truncate">{user.email || "No email"}</div>
                              {user.phone && (
                                <div className="text-xs text-muted-foreground">{user.phone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.mfaEnabled ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                                  <Shield className="h-3 w-3 mr-1" />
                                  MFA
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700">
                                  No MFA
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ActivityIcon className={`h-4 w-4 ${activityStatus.color}`} />
                              <span className={`text-sm ${activityStatus.color}`}>
                                {activityStatus.label}
                              </span>
                            </div>
                            {user.lastSignedIn && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(user.lastSignedIn).toLocaleDateString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleRoleChange(user)}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Activity className="h-4 w-4 mr-2" />
                                  View Activity
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
                  </span>
                  <Select value={pageSize.toString()} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="25">25 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                      <SelectItem value="100">100 / page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1">No users found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setDateFilter("all");
                setMfaFilter("all");
                setCurrentPage(1);
              }}>
                Clear Filters
              </Button>
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
