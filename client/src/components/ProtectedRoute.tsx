import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRoleAccess, type RolePermissions } from "@/hooks/useRoleAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

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
  const { user } = useAuth();
  const { hasPermission, hasAnyPermission: checkAnyPermission, hasAllPermissions: checkAllPermissions } = useRoleAccess();

  // Not logged in - redirect to home
  if (!user) {
    return <Redirect to={fallbackPath} />;
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
