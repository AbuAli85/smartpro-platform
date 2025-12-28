import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Building2, FileText, Calendar, User, LogOut, Menu, X, Home, Briefcase, Award, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";

export function SwipeableNavigation() {
  const { user, isAuthenticated, loading } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  // Swipe handlers for mobile menu
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setIsMenuOpen(false),
    onSwipedRight: () => setIsMenuOpen(true),
    trackMouse: false,
    trackTouch: true,
    delta: 50, // Minimum swipe distance
  });

  const menuSwipeHandlers = useSwipeable({
    onSwipedLeft: () => setIsMenuOpen(false),
    trackMouse: false,
    trackTouch: true,
    delta: 30,
  });

  return (
    <>
      <nav 
        {...swipeHandlers}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-14 sm:h-16 items-center px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mr-8">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-elegant flex items-center justify-center">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl hidden sm:inline-block">SmartPro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 items-center space-x-4 xl:space-x-6">
            <Link href="/offices" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Sanad Offices
            </Link>
            <Link href="/templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Document Templates
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/bookings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  My Bookings
                </Link>
                <Link href="/my-offices" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  My Offices
                </Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="hidden lg:flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button asChild variant="default" size="sm" className="hidden lg:flex">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Slide-out Menu */}
        <div
          {...menuSwipeHandlers}
          className={cn(
            "absolute top-0 left-0 h-full w-[280px] bg-background border-r border-border shadow-xl transition-transform duration-300 ease-out",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-elegant flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">SmartPro</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-elegant flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-4 space-y-1">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                <Home className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Home</span>
              </div>
            </Link>
            
            <Link href="/offices" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Sanad Offices</span>
              </div>
            </Link>
            
            <Link href="/templates" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Document Templates</span>
              </div>
            </Link>

            {isAuthenticated && (
              <>
                <Link href="/bookings" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">My Bookings</span>
                  </div>
                </Link>
                
                <Link href="/my-offices" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">My Offices</span>
                  </div>
                </Link>

                <Link href="/marketplace" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Marketplace</span>
                  </div>
                </Link>

                <Link href="/owner/chat" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Chat</span>
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* Auth Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
