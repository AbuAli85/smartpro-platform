import { useLanguage } from "@/contexts/LanguageContext";

/**
 * RTL-Aware Animation Hook
 * 
 * Provides directional animation variants that respect RTL layout.
 * Automatically flips slide directions, transforms, and transitions based on language direction.
 * 
 * @example
 * const slideIn = useRTLAnimation('slideIn');
 * <motion.div variants={slideIn} initial="hidden" animate="visible" />
 */

export type AnimationType = 
  | 'slideIn'
  | 'slideOut'
  | 'slideInFromSide'
  | 'slideOutToSide'
  | 'drawer'
  | 'modal'
  | 'toast'
  | 'dropdown'
  | 'pageTransition'
  | 'cardHover'
  | 'fadeSlide';

export interface AnimationVariants {
  hidden: Record<string, any>;
  visible: Record<string, any>;
  exit?: Record<string, any>;
}

export function useRTLAnimation(type: AnimationType): AnimationVariants {
  const { isRTL } = useLanguage();
  
  // Direction multiplier: 1 for LTR, -1 for RTL
  const dir = isRTL ? -1 : 1;
  
  const animations: Record<AnimationType, AnimationVariants> = {
    // Slide in from the natural reading direction (right in RTL, left in LTR)
    slideIn: {
      hidden: { 
        opacity: 0, 
        x: 50 * dir,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      },
      exit: {
        opacity: 0,
        x: -50 * dir,
        transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
      }
    },
    
    // Slide out to the natural reading direction
    slideOut: {
      hidden: { 
        opacity: 1, 
        x: 0 
      },
      visible: { 
        opacity: 0, 
        x: 50 * dir,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      }
    },
    
    // Slide in from the side (drawer-like)
    slideInFromSide: {
      hidden: { 
        x: 100 * dir,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      },
      visible: { 
        x: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      },
      exit: {
        x: 100 * dir,
        transition: { duration: 0.25, ease: [0.4, 0, 1, 1] }
      }
    },
    
    // Slide out to the side
    slideOutToSide: {
      hidden: { 
        x: 0 
      },
      visible: { 
        x: 100 * dir,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      }
    },
    
    // Drawer animation (slides from side)
    drawer: {
      hidden: { 
        x: isRTL ? '100%' : '-100%',
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      },
      visible: { 
        x: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      },
      exit: {
        x: isRTL ? '100%' : '-100%',
        transition: { duration: 0.25, ease: [0.4, 0, 1, 1] }
      }
    },
    
    // Modal animation (scale + fade from center)
    modal: {
      hidden: { 
        opacity: 0, 
        scale: 0.95,
        transition: { duration: 0.2 }
      },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.2, ease: [0, 0, 0.2, 1] }
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.15, ease: [0.4, 0, 1, 1] }
      }
    },
    
    // Toast notification (slides from side)
    toast: {
      hidden: { 
        opacity: 0,
        x: 100 * dir,
        y: 0,
        transition: { duration: 0.3 }
      },
      visible: { 
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: [0, 0, 0.2, 1] }
      },
      exit: {
        opacity: 0,
        x: 100 * dir,
        transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
      }
    },
    
    // Dropdown menu (slides down with slight horizontal offset)
    dropdown: {
      hidden: { 
        opacity: 0,
        scale: 0.95,
        y: -10,
        x: 5 * dir,
        transition: { duration: 0.15 }
      },
      visible: { 
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        transition: { duration: 0.15, ease: [0, 0, 0.2, 1] }
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: { duration: 0.1 }
      }
    },
    
    // Page transition (full page slide)
    pageTransition: {
      hidden: { 
        opacity: 0,
        x: 30 * dir,
        transition: { duration: 0.4 }
      },
      visible: { 
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
      },
      exit: {
        opacity: 0,
        x: -30 * dir,
        transition: { duration: 0.3, ease: [0.4, 0, 1, 1] }
      }
    },
    
    // Card hover effect (slight lift with directional shadow)
    cardHover: {
      hidden: { 
        scale: 1,
        boxShadow: isRTL 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      },
      visible: { 
        scale: 1.02,
        boxShadow: isRTL
          ? '-8px 10px 20px -5px rgba(0, 0, 0, 0.15), -4px 6px 10px -3px rgba(0, 0, 0, 0.1)'
          : '8px 10px 20px -5px rgba(0, 0, 0, 0.15), 4px 6px 10px -3px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2, ease: [0, 0, 0.2, 1] }
      }
    },
    
    // Fade with slight slide (subtle page elements)
    fadeSlide: {
      hidden: { 
        opacity: 0,
        y: 20,
        x: 10 * dir,
        transition: { duration: 0.3 }
      },
      visible: { 
        opacity: 1,
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: [0, 0, 0.2, 1] }
      }
    }
  };
  
  return animations[type];
}

/**
 * Get transform origin based on RTL context
 * Useful for scale/rotate animations that should originate from reading direction
 */
export function useRTLTransformOrigin(): string {
  const { isRTL } = useLanguage();
  return isRTL ? 'right center' : 'left center';
}

/**
 * Get directional value (flips sign in RTL)
 * Useful for manual transform calculations
 */
export function useRTLDirection(): number {
  const { isRTL } = useLanguage();
  return isRTL ? -1 : 1;
}

/**
 * CSS class helper for RTL-aware animations
 * Returns appropriate Tailwind animation classes based on direction
 */
export function useRTLAnimationClass(baseClass: string): string {
  const { isRTL } = useLanguage();
  
  const rtlClassMap: Record<string, string> = {
    'slide-in-right': isRTL ? 'slide-in-left' : 'slide-in-right',
    'slide-in-left': isRTL ? 'slide-in-right' : 'slide-in-left',
    'slide-out-right': isRTL ? 'slide-out-left' : 'slide-out-right',
    'slide-out-left': isRTL ? 'slide-out-right' : 'slide-out-left',
  };
  
  return rtlClassMap[baseClass] || baseClass;
}

/**
 * Stagger children animation with RTL awareness
 * Use with framer-motion's staggerChildren
 */
export function useRTLStaggerVariants() {
  const { isRTL } = useLanguage();
  const dir = isRTL ? -1 : 1;
  
  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.1
        }
      }
    },
    item: {
      hidden: { 
        opacity: 0, 
        x: 20 * dir,
        y: 10
      },
      visible: { 
        opacity: 1, 
        x: 0,
        y: 0,
        transition: {
          duration: 0.3,
          ease: [0, 0, 0.2, 1]
        }
      }
    }
  };
}
