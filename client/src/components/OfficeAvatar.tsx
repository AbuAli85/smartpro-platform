import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OfficeAvatarProps {
  logoUrl?: string | null;
  officeName: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showFallbackIcon?: boolean;
}

/**
 * Office Avatar component that displays:
 * 1. Office logo if available
 * 2. Office name initials as fallback
 * 3. Building icon for empty state
 */
export function OfficeAvatar({
  logoUrl,
  officeName,
  className,
  size = "md",
  showFallbackIcon = true,
}: OfficeAvatarProps) {
  // Generate initials from office name
  const getInitials = (name: string): string => {
    if (!name) return "?";
    
    // Split by spaces and take first letter of each word
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      // Single word: take first 2 characters
      return words[0].substring(0, 2).toUpperCase();
    }
    // Multiple words: take first letter of first 2 words
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const initials = getInitials(officeName);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {logoUrl && (
        <AvatarImage 
          src={logoUrl} 
          alt={`${officeName} logo`}
          className="object-cover"
        />
      )}
      <AvatarFallback 
        className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-semibold"
      >
        {showFallbackIcon && !initials ? (
          <Building2 className={cn(
            size === "sm" && "h-4 w-4",
            size === "md" && "h-5 w-5",
            size === "lg" && "h-6 w-6",
            size === "xl" && "h-8 w-8"
          )} />
        ) : (
          initials
        )}
      </AvatarFallback>
    </Avatar>
  );
}

/**
 * Office Avatar with name label
 */
export function OfficeAvatarWithName({
  logoUrl,
  officeName,
  subtitle,
  size = "md",
  className,
}: OfficeAvatarProps & { subtitle?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <OfficeAvatar 
        logoUrl={logoUrl}
        officeName={officeName}
        size={size}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{officeName}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
