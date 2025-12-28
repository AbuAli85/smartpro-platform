import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

/**
 * ResponsiveImage component with lazy loading and blur-up effect
 * Automatically generates srcset for different screen sizes
 */
export function ResponsiveImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  objectFit = "cover",
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);

  // Generate responsive image URLs
  // For S3 images, we can add query parameters for resizing
  // For external images, we use the original URL
  const generateSrcSet = (url: string) => {
    // Check if it's an S3 URL that supports resizing
    if (url.includes('amazonaws.com') || url.includes('s3.')) {
      // Generate different sizes for responsive loading
      return {
        mobile: `${url}?w=640`,
        tablet: `${url}?w=1024`,
        desktop: url,
      };
    }
    // For other URLs, use original
    return {
      mobile: url,
      tablet: url,
      desktop: url,
    };
  };

  const srcSet = generateSrcSet(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before image enters viewport
      }
    );

    observer.observe(imgRef);

    return () => {
      observer.disconnect();
    };
  }, [imgRef, priority]);

  // Generate srcset attribute
  const srcSetAttr = `${srcSet.mobile} 640w, ${srcSet.tablet} 1024w, ${srcSet.desktop} 1920w`;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        className
      )}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse" />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={setImgRef}
          src={srcSet.desktop}
          srcSet={srcSetAttr}
          sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "w-full h-full transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            objectFit === "cover" && "object-cover",
            objectFit === "contain" && "object-contain",
            objectFit === "fill" && "object-fill",
            objectFit === "none" && "object-none",
            objectFit === "scale-down" && "object-scale-down"
          )}
          style={{
            objectFit,
          }}
        />
      )}
    </div>
  );
}

/**
 * Optimized office cover image component
 */
export function OfficeCoverImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={cn("w-full h-40 bg-gradient-elegant rounded-md flex items-center justify-center", className)}>
        <Building2 className="w-12 h-12 text-white" />
      </div>
    );
  }

  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={cn("w-full h-40 rounded-md", className)}
      objectFit="cover"
    />
  );
}

// Import Building2 icon
import { Building2 } from "lucide-react";
