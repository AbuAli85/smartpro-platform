import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRTLAnimation } from "@/hooks/useRTLAnimation";
import { RTLIcon } from "./RTLIcon";

/**
 * RTL-Aware Dialog Component
 * 
 * Drop-in replacement for shadcn/ui Dialog with RTL-aware animations.
 * Automatically adjusts slide direction and positioning based on language direction.
 * 
 * @example
 * <RTLDialog open={open} onOpenChange={setOpen}>
 *   <RTLDialogContent>
 *     <RTLDialogHeader>
 *       <RTLDialogTitle>Title</RTLDialogTitle>
 *       <RTLDialogDescription>Description</RTLDialogDescription>
 *     </RTLDialogHeader>
 *     Content here
 *   </RTLDialogContent>
 * </RTLDialog>
 */

const RTLDialog = DialogPrimitive.Root;

const RTLDialogTrigger = DialogPrimitive.Trigger;

const RTLDialogPortal = DialogPrimitive.Portal;

const RTLDialogClose = DialogPrimitive.Close;

const RTLDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
RTLDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface RTLDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Animation type for dialog entrance */
  animationType?: 'modal' | 'slideIn' | 'drawer';
  /** Whether to show close button */
  showClose?: boolean;
}

const RTLDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  RTLDialogContentProps
>(({ className, children, animationType = 'modal', showClose = true, ...props }, ref) => {
  const modalAnimation = useRTLAnimation('modal');
  const slideAnimation = useRTLAnimation('slideInFromSide');
  const drawerAnimation = useRTLAnimation('drawer');
  
  const animation = animationType === 'drawer' 
    ? drawerAnimation 
    : animationType === 'slideIn' 
    ? slideAnimation 
    : modalAnimation;

  return (
    <RTLDialogPortal>
      <RTLDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        asChild
        {...props}
      >
        <motion.div
      // @ts-ignore - Framer Motion typing issue
          variants={animation}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
            animationType === 'drawer' && "left-auto right-0 top-0 h-full max-w-md translate-x-0 translate-y-0 rounded-none",
            className
          )}
        >
          {children}
          {showClose && (
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </RTLDialogPortal>
  );
});
RTLDialogContent.displayName = DialogPrimitive.Content.displayName;

const RTLDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
RTLDialogHeader.displayName = "RTLDialogHeader";

const RTLDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
RTLDialogFooter.displayName = "RTLDialogFooter";

const RTLDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
RTLDialogTitle.displayName = DialogPrimitive.Title.displayName;

const RTLDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
RTLDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  RTLDialog,
  RTLDialogPortal,
  RTLDialogOverlay,
  RTLDialogClose,
  RTLDialogTrigger,
  RTLDialogContent,
  RTLDialogHeader,
  RTLDialogFooter,
  RTLDialogTitle,
  RTLDialogDescription,
};
