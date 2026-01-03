import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  images: string[];
  coverImage?: string | null;
  alt: string;
  className?: string;
}

/**
 * Photo Gallery component with lightbox viewer
 * Shows thumbnail grid with click-to-expand functionality
 */
export function PhotoGallery({ images, coverImage, alt, className }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Combine cover image with gallery images
  const allImages = coverImage 
    ? [coverImage, ...images.filter(img => img !== coverImage)]
    : images;

  if (allImages.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + allImages.length) % allImages.length);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % allImages.length);
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2", className)}>
        {allImages.slice(0, 8).map((image, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="relative aspect-square rounded-lg overflow-hidden group hover:ring-2 hover:ring-primary transition-all"
          >
            <img
              src={image}
              alt={`${alt} - Photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {index === 0 && (
              <div className="absolute top-2 left-2">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Cover
                </span>
              </div>
            )}
            {index === 7 && allImages.length > 8 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  +{allImages.length - 8}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Previous Button */}
            {allImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-50 text-white hover:bg-white/20 h-12 w-12"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {/* Image */}
            {selectedIndex !== null && (
              <div className="flex flex-col items-center justify-center w-full h-full p-4">
                <img
                  src={allImages[selectedIndex]}
                  alt={`${alt} - Photo ${selectedIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                  {selectedIndex + 1} / {allImages.length}
                </div>
              </div>
            )}

            {/* Next Button */}
            {allImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-50 text-white hover:bg-white/20 h-12 w-12"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Compact photo gallery preview (shows first 3-4 images)
 */
export function PhotoGalleryPreview({ images, coverImage, alt, onViewAll }: PhotoGalleryProps & { onViewAll?: () => void }) {
  const allImages = coverImage 
    ? [coverImage, ...images.filter(img => img !== coverImage)]
    : images;

  if (allImages.length === 0) {
    return null;
  }

  const displayImages = allImages.slice(0, 3);
  const remainingCount = allImages.length - 3;

  return (
    <div className="flex gap-2">
      {displayImages.map((image, index) => (
        <div
          key={index}
          className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
        >
          <img
            src={image}
            alt={`${alt} - Photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      {remainingCount > 0 && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-20 h-20 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-sm font-medium transition-colors"
        >
          +{remainingCount}
        </button>
      )}
    </div>
  );
}
