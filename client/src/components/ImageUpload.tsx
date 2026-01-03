import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImageCropDialog } from './ImageCropDialog';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  enableCrop?: boolean;
  cropAspectRatio?: number; // e.g., 1 for square, 16/9 for landscape
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
  accept = 'image/*',
  label,
  helperText,
  disabled = false,
  enableCrop = false,
  cropAspectRatio,
}: ImageUploadProps) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const currentImages = multiple
    ? Array.isArray(value) ? value : []
    : value ? [value] : [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file count
    if (multiple && currentImages.length + files.length > maxFiles) {
      setError(t('imageUpload.maxFilesError', { max: maxFiles }));
      return;
    }

    // Validate file sizes (16MB limit)
    const maxSize = 16 * 1024 * 1024; // 16MB
    const invalidFiles = files.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      setError(t('imageUpload.fileSizeError'));
      return;
    }

    setError(null);

    // If crop is enabled, show crop dialog for first image
    if (enableCrop) {
      setPendingFiles(files);
      setCurrentFileIndex(0);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToCrop(e.target?.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(files[0]);
      return;
    }

    // Otherwise, upload directly
    await uploadFiles(files);
  };

  const uploadFiles = async (files: File[] | Blob[]) => {
    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (multiple) {
        onChange([...currentImages, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0]);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(t('imageUpload.uploadError'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const nextIndex = currentFileIndex + 1;
    const croppedFiles = [...pendingFiles.slice(0, currentFileIndex), croppedBlob, ...pendingFiles.slice(nextIndex)];

    // If there are more files to crop and we're in multiple mode
    if (multiple && nextIndex < pendingFiles.length) {
      setCurrentFileIndex(nextIndex);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToCrop(e.target?.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(pendingFiles[nextIndex]);
    } else {
      // All files cropped, upload them
      setCropDialogOpen(false);
      setImageToCrop(null);
      setPendingFiles([]);
      setCurrentFileIndex(0);
      await uploadFiles(croppedFiles);
    }
  };

  const handleRemove = (urlToRemove: string) => {
    if (multiple) {
      const newImages = currentImages.filter(url => url !== urlToRemove);
      onChange(newImages);
    } else {
      onChange('');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">{label}</label>
      )}

      <div className="space-y-3">
        {/* Upload Button */}
        {(!multiple || currentImages.length < maxFiles) && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleClick}
              disabled={disabled || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('imageUpload.uploading')}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {multiple ? t('imageUpload.uploadMultiple') : t('imageUpload.uploadSingle')}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Preview Grid */}
        {currentImages.length > 0 && (
          <div className={`grid gap-3 ${multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
            {currentImages.map((url, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg border overflow-hidden bg-muted"
              >
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(url)}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {currentImages.length === 0 && !uploading && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {multiple ? t('imageUpload.noImagesMultiple') : t('imageUpload.noImagesSingle')}
            </p>
          </div>
        )}

        {/* Helper Text */}
        {helperText && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        {/* File Count */}
        {multiple && currentImages.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {t('imageUpload.fileCount', { current: currentImages.length, max: maxFiles })}
          </p>
        )}
      </div>

      {/* Crop Dialog */}
      {enableCrop && imageToCrop && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={(open) => {
            setCropDialogOpen(open);
            if (!open) {
              setImageToCrop(null);
              setPendingFiles([]);
              setCurrentFileIndex(0);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }
          }}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          aspectRatio={cropAspectRatio}
          title={multiple && pendingFiles.length > 1 
            ? `Crop Image ${currentFileIndex + 1} of ${pendingFiles.length}`
            : 'Crop Image'
          }
        />
      )}
    </div>
  );
}
