import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DocumentUploadInterfaceProps {
  bookingId: number;
  officeId: number;
}

export function DocumentUploadInterface({ bookingId, officeId }: DocumentUploadInterfaceProps) {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  const utils = trpc.useUtils();

  const uploadMutation = trpc.bookingDocuments.upload.useMutation({
    onSuccess: () => {
      toast.success(t("documents.uploadSuccess") || "Document uploaded successfully");
      setSelectedFile(null);
      setNotes("");
      // Invalidate queries to refresh document list
      utils.bookingDocuments.getByBooking.invalidate({ bookingId });
      utils.bookingDocuments.getByOffice.invalidate({ officeId });
    },
    onError: (error) => {
      toast.error(error.message || t("documents.uploadError") || "Failed to upload document");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (16MB limit)
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
      toast.error(t("documents.fileTooLarge") || "File size exceeds 16MB limit");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("documents.invalidFileType") || "Invalid file type. Only PDF, JPG, PNG, and Word documents are allowed");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(t("documents.selectFile") || "Please select a file");
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64Content = base64Data.split(',')[1]; // Remove data:mime;base64, prefix

        await uploadMutation.mutateAsync({
          bookingId,
          fileName: selectedFile.name,
          fileData: base64Content,
          mimeType: selectedFile.type,
          notes: notes.trim() || undefined,
        });

        setUploading(false);
      };

      reader.onerror = () => {
        toast.error(t("documents.readError") || "Failed to read file");
        setUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {t("documents.uploadTitle") || "Upload Document"}
        </CardTitle>
        <CardDescription>
          {t("documents.uploadDescription") || "Upload completed documents for this booking (licenses, certificates, etc.)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">
            {t("documents.selectDocument") || "Select Document"}
          </Label>
          
          {!selectedFile ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">
                  {t("documents.clickToUpload") || "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("documents.supportedFormats") || "PDF, JPG, PNG, Word (max 16MB)"}
                </p>
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
              <FileText className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Notes */}
        {selectedFile && (
          <div className="space-y-2">
            <Label htmlFor="notes">
              {t("documents.notes") || "Notes (Optional)"}
            </Label>
            <Textarea
              id="notes"
              placeholder={t("documents.notesPlaceholder") || "Add any notes about this document..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={uploading}
              rows={3}
            />
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("documents.uploading") || "Uploading..."}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("documents.uploadButton") || "Upload Document"}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
