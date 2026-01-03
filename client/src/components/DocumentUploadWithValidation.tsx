import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadedDocument {
  url: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  validation?: {
    isValid: boolean;
    documentType: string;
    confidence: number;
    issues: string[];
    suggestions: string[];
  };
}

interface DocumentUploadWithValidationProps {
  serviceType: string;
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function DocumentUploadWithValidation({
  serviceType,
  onDocumentsChange,
  maxFiles = 10,
  maxSizeMB = 16,
}: DocumentUploadWithValidationProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: requirements } = trpc.documentUpload.getRequiredDocuments.useQuery({
    serviceType,
  });

  const uploadMutation = trpc.documentUpload.uploadDocument.useMutation();
  const validateMutation = trpc.documentUpload.validateDocument.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    if (documents.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);

    for (const file of files) {
      try {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
          toast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
          continue;
        }

        // Check file type
        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`${file.name} is not a supported file type`);
          continue;
        }

        // Convert to base64
        const base64 = await fileToBase64(file);

        // Upload to S3
        const uploadResult = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64,
          mimeType: file.type,
        });

        const newDoc: UploadedDocument = uploadResult;
        
        // Add to documents list
        const updatedDocs = [...documents, newDoc];
        setDocuments(updatedDocs);
        onDocumentsChange(updatedDocs);

        // Validate document with AI (async)
        if (file.type.startsWith("image/") || file.type === "application/pdf") {
          validateDocument(newDoc);
        }

        toast.success(`${file.name} uploaded successfully`);
      } catch (error: any) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateDocument = async (doc: UploadedDocument) => {
    setValidating(doc.fileKey);

    try {
      const validation = await validateMutation.mutateAsync({
        documentUrl: doc.url,
        fileName: doc.fileName,
        expectedType: determineDocumentType(doc.fileName),
        serviceType,
      });

      // Update document with validation result
      setDocuments((prev) =>
        prev.map((d) =>
          d.fileKey === doc.fileKey
            ? { ...d, validation }
            : d
        )
      );

      onDocumentsChange(
        documents.map((d) =>
          d.fileKey === doc.fileKey
            ? { ...d, validation }
            : d
        )
      );

      if (!validation.isValid) {
        toast.warning(`${doc.fileName}: ${validation.issues[0]}`);
      }
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setValidating(null);
    }
  };

  const removeDocument = (fileKey: string) => {
    const updatedDocs = documents.filter((d) => d.fileKey !== fileKey);
    setDocuments(updatedDocs);
    onDocumentsChange(updatedDocs);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const determineDocumentType = (filename: string): string => {
    const lower = filename.toLowerCase();
    
    if (lower.includes("id") || lower.includes("passport")) return "national_id";
    if (lower.includes("commercial") || lower.includes("cr")) return "commercial_registration";
    if (lower.includes("tax")) return "tax_registration";
    if (lower.includes("license")) return "business_license";
    if (lower.includes("lease") || lower.includes("utility")) return "proof_of_address";
    
    return "supporting_document";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Required Documents Info */}
      {requirements && requirements.requirements.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold mb-2 text-blue-900">Required Documents</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            {requirements.requirements.map((req, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className={cn("mt-0.5", req.required ? "text-red-600" : "text-blue-600")}>
                  {req.required ? "•" : "○"}
                </span>
                <span>
                  {req.description}
                  {req.required && <span className="text-red-600 ml-1">*</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium mb-2">
          {uploading ? "Uploading..." : "Click to upload documents"}
        </p>
        <p className="text-sm text-gray-500">
          PDF, JPG, or PNG (max {maxSizeMB}MB per file)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold">Uploaded Documents ({documents.length})</h4>
          {documents.map((doc) => (
            <Card key={doc.fileKey} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.fileName}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                    
                    {/* Validation Status */}
                    {validating === doc.fileKey && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-600">Validating with AI...</span>
                      </div>
                    )}
                    
                    {doc.validation && !validating && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center space-x-2">
                          {doc.validation.isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                          )}
                          <Badge
                            variant={doc.validation.isValid ? "default" : "secondary"}
                            className={cn(
                              doc.validation.isValid
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            )}
                          >
                            {doc.validation.documentType.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {doc.validation.confidence}% confidence
                          </span>
                        </div>
                        
                        {doc.validation.issues.length > 0 && (
                          <div className="text-xs text-amber-700 mt-1">
                            {doc.validation.issues[0]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(doc.fileKey)}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Uploading documents...</span>
        </div>
      )}
    </div>
  );
}
