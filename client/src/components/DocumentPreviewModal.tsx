import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface Document {
  url: string;
  label: string;
  type: "pdf" | "image";
}

interface DocumentPreviewModalProps {
  documents: Document[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export default function DocumentPreviewModal({
  documents,
  initialIndex = 0,
  open,
  onClose,
}: DocumentPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(100);

  const currentDoc = documents[currentIndex];
  const isPdf = currentDoc?.type === "pdf";
  const hasMultiple = documents.length > 1;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : documents.length - 1));
    setZoom(100);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < documents.length - 1 ? prev + 1 : 0));
    setZoom(100);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    if (!currentDoc) return;
    
    const link = document.createElement("a");
    link.href = currentDoc.url;
    link.download = currentDoc.label;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentDoc) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{currentDoc.label}</DialogTitle>
              {hasMultiple && (
                <p className="text-sm text-muted-foreground mt-1">
                  Document {currentIndex + 1} of {documents.length}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Zoom controls for images */}
              {!isPdf && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                    {zoom}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {/* Download button */}
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              {/* Close button */}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-muted/20 relative">
          {isPdf ? (
            <iframe
              src={currentDoc.url}
              className="w-full h-full border-0"
              title={currentDoc.label}
            />
          ) : (
            <div className="flex items-center justify-center min-h-full p-8">
              <img
                src={currentDoc.url}
                alt={currentDoc.label}
                className="max-w-full h-auto object-contain"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        {hasMultiple && (
          <div className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {documents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setZoom(100);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to document ${index + 1}`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
