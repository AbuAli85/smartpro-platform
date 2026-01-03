import { useState } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface DocumentUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
  onRemove?: () => void;
}

export default function DocumentUpload({
  label,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 5,
  onUploadComplete,
  currentUrl,
  onRemove,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadMutation = trpc.storage.uploadFile.useMutation({
    onSuccess: (data: { url: string; key: string }) => {
      onUploadComplete(data.url);
      toast.success("Document uploaded successfully");
      setUploading(false);
      setProgress(0);
    },
    onError: (error: any) => {
      toast.error("Upload failed", {
        description: error.message,
      });
      setUploading(false);
      setProgress(0);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setProgress(30);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setProgress(60);
        
        uploadMutation.mutate({
          filename: file.name,
          content: base64,
          contentType: file.type,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to read file");
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {currentUrl ? (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
          <FileText className="h-5 w-5 text-primary" />
          <a 
            href={currentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 text-sm text-primary hover:underline truncate"
          >
            {currentUrl.split('/').pop()}
          </a>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <label
            htmlFor={`file-upload-${label}`}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uploading
                ? "border-primary bg-primary/5 cursor-not-allowed"
                : "border-border hover:border-primary hover:bg-muted/50"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading... {progress}%</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  {accept.replace(/\./g, "").toUpperCase()} (max {maxSizeMB}MB)
                </p>
              </div>
            )}
          </label>
          
          {uploading && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-b-lg overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
