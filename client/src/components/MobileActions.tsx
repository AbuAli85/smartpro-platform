import { Phone, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MobileActionsProps {
  phoneNumber?: string | null;
  address?: string;
  officeName?: string;
  className?: string;
}

/**
 * Mobile-specific action buttons for offices
 * Includes click-to-call, tap-to-navigate, and share functionality
 */
export function MobileActions({
  phoneNumber,
  address,
  officeName,
  className,
}: MobileActionsProps) {
  const handleCall = () => {
    if (!phoneNumber) {
      toast.error("Phone number not available");
      return;
    }
    // Remove any non-numeric characters except +
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
    window.location.href = `tel:${cleanNumber}`;
  };

  const handleNavigate = () => {
    if (!address) {
      toast.error("Address not available");
      return;
    }

    // Detect if user is on iOS or Android
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    // Encode address for URL
    const encodedAddress = encodeURIComponent(address);

    if (isIOS) {
      // Open in Apple Maps
      window.location.href = `maps://maps.apple.com/?q=${encodedAddress}`;
    } else if (isAndroid) {
      // Open in Google Maps
      window.location.href = `geo:0,0?q=${encodedAddress}`;
    } else {
      // Fallback to Google Maps web
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const handleShare = async () => {
    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: officeName || "SmartPro Office",
          text: `Check out ${officeName || "this office"} on SmartPro`,
          url: window.location.href,
        });
        toast.success("Shared successfully");
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {phoneNumber && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCall}
          className="flex-1 sm:flex-none"
        >
          <Phone className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Call</span>
          <span className="sm:hidden">Call</span>
        </Button>
      )}

      {address && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNavigate}
          className="flex-1 sm:flex-none"
        >
          <MapPin className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Navigate</span>
          <span className="sm:hidden">Directions</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="flex-1 sm:flex-none"
      >
        <Share2 className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Share</span>
        <span className="sm:hidden">Share</span>
      </Button>
    </div>
  );
}

/**
 * Compact version for office cards
 */
export function CompactMobileActions({
  phoneNumber,
  address,
  className,
}: Omit<MobileActionsProps, "officeName">) {
  const handleCall = () => {
    if (!phoneNumber) return;
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
    window.location.href = `tel:${cleanNumber}`;
  };

  const handleNavigate = () => {
    if (!address) return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const encodedAddress = encodeURIComponent(address);

    if (isIOS) {
      window.location.href = `maps://maps.apple.com/?q=${encodedAddress}`;
    } else {
      window.location.href = `geo:0,0?q=${encodedAddress}`;
    }
  };

  return (
    <div className={cn("flex gap-2 lg:hidden", className)}>
      {phoneNumber && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCall}
          className="h-8 w-8"
        >
          <Phone className="w-4 h-4" />
        </Button>
      )}

      {address && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNavigate}
          className="h-8 w-8"
        >
          <MapPin className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Click-to-call link component
 */
export function ClickToCall({
  phoneNumber,
  className,
}: {
  phoneNumber: string;
  className?: string;
}) {
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

  return (
    <a
      href={`tel:${cleanNumber}`}
      className={cn(
        "inline-flex items-center text-primary hover:underline",
        className
      )}
    >
      <Phone className="w-4 h-4 mr-1" />
      {phoneNumber}
    </a>
  );
}

/**
 * Tap-to-navigate link component
 */
export function TapToNavigate({
  address,
  className,
}: {
  address: string;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const encodedAddress = encodeURIComponent(address);

    if (isIOS) {
      window.location.href = `maps://maps.apple.com/?q=${encodedAddress}`;
    } else {
      window.location.href = `geo:0,0?q=${encodedAddress}`;
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center text-primary hover:underline",
        className
      )}
    >
      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
      <span className="line-clamp-1">{address}</span>
    </a>
  );
}
