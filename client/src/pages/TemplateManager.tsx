import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Eye, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_CATEGORIES = [
  "Business Registration",
  "Tax Documents",
  "Legal Contracts",
  "Financial Reports",
  "Employment Documents",
  "Compliance Forms",
  "Other",
];

export default function TemplateManager() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Form state
  const [templateName, setTemplateName] = useState("");
  const [templateNameAr, setTemplateNameAr] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  // Fetch templates (assuming user is office owner)
  const { data: templates, isLoading, refetch } = trpc.template.getByOffice.useQuery(
    { officeId: 1 }, // TODO: Get actual office ID from context
    { enabled: true }
  );

  const createTemplateMutation = trpc.template.create.useMutation({
    onSuccess: () => {
      toast.success("Template uploaded successfully");
      setIsUploadDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteTemplateMutation = trpc.template.delete.useMutation({
    onSuccess: () => {
      toast.success("Template deleted successfully");
      refetch();
    },
  });

  const resetForm = () => {
    setTemplateName("");
    setTemplateNameAr("");
    setCategory("");
    setDescription("");
    setPrice("");
    setIsPremium(false);
    setSelectedFile(null);
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/html",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF, DOC, DOCX, or HTML files");
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!templateName || !category || !selectedFile) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(",")[1];
      
      await createTemplateMutation.mutateAsync({
        templateName,
        templateNameAr: templateNameAr || undefined,
        category,
        description: description || undefined,
        templateContent: "", // Empty for file-based templates
        price: price || undefined,
        isPremium,
        officeId: 1, // TODO: Get actual office ID
        fileData: base64,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
      });
    };
    
    reader.readAsDataURL(selectedFile);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      await deleteTemplateMutation.mutateAsync({ id });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Document Templates</h1>
          <p className="text-muted-foreground mt-2">
            Manage your document templates and track downloads
          </p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Template</DialogTitle>
              <DialogDescription>
                Add a new document template for your office
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* File Upload */}
              <div>
                <Label>Template File *</Label>
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop your file here, or
                      </p>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.html"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        className="max-w-xs mx-auto"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Template Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName">Template Name (English) *</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Business Registration Form"
                  />
                </div>
                <div>
                  <Label htmlFor="templateNameAr">Template Name (Arabic)</Label>
                  <Input
                    id="templateNameAr"
                    value={templateNameAr}
                    onChange={(e) => setTemplateNameAr(e.target.value)}
                    placeholder="نموذج تسجيل الأعمال"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the template..."
                  rows={3}
                />
              </div>

              {/* Price & Premium */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (OMR)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Premium Template</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={createTemplateMutation.isPending}>
                {createTemplateMutation.isPending ? "Uploading..." : "Upload Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Templates</CardTitle>
          <CardDescription>
            {templates?.length || 0} templates available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading templates...</p>
          ) : templates && templates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {template.templateName}
                      </div>
                    </TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {template.usageCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.price ? `${template.price} OMR` : "Free"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {template.isPremium && (
                          <Badge variant="secondary">Premium</Badge>
                        )}
                        {template.isOfficial && (
                          <Badge variant="default">Official</Badge>
                        )}
                        {template.isActive && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {template.fileUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(template.fileUrl!, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          disabled={deleteTemplateMutation.isPending}
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
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No templates yet</p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Your First Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
