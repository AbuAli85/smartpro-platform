import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, FileText, Download, CheckCircle2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DynamicTemplateForm } from "@/components/DynamicTemplateForm";

export default function TemplateDetail() {
  const [, params] = useRoute("/templates/:id");
  const [, setLocation] = useLocation();
  // Using sonner toast
  const templateId = parseInt(params?.id || "0");

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [documentName, setDocumentName] = useState("");
  const [generatedDocUrl, setGeneratedDocUrl] = useState<string | null>(null);
  const [useDynamicForm, setUseDynamicForm] = useState(false);

  // Fetch template first
  const { data: template, isLoading } = trpc.documentTemplate.getById.useQuery(
    { id: templateId },
    { enabled: templateId > 0 }
  );

  // Fetch placeholders if template has DOCX file
  const { data: placeholdersData } = trpc.documentTemplate.getTemplatePlaceholders.useQuery(
    { templateId },
    { enabled: templateId > 0 && !!template?.templateFileUrl }
  );

  const generateMutation = trpc.documentTemplate.generate.useMutation({
    onSuccess: (data) => {
      toast.success("Document Generated!", {
        description: "Your document has been generated successfully.",
      });
      // Download the PDF
      window.open(data.url, "_blank");
      setLocation("/documents");
    },
    onError: (error) => {
      toast.error("Generation Failed", {
        description: error.message,
      });
    },
  });

  // DOCX generation mutation
  const generateDocxMutation = trpc.documentTemplate.generateFromDocx.useMutation({
    onSuccess: (data) => {
      toast.success("Document Generated!", {
        description: "Your professional DOCX document is ready for download.",
      });
      setGeneratedDocUrl(data.url);
    },
    onError: (error) => {
      toast.error("Generation Failed", {
        description: error.message,
      });
    },
  });

  // Determine if we should use dynamic form (has DOCX template)
  const shouldUseDynamicForm = template?.templateFileUrl && placeholdersData?.placeholders;

  const handleDynamicFormSubmit = (data: Record<string, any>) => {
    if (!template) return;

    const docName = `${template.templateName}_${Date.now()}`;
    
    generateDocxMutation.mutate({
      templateId: template.id,
      documentName: docName,
      filledData: data,
    });
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    if (!template) return;

    // Validate required fields
    const missingFields = template.variables
      .filter((v) => v.required && !formData[v.name])
      .map((v) => v.label);

    if (missingFields.length > 0) {
      toast.error("Missing Required Fields", {
        description: `Please fill in: ${missingFields.join(", ")}`,
      });
      return;
    }

    if (!documentName) {
      toast.error("Document Name Required", {
        description: "Please provide a name for your document",
      });
      return;
    }

    generateMutation.mutate({
      templateId: template.id,
      documentName,
      filledData: formData,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h2>
          <p className="text-gray-600 mb-4">The template you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/templates")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/templates")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{template.templateName}</h1>
                {template.isOfficial && (
                  <Badge className="bg-green-100 text-green-800">Official</Badge>
                )}
                {template.isPremium && (
                  <Badge className="bg-[#FFD700] text-gray-900">Premium</Badge>
                )}
              </div>
              {template.templateNameAr && (
                <p className="text-lg text-gray-500 font-arabic mb-2">{template.templateNameAr}</p>
              )}
              <p className="text-gray-600">{template.description}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {template.category}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Show dynamic form if DOCX template exists */}
            {shouldUseDynamicForm ? (
              <DynamicTemplateForm
                placeholders={placeholdersData.placeholders}
                onSubmit={handleDynamicFormSubmit}
                isGenerating={generateDocxMutation.isPending}
                generatedDocUrl={generatedDocUrl || undefined}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Fill Document Details</CardTitle>
                  <CardDescription>
                    Complete the form below to generate your document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Document Name */}
                  <div>
                  <Label htmlFor="documentName">
                    Document Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="documentName"
                    placeholder="e.g., Employment Contract - John Doe"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                  />
                </div>

                  {/* Dynamic Fields */}
                  {template.variables.map((variable) => (
                    <div key={variable.name}>
                    <Label htmlFor={variable.name}>
                      {variable.label}
                      {variable.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {variable.type === "textarea" ? (
                      <Textarea
                        id={variable.name}
                        placeholder={variable.placeholder}
                        value={formData[variable.name] || ""}
                        onChange={(e) => handleInputChange(variable.name, e.target.value)}
                        rows={4}
                      />
                    ) : variable.type === "dropdown" ? (
                      <Select
                        value={formData[variable.name] || ""}
                        onValueChange={(value) => handleInputChange(variable.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${variable.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {variable.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={variable.name}
                        type={variable.type}
                        placeholder={variable.placeholder}
                        value={formData[variable.name] || variable.defaultValue || ""}
                        onChange={(e) => handleInputChange(variable.name, e.target.value)}
                      />
                    )}
                  </div>
                ))}

                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                  {generateMutation.isPending ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Generate Document
                    </>
                  )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-sm capitalize">{template.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Language</p>
                  <p className="text-sm uppercase">{template.language}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Usage Count</p>
                  <p className="text-sm">{template.usageCount || 0} times</p>
                </div>
                {template.tags && template.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  What You'll Get
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Professional PDF document</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Legally compliant format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Ready for printing and signing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Saved in your documents</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
