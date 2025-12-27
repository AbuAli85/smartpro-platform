import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmDialogVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <Trash2 className="h-6 w-6 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case "info":
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case "danger":
        return "bg-destructive hover:bg-destructive/90";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "info":
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn(
              "rounded-full p-3",
              variant === "danger" && "bg-destructive/10",
              variant === "warning" && "bg-yellow-100",
              variant === "info" && "bg-blue-100"
            )}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-sm">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className={getButtonClass()}
          >
            {loading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Omit<ConfirmDialogProps, "open" | "onOpenChange">>({
    onConfirm: () => {},
    title: "",
    description: "",
  });

  const confirm = (props: Omit<ConfirmDialogProps, "open" | "onOpenChange">) => {
    setConfig(props);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      const originalOnConfirm = props.onConfirm;
      setConfig({
        ...props,
        onConfirm: () => {
          originalOnConfirm();
          resolve(true);
          setIsOpen(false);
        },
      });
    });
  };

  const dialog = (
    <ConfirmDialog
      {...config}
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // User cancelled
        }
      }}
    />
  );

  return { confirm, dialog };
}
