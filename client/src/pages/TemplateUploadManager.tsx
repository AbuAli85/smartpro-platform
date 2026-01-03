/**
 * Template Upload Manager
 * Admin page for uploading and managing DOCX template files
 */

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, FileText, Check, AlertCircle, Loader2, Download, Eye } from 'lucide-react';

export default function TemplateUploadManager() {
  const { t } = useLanguage();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedPlaceholders, setExtractedPlaceholders] = useState<string[]>([]);

  // Fetch all document templates
  const { data: templatesData, isLoading, refetch } = trpc.documentTemplate.list.useQuery({
    page: 1,
    limit: 100,
  });

  // Upload mutation
  const uploadMutation = trpc.documentTemplate.uploadTemplateFile.useMutation({
    onSuccess: (data) => {
      toast.success('Template file uploaded successfully');
      setExtractedPlaceholders(data.placeholders);
      setSelectedFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.docx')) {
      toast.error('Please select a .docx file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setExtractedPlaceholders([]);
  };

  const handleUpload = async () => {
    if (!selectedTemplateId || !selectedFile) {
      toast.error('Please select a template and file');
      return;
    }

    setIsUploading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:... prefix

        await uploadMutation.mutateAsync({
          templateId: selectedTemplateId,
          fileBuffer: base64Data,
          fileName: selectedFile.name,
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const templates = templatesData?.templates || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Template Upload Manager</h1>
        <p className="text-muted-foreground">
          Upload professional .docx templates with placeholders for automatic document generation
        </p>
      </div>

      {/* Instructions Card */}
      <Card className="mb-8 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            How to Create Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>1. Create Document:</strong> Design your template in Microsoft Word or Google Docs</p>
          <p><strong>2. Add Placeholders:</strong> Use {'{{placeholderName}}'} format (e.g., {'{{employeeName}}'}, {'{{salary}}'}, {'{{date}}'})</p>
          <p><strong>3. Save as DOCX:</strong> Export/save your document as .docx format</p>
          <p><strong>4. Upload:</strong> Select the template below and upload your .docx file</p>
          <p className="text-blue-700 font-medium mt-4">
            💡 Tip: Date fields will automatically include both Gregorian and Hijri dates!
          </p>
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Template File</CardTitle>
          <CardDescription>Select a template and upload a .docx file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selector */}
          <div className="space-y-2">
            <Label>Select Template</Label>
            <Select
              value={selectedTemplateId?.toString() || ''}
              onValueChange={(value) => {
                setSelectedTemplateId(parseInt(value));
                setExtractedPlaceholders([]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {template.templateName}
                      {template.templateFileUrl && (
                        <Badge variant="secondary" className="ml-2">
                          <Check className="w-3 h-3 mr-1" />
                          Has File
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload .DOCX File</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".docx"
                onChange={handleFileSelect}
                className="flex-1"
              />
              {selectedFile && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {selectedFile.name}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Max file size: 10MB. Only .docx files are supported.
            </p>
          </div>

          {/* Upload Button */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setSelectedTemplateId(null);
                setExtractedPlaceholders([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedTemplateId || !selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Template
                </>
              )}
            </Button>
          </div>

          {/* Extracted Placeholders */}
          {extractedPlaceholders.length > 0 && (
            <div className="mt-6 p-4 border rounded-lg bg-green-50">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Upload Successful! Found {extractedPlaceholders.length} Placeholders:
              </h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {extractedPlaceholders.map((placeholder) => (
                  <Badge key={placeholder} variant="secondary">
                    {'{{' + placeholder + '}}'}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Templates</CardTitle>
          <CardDescription>Templates with .docx files ready for use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.filter((t) => t.templateFileUrl).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No templates with files uploaded yet. Upload a .docx file above to get started.
              </p>
            ) : (
              templates
                .filter((t) => t.templateFileUrl)
                .map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{template.templateName}</p>
                        <p className="text-sm text-muted-foreground">{template.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Check className="w-3 h-3 mr-1" />
                        DOCX Ready
                      </Badge>
                      {template.templateFileUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={template.templateFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
