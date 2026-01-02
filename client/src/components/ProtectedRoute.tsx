import { ReactNode, useState } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRoleAccess, type RolePermissions } from "@/hooks/useRoleAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProtectedRouteProps {
  children: ReactNode;
  requirePermission?: keyof RolePermissions;
  requireAnyPermission?: (keyof RolePermissions)[];
  requireAllPermissions?: (keyof RolePermissions)[];
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

export function ProtectedRoute({
  children,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  fallbackPath = "/",
  showUnauthorized = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { hasPermission, hasAnyPermission: checkAnyPermission, hasAllPermissions: checkAllPermissions } = useRoleAccess();

  // Wait for auth to load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login required dialog
  if (!user) {
    return <LoginRequiredDialog fallbackPath={fallbackPath} />;
  }

  // Check permissions
  let hasAccess = true;

  if (requirePermission) {
    hasAccess = hasPermission(requirePermission);
  } else if (requireAnyPermission) {
    hasAccess = checkAnyPermission(...requireAnyPermission);
  } else if (requireAllPermissions) {
    hasAccess = checkAllPermissions(...requireAllPermissions);
  }

  // No access - show unauthorized page or redirect
  if (!hasAccess) {
    if (showUnauthorized) {
      return <UnauthorizedPage />;
    }
    return <Redirect to={fallbackPath} />;
  }

  // Has access - render children
  return <>{children}</>;
}

function LoginRequiredDialog({ fallbackPath }: { fallbackPath: string }) {
  const [open, setOpen] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  if (shouldRedirect) {
    return <Redirect to={fallbackPath} />;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setShouldRedirect(true);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-center">Login Required</DialogTitle>
          <DialogDescription className="text-center">
            You need to be logged in to access this feature. Please sign in to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            className="w-full bg-[#003366] hover:bg-[#002244]"
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            onClick={() => setShouldRedirect(true)}
            className="w-full"
          >
            Go Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base">
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This page requires specific permissions that your account doesn't have. 
            If you believe this is an error, please contact your administrator.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full" variant="default">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="w-full" variant="outline">
                View My Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
