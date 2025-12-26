import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2,
  FileText,
  Calendar,
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Shield,
  Award,
  Gift,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { NotificationBadge } from "@/components/NotificationBadge";
import { NotificationDropdown } from "./NotificationDropdown";
import { LanguageToggle } from "./LanguageToggle";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Fetch notification counts
  const { data: notificationCounts } = trpc.auth.getNotificationCounts.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 30000 } // Refetch every 30 seconds
  );

  const navigation = [
    { name: t("nav.home"), href: "/", icon: Home },
    { name: t("nav.offices"), href: "/offices", icon: Building2 },
    { name: t("nav.documents"), href: "/templates", icon: FileText },
    { name: t("nav.bookings"), href: "/bookings", icon: Calendar, requiresAuth: true },
    { name: t("nav.myOffices"), href: "/my-offices", icon: Briefcase, requiresAuth: true },
    { name: t("nav.loyalty"), href: "/loyalty", icon: Award, requiresAuth: true },
    { name: t("nav.refer"), href: "/refer", icon: Gift, requiresAuth: true },
    { name: t("nav.analytics"), href: "/analytics", icon: BarChart3, requiresAuth: true },
    { name: t("nav.profile"), href: "/profile", icon: User, requiresAuth: true },
  ];

  // Add admin link if user is admin
  if (user?.role === "admin") {
    navigation.push({ name: t("nav.adminDashboard"), href: "/admin", icon: Shield, requiresAuth: true });
    navigation.push({ name: t("nav.adminAnalytics"), href: "/admin/analytics", icon: BarChart3, requiresAuth: true });
  }

  const filteredNavigation = navigation.filter((item) => !item.requiresAuth || user);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = () => (
    <>
      {/* Logo/Brand */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#004488] flex items-center justify-center">
              <span className="text-white font-bold text-lg">SP</span>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-foreground">SmartPro</h1>
                <p className="text-xs text-muted-foreground">Business Services</p>
              </div>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {user && <NotificationDropdown />}
          <Button
            variant="ghost"
            size="icon"
            className="lg:flex hidden"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-[#003366] to-[#004488] text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer relative",
                    isActive
                      ? "bg-[#003366] text-white"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {item.name === "My Bookings" && notificationCounts?.bookings && (
                      <NotificationBadge count={notificationCounts.bookings} />
                    )}
                  </div>
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Logout Button */}
      {user && (
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-foreground",
              isCollapsed && "justify-center"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">{t("nav.logout")}</span>}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          className
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
