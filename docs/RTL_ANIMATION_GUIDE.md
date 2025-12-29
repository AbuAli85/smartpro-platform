# RTL Animation Implementation Guide
**Created:** December 30, 2025  
**Purpose:** Comprehensive guide for implementing RTL-aware animations in SmartPro Platform

---

## Overview

This guide documents the RTL-aware animation system implemented to provide a native Arabic experience. All animations respect the reading direction and create a natural flow for RTL users.

---

## Core Components

### 1. `useRTLAnimation` Hook

**Location:** `client/src/hooks/useRTLAnimation.ts`

**Purpose:** Provides directional animation variants that automatically flip based on language direction.

**Animation Types:**
- `slideIn` - Slide in from natural reading direction
- `slideOut` - Slide out to natural reading direction
- `slideInFromSide` - Drawer-like slide from side
- `slideOutToSide` - Slide out to side
- `drawer` - Full drawer animation
- `modal` - Center-based modal animation
- `toast` - Toast notification slide
- `dropdown` - Dropdown menu animation
- `pageTransition` - Full page transition
- `cardHover` - Card hover effect with directional shadow
- `fadeSlide` - Subtle fade with slide

**Usage Example:**
```typescript
import { useRTLAnimation } from "@/hooks/useRTLAnimation";
import { motion } from "framer-motion";

function MyComponent() {
  const slideIn = useRTLAnimation('slideIn');
  
  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      Content here
    </motion.div>
  );
}
```

**Helper Functions:**
- `useRTLTransformOrigin()` - Get transform origin based on RTL context
- `useRTLDirection()` - Get directional multiplier (-1 for RTL, 1 for LTR)
- `useRTLAnimationClass(baseClass)` - Get RTL-aware CSS class
- `useRTLStaggerVariants()` - Stagger children animation with RTL awareness

---

### 2. `RTLIcon` Component

**Location:** `client/src/components/RTLIcon.tsx`

**Purpose:** Automatically flips directional icons in RTL mode.

**Usage Example:**
```typescript
import { RTLIcon } from "@/components/RTLIcon";
import { ChevronRight, ArrowRight, Search } from "lucide-react";

// Directional icon (will flip in RTL)
<RTLIcon icon={ChevronRight} className="w-4 h-4" />

// Always flip
<RTLIcon icon={ArrowRight} flip="always" />

// Never flip (non-directional)
<RTLIcon icon={Search} flip="never" />
```

**Helper Functions:**
- `withRTL(IconComponent, flipMode)` - HOC to make any icon RTL-aware
- `getRTLIconClass(isRTL, flip)` - CSS class helper
- `useRTLIconStyle(flip)` - Hook for inline styles
- `isDirectionalIcon(iconName)` - Detect if icon is directional

**Directional Icons List:**
- arrow, chevron, angle, caret
- forward, backward, next, previous
- left, right, start, end
- redo, undo, reply, share
- send, enter, exit
- signin, signout, login, logout

---

### 3. `RTLDialog` Component

**Location:** `client/src/components/RTLDialog.tsx`

**Purpose:** Drop-in replacement for shadcn/ui Dialog with RTL-aware animations.

**Usage Example:**
```typescript
import {
  RTLDialog,
  RTLDialogContent,
  RTLDialogHeader,
  RTLDialogTitle,
  RTLDialogDescription,
  RTLDialogFooter,
  RTLDialogTrigger,
  RTLDialogClose,
} from "@/components/RTLDialog";

function MyDialog() {
  return (
    <RTLDialog open={open} onOpenChange={setOpen}>
      <RTLDialogTrigger>Open Dialog</RTLDialogTrigger>
      <RTLDialogContent animationType="modal">
        <RTLDialogHeader>
          <RTLDialogTitle>Dialog Title</RTLDialogTitle>
          <RTLDialogDescription>
            Dialog description text
          </RTLDialogDescription>
        </RTLDialogHeader>
        
        <div>Dialog content here</div>
        
        <RTLDialogFooter>
          <RTLDialogClose>Cancel</RTLDialogClose>
          <Button>Confirm</Button>
        </RTLDialogFooter>
      </RTLDialogContent>
    </RTLDialog>
  );
}
```

**Animation Types:**
- `modal` (default) - Scale + fade from center
- `slideIn` - Slide from side
- `drawer` - Full-height drawer from side

**Props:**
- `animationType` - Animation style
- `showClose` - Show/hide close button (default: true)

---

### 4. `RTLToast` Component

**Location:** `client/src/components/RTLToast.tsx`

**Purpose:** Toast notification system with RTL-aware positioning and animations.

**Usage Example:**
```typescript
import { useRTLToast } from "@/components/RTLToast";

function MyComponent() {
  const { toast } = useRTLToast();
  
  const showToast = () => {
    toast({
      title: "Success",
      description: "Your changes have been saved.",
      variant: "default" // or "destructive", "success", "warning"
    });
  };
  
  return <button onClick={showToast}>Show Toast</button>;
}
```

**Variants:**
- `default` - Standard background
- `destructive` - Error/danger state
- `success` - Success state (green)
- `warning` - Warning state (yellow)

**Features:**
- Automatic positioning based on language direction
- RTL-aware slide animations
- Close button positioned correctly for RTL
- Swipe-to-dismiss support

---

## Implementation Patterns

### Pattern 1: Simple Slide Animation

```typescript
import { motion } from "framer-motion";
import { useRTLAnimation } from "@/hooks/useRTLAnimation";

function Card() {
  const slideIn = useRTLAnimation('slideIn');
  
  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      animate="visible"
    >
      Card content
    </motion.div>
  );
}
```

### Pattern 2: List with Stagger

```typescript
import { motion } from "framer-motion";
import { useRTLStaggerVariants } from "@/hooks/useRTLAnimation";

function List({ items }) {
  const { container, item } = useRTLStaggerVariants();
  
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.li key={item.id} variants={item}>
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Pattern 3: Card Hover Effect

```typescript
import { motion } from "framer-motion";
import { useRTLAnimation } from "@/hooks/useRTLAnimation";

function HoverCard() {
  const cardHover = useRTLAnimation('cardHover');
  
  return (
    <motion.div
      variants={cardHover}
      initial="hidden"
      whileHover="visible"
      className="p-4 rounded-lg"
    >
      Hover over me
    </motion.div>
  );
}
```

### Pattern 4: Page Transition

```typescript
import { motion, AnimatePresence } from "framer-motion";
import { useRTLAnimation } from "@/hooks/useRTLAnimation";

function PageWrapper({ children }) {
  const pageTransition = useRTLAnimation('pageTransition');
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Pattern 5: Directional Icon

```typescript
import { RTLIcon } from "@/components/RTLIcon";
import { ChevronRight } from "lucide-react";

function NavigationButton() {
  return (
    <button className="flex items-center gap-2">
      <span>Next</span>
      <RTLIcon icon={ChevronRight} className="w-4 h-4" />
    </button>
  );
}
```

---

## Migration Guide

### Replacing Standard Components

#### Before (Standard Dialog):
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

#### After (RTL Dialog):
```typescript
import {
  RTLDialog,
  RTLDialogContent,
  RTLDialogHeader,
  RTLDialogTitle,
} from "@/components/RTLDialog";

<RTLDialog open={open} onOpenChange={setOpen}>
  <RTLDialogContent>
    <RTLDialogHeader>
      <RTLDialogTitle>Title</RTLDialogTitle>
    </RTLDialogHeader>
  </RTLDialogContent>
</RTLDialog>
```

#### Before (Standard Toast):
```typescript
import { useToast } from "@/components/ui/use-toast";

const { toast } = useToast();
toast({ title: "Success" });
```

#### After (RTL Toast):
```typescript
import { useRTLToast } from "@/components/RTLToast";

const { toast } = useRTLToast();
toast({ title: "Success" });
```

---

## Best Practices

### 1. Always Use RTL-Aware Components

❌ **Don't:**
```typescript
<motion.div
  initial={{ x: -50, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
>
  Content
</motion.div>
```

✅ **Do:**
```typescript
const slideIn = useRTLAnimation('slideIn');

<motion.div
  variants={slideIn}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>
```

### 2. Flip Directional Icons

❌ **Don't:**
```typescript
<ChevronRight className="w-4 h-4" />
```

✅ **Do:**
```typescript
<RTLIcon icon={ChevronRight} className="w-4 h-4" />
```

### 3. Use Semantic Animation Names

❌ **Don't:**
```typescript
const animation = useRTLAnimation('slideInFromSide');
// Used for modal
```

✅ **Do:**
```typescript
const animation = useRTLAnimation('modal');
// Clear intent
```

### 4. Consider Transform Origin

❌ **Don't:**
```typescript
<motion.div style={{ transformOrigin: 'left center' }}>
  Content
</motion.div>
```

✅ **Do:**
```typescript
const origin = useRTLTransformOrigin();

<motion.div style={{ transformOrigin: origin }}>
  Content
</motion.div>
```

### 5. Test in Both Directions

Always test animations in both LTR and RTL modes to ensure they feel natural:

```typescript
// Test checklist:
// ✓ Slide direction feels natural
// ✓ Icons point in correct direction
// ✓ Shadows cast appropriately
// ✓ Transform origin is correct
// ✓ Timing feels consistent
```

---

## Animation Timing Guidelines

### Duration Standards

- **Micro-interactions:** 150-200ms (hover, focus)
- **Standard transitions:** 250-300ms (slide, fade)
- **Modal/dialog:** 200-250ms (enter), 150-200ms (exit)
- **Page transitions:** 300-400ms
- **Toast notifications:** 300ms (enter), 200ms (exit)

### Easing Functions

```typescript
// Recommended easing curves
const easing = {
  // Standard ease-out for most animations
  standard: [0.4, 0, 0.2, 1],
  
  // Ease-in for exit animations
  exit: [0.4, 0, 1, 1],
  
  // Ease-in-out for smooth transitions
  smooth: [0.4, 0, 0.6, 1],
  
  // Bounce for playful interactions
  bounce: [0.68, -0.55, 0.265, 1.55],
};
```

---

## Performance Considerations

### 1. Use `will-change` Sparingly

```typescript
// Only for frequently animated elements
<motion.div style={{ willChange: 'transform, opacity' }}>
  Content
</motion.div>
```

### 2. Prefer Transform Over Position

❌ **Don't:**
```typescript
animate={{ left: 100 }}
```

✅ **Do:**
```typescript
animate={{ x: 100 }}
```

### 3. Batch Animations

```typescript
// Animate multiple properties together
animate={{ 
  x: 0, 
  opacity: 1,
  scale: 1 
}}
```

### 4. Use `AnimatePresence` for Exit Animations

```typescript
<AnimatePresence mode="wait">
  {show && (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

---

## Accessibility

### 1. Respect `prefers-reduced-motion`

```typescript
import { useReducedMotion } from "framer-motion";

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  const variants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : useRTLAnimation('slideIn');
  
  return (
    <motion.div variants={variants}>
      Content
    </motion.div>
  );
}
```

### 2. Maintain Focus Visibility

```typescript
// Ensure focus rings are visible during animations
<motion.button
  whileHover={{ scale: 1.05 }}
  whileFocus={{ scale: 1.05 }}
  className="focus:ring-2 focus:ring-primary"
>
  Button
</motion.button>
```

### 3. Provide Alternative Feedback

```typescript
// For users with reduced motion, provide instant feedback
const handleClick = () => {
  if (shouldReduceMotion) {
    // Instant feedback
    toast({ title: "Success" });
  } else {
    // Animated feedback
    animateSuccess();
  }
};
```

---

## Testing Checklist

### Visual Testing

- [ ] Animations slide from correct direction in RTL
- [ ] Icons flip appropriately
- [ ] Shadows cast in natural direction
- [ ] Transform origins are correct
- [ ] Timing feels natural
- [ ] No layout shifts during animation

### Functional Testing

- [ ] Animations complete successfully
- [ ] Exit animations work correctly
- [ ] Stagger animations maintain order
- [ ] Toast notifications position correctly
- [ ] Dialogs center properly
- [ ] Drawers slide from correct side

### Performance Testing

- [ ] No jank or stuttering
- [ ] Smooth 60fps animations
- [ ] No memory leaks
- [ ] Reduced motion works
- [ ] Mobile performance acceptable

### Cross-Browser Testing

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## Troubleshooting

### Issue: Animation slides from wrong direction

**Solution:** Ensure you're using `useRTLAnimation` hook instead of hardcoded values.

```typescript
// ❌ Wrong
animate={{ x: -50 }}

// ✅ Correct
const slideIn = useRTLAnimation('slideIn');
<motion.div variants={slideIn} />
```

### Issue: Icon not flipping

**Solution:** Use `RTLIcon` component or add flip class.

```typescript
// ❌ Wrong
<ChevronRight />

// ✅ Correct
<RTLIcon icon={ChevronRight} />
```

### Issue: Toast appears on wrong side

**Solution:** Use `RTLToast` components instead of standard toast.

```typescript
// ❌ Wrong
import { useToast } from "@/components/ui/use-toast";

// ✅ Correct
import { useRTLToast } from "@/components/RTLToast";
```

### Issue: Animation feels unnatural in RTL

**Solution:** Check transform origin and directional multiplier.

```typescript
const origin = useRTLTransformOrigin();
const dir = useRTLDirection();

<motion.div 
  style={{ transformOrigin: origin }}
  animate={{ x: 50 * dir }}
/>
```

---

## Future Enhancements

### Planned Features

1. **Auto-detection of directional icons** - Automatically flip icons based on name
2. **Animation presets library** - Pre-built animation combinations
3. **Visual animation editor** - GUI for creating custom animations
4. **Performance monitoring** - Track animation performance metrics
5. **A/B testing framework** - Test different animation styles

### Experimental Features

1. **Gesture-based animations** - Swipe and drag with RTL awareness
2. **3D transforms** - Perspective and rotation with RTL
3. **Path animations** - SVG path animations with direction
4. **Physics-based animations** - Spring and inertia with RTL

---

## Resources

### Documentation

- [Framer Motion Docs](https://www.framer.com/motion/)
- [RTL Best Practices](https://rtlstyling.com/)
- [Animation Principles](https://material.io/design/motion/)

### Tools

- [Framer Motion DevTools](https://www.framer.com/motion/devtools/)
- [Animation Inspector](https://developer.chrome.com/docs/devtools/css/animations/)

### Examples

- See `client/src/components/RTL*.tsx` for implementation examples
- Check `client/src/hooks/useRTLAnimation.ts` for animation variants

---

## Support

For questions or issues with RTL animations:

1. Check this documentation first
2. Review implementation examples in codebase
3. Test in both LTR and RTL modes
4. Consult Framer Motion documentation
5. Create issue with reproduction steps

---

**Last Updated:** December 30, 2025  
**Version:** 1.0.0  
**Maintainer:** SmartPro Development Team
