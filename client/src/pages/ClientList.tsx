import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, Plus, User, Phone, Mail, MapPin, Tag, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function ClientList() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "blocked">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Get user's office
  const { data: offices } = trpc.officeOwner.getMyOffices.useQuery();
  const officeId = offices?.[0]?.id;

  // Fetch clients
  const { data: clients, isLoading, refetch } = trpc.clientManagement.getClientsByOffice.useQuery(
    {
      officeId: officeId!,
      search: searchTerm || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      limit: 50,
      offset: 0,
    },
    { enabled: !!officeId }
  );

  // Get client stats
  const { data: stats } = trpc.clientManagement.getClientStats.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  // Create client mutation
  const createClientMutation = trpc.clientManagement.createClient.useMutation({
    onSuccess: () => {
      toast.success(t("clients.createSuccess"));
      setIsAddDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    notes: "",
  });

  const handleCreateClient = () => {
    if (!officeId) return;
    if (!newClient.name) {
      toast.error(t("clients.nameRequired"));
      return;
    }

    createClientMutation.mutate({
      officeId,
      ...newClient,
    });
  };

  if (!user || !officeId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{t("clients.noOffice")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("clients.title")}</h1>
        <p className="text-muted-foreground">{t("clients.subtitle")}</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("clients.totalClients")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("clients.activeClients")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("clients.totalRevenue")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parseFloat(stats.totalRevenue).toFixed(2)} OMR</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("clients.avgBookings")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parseFloat(stats.avgBookingsPerClient).toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("clients.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("clients.allStatus")}</SelectItem>
                <SelectItem value="active">{t("clients.active")}</SelectItem>
                <SelectItem value="inactive">{t("clients.inactive")}</SelectItem>
                <SelectItem value="blocked">{t("clients.blocked")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Add Client Button */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("clients.addClient")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("clients.addNewClient")}</DialogTitle>
                  <DialogDescription>{t("clients.addClientDescription")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t("clients.name")} *</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t("clients.phone")}</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">{t("clients.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">{t("clients.address")}</Label>
                    <Input
                      id="address"
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{t("clients.city")}</Label>
                      <Input
                        id="city"
                        value={newClient.city}
                        onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="region">{t("clients.region")}</Label>
                      <Input
                        id="region"
                        value={newClient.region}
                        onChange={(e) => setNewClient({ ...newClient, region: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">{t("clients.notes")}</Label>
                    <Textarea
                      id="notes"
                      value={newClient.notes}
                      onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={handleCreateClient} disabled={createClientMutation.isPending}>
                    {createClientMutation.isPending ? t("common.creating") : t("common.create")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </CardContent>
        </Card>
      ) : !clients || clients.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">{t("clients.noClients")}</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("clients.addFirstClient")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{client.name}</h3>
                        <Badge variant={client.status === "active" ? "default" : "secondary"}>
                          {t(`clients.${client.status}`)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-muted-foreground">
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{client.city}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{client.totalBookings} {t("clients.bookings")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{parseFloat(client.totalSpent).toFixed(2)} OMR</span>
                        </div>
                        {client.tags && Array.isArray(client.tags) && client.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            {client.tags.slice(0, 3).map((tag: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {client.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{client.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
