import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Building2, FileText, Calendar, User, LogOut, Menu } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function Navigation() {
  const { user, isAuthenticated, loading } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center space-x-2 mr-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-elegant flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">SmartPro</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center space-x-6">
          <Link href="/offices">
            <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sanad Offices
            </a>
          </Link>
          <Link href="/templates">
            <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Document Templates
            </a>
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/bookings">
                <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  My Bookings
                </a>
              </Link>
              <Link href="/my-offices">
                <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  My Offices
                </a>
              </Link>
            </>
          )}
        </div>

        {/* Auth Section */}
        <div className="flex items-center space-x-4 ml-auto">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-offices">
                    <a className="flex items-center w-full">
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>My Offices</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings">
                    <a className="flex items-center w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>My Bookings</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/documents">
                    <a className="flex items-center w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Documents</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          )}

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/offices">
                  <a className="flex items-center w-full">Sanad Offices</a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/templates">
                  <a className="flex items-center w-full">Document Templates</a>
                </Link>
              </DropdownMenuItem>
              {isAuthenticated && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/bookings">
                      <a className="flex items-center w-full">My Bookings</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-offices">
                      <a className="flex items-center w-full">My Offices</a>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
