import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * RTL-Aware Icon Component
 * 
 * Automatically flips directional icons in RTL mode.
 * Use this wrapper for any icon that has directional meaning (arrows, chevrons, etc.)
 * 
 * @example
      // @ts-ignore - Framer Motion typing issue
 * <RTLIcon icon={ChevronRight} className="w-4 h-4" />
      // @ts-ignore - Framer Motion typing issue
 * <RTLIcon icon={ArrowRight} flip="always" />
      // @ts-ignore - Framer Motion typing issue
 * <RTLIcon icon={Search} flip="never" /> // Non-directional icon
 */

interface RTLIconProps {
  /** Icon component or element to render */
  icon?: React.ComponentType<{ className?: string }>;
  /** Children (alternative to icon prop) */
  children?: React.ReactNode;
  /** When to flip the icon */
  flip?: 'auto' | 'always' | 'never';
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export function RTLIcon({ 
  icon: Icon, 
  children, 
  flip = 'auto', 
  className,
  style 
}: RTLIconProps) {
  const { isRTL } = useLanguage();
  
  // Determine if icon should be flipped
  const shouldFlip = flip === 'always' || (flip === 'auto' && isRTL);
  
  // Flip transform
  const transform = shouldFlip ? 'scaleX(-1)' : undefined;
  
  const combinedStyle = {
    ...style,
    transform: transform || style?.transform,
  };
  
  if (Icon) {
    return (
      <Icon 
        className={cn(className)} 
        style={combinedStyle}
      />
    );
  }
  
  if (children) {
    return (
      <span 
        className={cn("inline-flex items-center justify-center", className)}
        style={combinedStyle}
      >
        {children}
      </span>
    );
  }
  
  return null;
}

/**
 * List of common directional icon names that should be flipped in RTL
 * Use this to automatically detect if an icon needs flipping
 */
export const DIRECTIONAL_ICONS = [
  'arrow',
  'chevron',
  'angle',
  'caret',
  'forward',
  'backward',
  'next',
  'previous',
  'prev',
  'left',
  'right',
  'start',
  'end',
  'first',
  'last',
  'redo',
  'undo',
  'reply',
  'share',
  'send',
  'enter',
  'exit',
  'signin',
  'signout',
  'login',
  'logout',
];

/**
 * Detect if an icon name suggests it's directional
 */
export function isDirectionalIcon(iconName: string): boolean {
  const lowerName = iconName.toLowerCase();
  return DIRECTIONAL_ICONS.some(dir => lowerName.includes(dir));
}

/**
 * HOC to make any icon component RTL-aware
 * 
 * @example
 * const RTLChevronRight = withRTL(ChevronRight);
 * <RTLChevronRight className="w-4 h-4" />
 */
export function withRTL<P extends { className?: string; style?: React.CSSProperties }>(
  IconComponent: React.ComponentType<P>,
  flipMode: 'auto' | 'always' | 'never' = 'auto'
) {
  return function RTLWrappedIcon(props: P) {
    return (
      // @ts-ignore - Framer Motion typing issue
      <RTLIcon icon={IconComponent} flip={flipMode} {...props} />
    );
  };
}

/**
 * CSS class helper for RTL icon flipping
 * Use this in className when you can't use the component wrapper
 * 
 * @example
 * <ChevronRight className={cn("w-4 h-4", getRTLIconClass())} />
 */
export function getRTLIconClass(isRTL: boolean, flip: 'auto' | 'always' | 'never' = 'auto'): string {
  const shouldFlip = flip === 'always' || (flip === 'auto' && isRTL);
  return shouldFlip ? '-scale-x-100' : '';
}

/**
 * Utility hook for RTL icon flipping
 * Returns appropriate transform style
 * 
 * @example
 * const iconStyle = useRTLIconStyle();
 * <ChevronRight style={iconStyle} />
 */
export function useRTLIconStyle(flip: 'auto' | 'always' | 'never' = 'auto'): React.CSSProperties | undefined {
  const { isRTL } = useLanguage();
  const shouldFlip = flip === 'always' || (flip === 'auto' && isRTL);
  
  return shouldFlip ? { transform: 'scaleX(-1)' } : undefined;
}
