import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CannedResponses() {
  const { t } = useLanguage();
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    shortcut: "",
    category: "general" as "greeting" | "faq" | "closing" | "pricing" | "hours" | "services" | "general",
  });

  const { data: offices } = trpc.officeOwner.getMyOffices.useQuery();
  const { data: responses, refetch } = trpc.cannedResponses.getByOffice.useQuery(
    { officeId: selectedOfficeId! },
    { enabled: !!selectedOfficeId }
  );

  const createMutation = trpc.cannedResponses.create.useMutation({
    onSuccess: () => {
      toast.success("Canned response created");
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.cannedResponses.update.useMutation({
    onSuccess: () => {
      toast.success("Canned response updated");
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.cannedResponses.delete.useMutation({
    onSuccess: () => {
      toast.success("Canned response deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", shortcut: "", category: "general" });
    setEditingResponse(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficeId) return;

    if (editingResponse) {
      updateMutation.mutate({
        id: editingResponse.id,
        ...formData,
      });
    } else {
      createMutation.mutate({
        officeId: selectedOfficeId,
        ...formData,
      });
    }
  };

  const handleEdit = (response: any) => {
    setEditingResponse(response);
    setFormData({
      title: response.title,
      content: response.content,
      shortcut: response.shortcut || "",
      category: response.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this canned response?")) {
      deleteMutation.mutate({ id });
    }
  };

  const categoryColors: Record<string, string> = {
    greeting: "bg-yellow-100 text-yellow-800",
    faq: "bg-cyan-100 text-cyan-800",
    closing: "bg-pink-100 text-pink-800",
    pricing: "bg-blue-100 text-blue-800",
    hours: "bg-green-100 text-green-800",
    services: "bg-purple-100 text-purple-800",
    general: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("pages.cannedResponses")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("pages.cannedResponsesDesc")}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              {t("actions.newResponse")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingResponse ? "Edit" : "Create"} Canned Response
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Office Hours"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greeting">Greeting</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="closing">Closing</SelectItem>
                    <SelectItem value="pricing">Pricing</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Shortcut (optional)</label>
                <Input
                  value={formData.shortcut || ''}
                  onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                  placeholder="e.g., /hello or /hours"
                />
                <p className="text-xs text-muted-foreground mt-1">Type this shortcut in chat to quickly insert this template</p>
              </div>

              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the response message..."
                  rows={5}
                  required
                />
                <div className="mt-2 p-3 bg-muted/50 rounded-md border">
                  <p className="text-xs font-medium mb-2">Available Variables:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <code className="bg-background px-1.5 py-0.5 rounded">{`{{customer_name}}`}</code>
                      <span className="text-muted-foreground ml-1">Customer's name</span>
                    </div>
                    <div>
                      <code className="bg-background px-1.5 py-0.5 rounded">{`{{office_name}}`}</code>
                      <span className="text-muted-foreground ml-1">Your office name</span>
                    </div>
                    <div>
                      <code className="bg-background px-1.5 py-0.5 rounded">{`{{staff_name}}`}</code>
                      <span className="text-muted-foreground ml-1">Your name</span>
                    </div>
                    <div>
                      <code className="bg-background px-1.5 py-0.5 rounded">{`{{date}}`}</code>
                      <span className="text-muted-foreground ml-1">Current date</span>
                    </div>
                    <div>
                      <code className="bg-background px-1.5 py-0.5 rounded">{`{{time}}`}</code>
                      <span className="text-muted-foreground ml-1">Current time</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Variables will be automatically replaced when you insert the template</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingResponse ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Office Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <label className="text-sm font-medium mb-2 block">{t("cannedResponses.selectOffice")}</label>
          <Select
            value={selectedOfficeId?.toString()}
            onValueChange={(value) => setSelectedOfficeId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("cannedResponses.chooseOffice")} />
            </SelectTrigger>
            <SelectContent>
              {offices?.map((office: any) => (
                <SelectItem key={office.id} value={office.id.toString()}>
                  {office.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Responses List */}
      {selectedOfficeId && (
        <div className="grid gap-4 md:grid-cols-2">
          {responses?.map((response) => (
            <Card key={response.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {response.title}
                    </CardTitle>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${categoryColors[response.category]}`}>
                      {response.category}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(response)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(response.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {response.content}
                </p>
              </CardContent>
            </Card>
          ))}

          {responses?.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No canned responses yet. Create your first one to get started!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
