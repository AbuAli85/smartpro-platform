import { useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface UploadedFile {
  url: string;
  filename: string;
  type: string;
}

interface MultiDocumentUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  onUploadComplete: (urls: string[]) => void;
  currentUrls?: string[];
  onRemove?: (index: number) => void;
}

export default function MultiDocumentUpload({
  label,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 5,
  maxFiles = 5,
  onUploadComplete,
  currentUrls = [],
  onRemove,
}: MultiDocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    currentUrls.map(url => ({
      url,
      filename: url.split('/').pop() || 'document',
      type: url.endsWith('.pdf') ? 'application/pdf' : 'image/*'
    }))
  );

  const uploadMutation = trpc.storage.uploadFile.useMutation({
    onSuccess: (data: { url: string; key: string }, variables) => {
      const newFile: UploadedFile = {
        url: data.url,
        filename: variables.filename,
        type: variables.contentType,
      };
      
      const updatedFiles = [...uploadedFiles, newFile];
      setUploadedFiles(updatedFiles);
      onUploadComplete(updatedFiles.map(f => f.url));
      
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed max
    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    for (const file of files) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        toast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
        return;
      }
    }

    setUploading(true);
    setProgress(10);

    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(10 + (i / files.length) * 80);

      try {
        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onload = async () => {
            const base64 = reader.result as string;
            
            uploadMutation.mutate({
              filename: file.name,
              content: base64,
              contentType: file.type,
            });
            
            // Wait a bit for the mutation to complete
            await new Promise(r => setTimeout(r, 500));
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setProgress(100);
    setTimeout(() => {
      setUploading(false);
      setProgress(0);
    }, 500);
    
    // Reset input
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    onUploadComplete(updatedFiles.map(f => f.url));
    
    if (onRemove) {
      onRemove(index);
    }
    
    toast.success("Document removed");
  };

  const isImage = (type: string) => type.startsWith('image/');
  const canUploadMore = uploadedFiles.length < maxFiles;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-xs text-muted-foreground">
          {uploadedFiles.length} / {maxFiles} files
        </span>
      </div>
      
      {/* Gallery Preview */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {uploadedFiles.map((file, index) => (
            <div 
              key={index} 
              className="relative group border rounded-lg overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {/* Preview */}
              <div className="aspect-square flex items-center justify-center p-4">
                {isImage(file.type) ? (
                  <img 
                    src={file.url} 
                    alt={file.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-primary" />
                    <p className="text-xs text-center text-muted-foreground truncate w-full px-2">
                      {file.filename}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                >
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs"
                  >
                    View
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
              
              {/* Filename label */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                {file.filename}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            multiple
            className="hidden"
            id={`multi-file-upload-${label}`}
          />
          <label
            htmlFor={`multi-file-upload-${label}`}
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
                  {accept.replace(/\./g, "").toUpperCase()} (max {maxSizeMB}MB each)
                </p>
                <p className="text-xs text-muted-foreground">
                  {maxFiles - uploadedFiles.length} more file(s) allowed
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
      
      {!canUploadMore && uploadedFiles.length > 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Maximum number of files reached. Remove a file to upload more.
        </p>
      )}
    </div>
  );
}
