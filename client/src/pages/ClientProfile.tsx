import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, DollarSign, 
  FileText, Plus, Download, Trash2, AlertCircle, Tag, Edit, Save
} from "lucide-react";
import { format } from "date-fns";

export default function ClientProfile() {
  const [, params] = useRoute("/clients/:id");
  const clientId = params?.id ? parseInt(params.id) : null;
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);

  // Fetch client details
  const { data: client, isLoading, refetch } = trpc.clientManagement.getClientDetails.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId }
  );

  // Edit state
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    notes: "",
  });

  // Update client mutation
  const updateClientMutation = trpc.clientManagement.updateClient.useMutation({
    onSuccess: () => {
      toast.success(t("clients.updateSuccess"));
      setIsEditMode(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Add note mutation
  const [newNote, setNewNote] = useState({ note: "", isImportant: false });
  const addNoteMutation = trpc.clientManagement.addClientNote.useMutation({
    onSuccess: () => {
      toast.success(t("clients.noteAdded"));
      setIsAddNoteOpen(false);
      setNewNote({ note: "", isImportant: false });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete note mutation
  const deleteNoteMutation = trpc.clientManagement.deleteClientNote.useMutation({
    onSuccess: () => {
      toast.success(t("clients.noteDeleted"));
      refetch();
    },
  });

  // Document upload state
  const [newDocument, setNewDocument] = useState({
    documentType: "",
    documentName: "",
    documentUrl: "",
    notes: "",
  });

  // Add document mutation
  const addDocumentMutation = trpc.clientManagement.addClientDocument.useMutation({
    onSuccess: () => {
      toast.success(t("clients.documentAdded"));
      setIsAddDocumentOpen(false);
      setNewDocument({ documentType: "", documentName: "", documentUrl: "", notes: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = trpc.clientManagement.deleteClientDocument.useMutation({
    onSuccess: () => {
      toast.success(t("clients.documentDeleted"));
      refetch();
    },
  });

  const handleSaveEdit = () => {
    if (!clientId) return;
    updateClientMutation.mutate({
      clientId,
      ...editData,
    });
  };

  const handleAddNote = () => {
    if (!clientId || !newNote.note) return;
    addNoteMutation.mutate({
      clientId,
      ...newNote,
    });
  };

  const handleAddDocument = () => {
    if (!clientId || !newDocument.documentName || !newDocument.documentUrl) {
      toast.error(t("clients.documentFieldsRequired"));
      return;
    }
    addDocumentMutation.mutate({
      clientId,
      ...newDocument,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t("clients.notFound")}</p>
            <Link href="/clients">
              <Button className="mt-4">{t("clients.backToList")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initialize edit data when entering edit mode
  if (isEditMode && !editData.name) {
    setEditData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      city: client.city || "",
      region: client.region || "",
      notes: "",
    });
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("clients.backToList")}
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{client.name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant={client.status === "active" ? "default" : "secondary"}>
                {t(`clients.${client.status}`)}
              </Badge>
              {client.tags && Array.isArray(client.tags) && client.tags.length > 0 && (
                <div className="flex gap-2">
                  {client.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!isEditMode ? (
            <Button onClick={() => setIsEditMode(true)}>
              <Edit className="h-4 w-4 mr-2" />
              {t("common.edit")}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateClientMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateClientMutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("clients.totalBookings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("clients.totalSpent")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(client.totalSpent).toFixed(2)} OMR</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("clients.memberSince")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.createdAt ? format(new Date(client.createdAt), "MMM yyyy") : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">{t("clients.overview")}</TabsTrigger>
          <TabsTrigger value="history">{t("clients.history")}</TabsTrigger>
          <TabsTrigger value="documents">{t("clients.documents")}</TabsTrigger>
          <TabsTrigger value="notes">{t("clients.notes")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>{t("clients.contactInformation")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditMode ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name">{t("clients.name")}</Label>
                      <Input
                        id="edit-name"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">{t("clients.phone")}</Label>
                      <Input
                        id="edit-phone"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-email">{t("clients.email")}</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-address">{t("clients.address")}</Label>
                    <Input
                      id="edit-address"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-city">{t("clients.city")}</Label>
                      <Input
                        id="edit-city"
                        value={editData.city}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-region">{t("clients.region")}</Label>
                      <Input
                        id="edit-region"
                        value={editData.region}
                        onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-notes">{t("clients.notes")}</Label>
                    <Textarea
                      id="edit-notes"
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {client.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("clients.email")}</p>
                        <p className="font-medium">{client.email}</p>
                      </div>
                    </div>
                  )}

                  {client.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("clients.phone")}</p>
                        <p className="font-medium">{client.phone}</p>
                      </div>
                    </div>
                  )}

                  {client.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t("clients.address")}</p>
                        <p className="font-medium">{client.address}</p>
                        {(client.city || client.region) && (
                          <p className="text-sm text-muted-foreground">
                            {[client.city, client.region].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes section removed - notes are shown in separate tab */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{t("clients.bookingHistory")}</CardTitle>
              <CardDescription>{t("clients.bookingHistoryDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {client.history?.bookings && client.history.bookings.length > 0 ? (
                <div className="space-y-4">
                  {client.history.bookings.map((booking: any) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{booking.serviceDescription || t("clients.booking")}</h4>
                          <p className="text-sm text-muted-foreground">
                            {booking.createdAt ? format(new Date(booking.createdAt), "PPP") : "-"}
                          </p>
                        </div>
                        <Badge>{booking.status}</Badge>
                      </div>
                      {booking.totalPrice && (
                        <p className="text-sm font-medium text-green-600">
                          {parseFloat(booking.totalPrice).toFixed(2)} OMR
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t("clients.noBookings")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("clients.documents")}</CardTitle>
                  <CardDescription>{t("clients.documentsDescription")}</CardDescription>
                </div>
                <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("clients.addDocument")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("clients.addNewDocument")}</DialogTitle>
                      <DialogDescription>{t("clients.addDocumentDescription")}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="doc-name">{t("clients.documentName")} *</Label>
                        <Input
                          id="doc-name"
                          value={newDocument.documentName}
                          onChange={(e) => setNewDocument({ ...newDocument, documentName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="doc-type">{t("clients.documentType")}</Label>
                        <Input
                          id="doc-type"
                          value={newDocument.documentType}
                          onChange={(e) => setNewDocument({ ...newDocument, documentType: e.target.value })}
                          placeholder={t("clients.documentTypePlaceholder")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="doc-url">{t("clients.documentUrl")} *</Label>
                        <Input
                          id="doc-url"
                          value={newDocument.documentUrl}
                          onChange={(e) => setNewDocument({ ...newDocument, documentUrl: e.target.value })}
                          placeholder="https://..."
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("clients.uploadFileFirst")}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="doc-notes">{t("clients.notes")}</Label>
                        <Textarea
                          id="doc-notes"
                          value={newDocument.notes}
                          onChange={(e) => setNewDocument({ ...newDocument, notes: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDocumentOpen(false)}>
                        {t("common.cancel")}
                      </Button>
                      <Button onClick={handleAddDocument} disabled={addDocumentMutation.isPending}>
                        {addDocumentMutation.isPending ? t("common.adding") : t("common.add")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {client.documents && client.documents.length > 0 ? (
                <div className="space-y-3">
                  {client.documents.map((doc: any) => (
                    <div key={doc.id} className="border rounded-lg p-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{doc.documentName}</h4>
                        {doc.documentType && (
                          <p className="text-sm text-muted-foreground">{doc.documentType}</p>
                        )}
                        {doc.createdAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(doc.createdAt), "PPP")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(t("clients.confirmDeleteDocument"))) {
                              deleteDocumentMutation.mutate({ documentId: doc.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">{t("clients.noDocuments")}</p>
                  <Button onClick={() => setIsAddDocumentOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("clients.addFirstDocument")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("clients.internalNotes")}</CardTitle>
                  <CardDescription>{t("clients.notesDescription")}</CardDescription>
                </div>
                <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("clients.addNote")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("clients.addNewNote")}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="note">{t("clients.note")}</Label>
                        <Textarea
                          id="note"
                          value={newNote.note}
                          onChange={(e) => setNewNote({ ...newNote, note: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="important"
                          checked={newNote.isImportant}
                          onChange={(e) => setNewNote({ ...newNote, isImportant: e.target.checked })}
                        />
                        <Label htmlFor="important">{t("clients.markAsImportant")}</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>
                        {t("common.cancel")}
                      </Button>
                      <Button onClick={handleAddNote} disabled={addNoteMutation.isPending}>
                        {addNoteMutation.isPending ? t("common.adding") : t("common.add")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {client.notes && client.notes.length > 0 ? (
                <div className="space-y-3">
                  {client.notes.map((note: any) => (
                    <div
                      key={note.id}
                      className={`border rounded-lg p-4 ${note.isImportant ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap">{note.note}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(t("clients.confirmDeleteNote"))) {
                              deleteNoteMutation.mutate({ noteId: note.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{note.createdByName}</span>
                        <span>•</span>
                        <span>{note.createdAt ? format(new Date(note.createdAt), "PPP") : "-"}</span>
                        {note.isImportant && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {t("clients.important")}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">{t("clients.noNotes")}</p>
                  <Button onClick={() => setIsAddNoteOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("clients.addFirstNote")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
