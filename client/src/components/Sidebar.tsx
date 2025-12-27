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
  MessageCircle,
  TrendingUp,
  MessageSquareText,
  Users,
  Activity,
  Clock,
  Languages,
  Bell,
  Zap,
  BookOpen,
  Package,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { NotificationBadge } from "@/components/NotificationBadge";
import { NotificationDropdown } from "./NotificationDropdown";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConnectionStatusIndicator } from "./ConnectionStatusIndicator";
import { useRoleAccess } from "@/hooks/useRoleAccess";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { t } = useLanguage();
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission, hasRole } = useRoleAccess();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (!isMobileOpen && window.innerWidth < 1024) {
        setIsMobileOpen(true);
      }
    },
    onSwipedLeft: () => {
      if (isMobileOpen) {
        setIsMobileOpen(false);
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50, // Minimum swipe distance
    preventScrollOnSwipe: true,
  });
  
  // Fetch notification counts
  const { data: notificationCounts } = trpc.auth.getNotificationCounts.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 30000 } // Refetch every 30 seconds
  );

  // Define navigation item type
  type NavItem = {
    name: string;
    href: string;
    icon: any;
    requiresAuth?: boolean;
    requirePermission?: any; // Use any to avoid type conflicts with permission keys
  };

  type NavGroup = {
    title: string;
    requiresAuth?: boolean;
    requirePermission?: string;
    items: NavItem[];
  };

  // Organize navigation into logical groups
  const navigationGroups: NavGroup[] = [
    {
      title: "Main",
      items: [
        { name: t("nav.home"), href: "/", icon: Home },
        { name: t("nav.sanadOffices"), href: "/offices", icon: Building2 },
        { name: t("nav.documentTemplates"), href: "/templates", icon: FileText, requirePermission: "canViewTemplates" as const },
      ],
    },
    {
      title: "My Services",
      requiresAuth: true,
      items: [
        { name: t("nav.myBookings"), href: "/bookings", icon: Calendar, requiresAuth: true, requirePermission: "canCreateBooking" as const },
        { name: "My Service Requests", href: "/my-requests", icon: Package, requiresAuth: true, requirePermission: "canPostServiceRequest" as const },
        { name: "Browse Marketplace", href: "/marketplace", icon: Search, requiresAuth: true, requirePermission: "canSubmitBids" as const },
      ],
    },
    {
      title: "Office Management",
      requiresAuth: true,
      requirePermission: "canManageOffice" as const,
      items: [
        { name: t("nav.myOffices"), href: "/my-offices", icon: Briefcase, requiresAuth: true, requirePermission: "canManageOffice" as const },
        { name: t("nav.ownerDashboard"), href: "/owner/dashboard", icon: Shield, requiresAuth: true, requirePermission: "canViewOfficeAnalytics" as const },
        { name: "Office Analytics", href: "/owner/analytics", icon: BarChart3, requiresAuth: true, requirePermission: "canViewOfficeAnalytics" as const },
        { name: t("nav.chatInbox"), href: "/owner/chat", icon: MessageCircle, requiresAuth: true, requirePermission: "canAccessChatInbox" as const },
        { name: t("nav.chatAnalytics"), href: "/owner/chat-analytics", icon: TrendingUp, requiresAuth: true, requirePermission: "canViewChatAnalytics" as const },
        { name: t("nav.cannedResponses"), href: "/owner/canned-responses", icon: MessageSquareText, requiresAuth: true, requirePermission: "canManageCannedResponses" as const },
        { name: t("nav.staffManagement"), href: "/owner/staff", icon: Users, requiresAuth: true, requirePermission: "canManageStaff" as const },
        { name: t("nav.staffPerformance"), href: "/owner/staff-performance", icon: Activity, requiresAuth: true, requirePermission: "canManageStaff" as const },
        { name: t("nav.followUpSettings"), href: "/owner/follow-up-settings", icon: Clock, requiresAuth: true, requirePermission: "canManageOffice" as const },
      ],
    },
    {
      title: "Rewards & Profile",
      requiresAuth: true,
      items: [
        { name: t("nav.loyaltyRewards"), href: "/loyalty", icon: Award, requiresAuth: true },
        { name: t("nav.referFriends"), href: "/refer", icon: Gift, requiresAuth: true },
        { name: t("nav.userProfile"), href: "/profile", icon: User, requiresAuth: true },
        { name: t("nav.notificationPreferences"), href: "/notifications", icon: Bell, requiresAuth: true },
      ],
    },
  ];

  // Flatten for backward compatibility
  const navigation: NavItem[] = navigationGroups.flatMap(group => group.items);

  // Add admin links if user has admin permissions
  if (hasPermission("canAccessAdminPanel")) {
    navigation.push({ name: t("nav.adminDashboard"), href: "/admin", icon: Shield, requiresAuth: true });
    navigation.push({ name: "User Management", href: "/admin/users", icon: Users, requiresAuth: true });
    navigation.push({ name: "Office Verification", href: "/admin/office-verification", icon: Building2, requiresAuth: true });
    navigation.push({ name: t("nav.adminAnalytics"), href: "/admin/analytics", icon: BarChart3, requiresAuth: true });
    navigation.push({ name: t("nav.contentTranslation"), href: "/admin/translations", icon: Languages, requiresAuth: true });
    navigation.push({ name: "Translation Requests", href: "/admin/translation-requests", icon: MessageSquareText, requiresAuth: true });
    navigation.push({ name: "Translation Analytics", href: "/admin/translation-analytics", icon: TrendingUp, requiresAuth: true });
    navigation.push({ name: "Translation Quality", href: "/admin/translation-quality", icon: Activity, requiresAuth: true });
    navigation.push({ name: "Review Queue", href: "/admin/review-queue", icon: MessageSquareText, requiresAuth: true });
    navigation.push({ name: "Batch Processing", href: "/admin/batch-processing", icon: Zap, requiresAuth: true });
    navigation.push({ name: "Translator Training", href: "/admin/training", icon: BookOpen, requiresAuth: true });
  }

  const filteredNavigation = navigation.filter((item) => {
    // Filter by auth requirement
    if (item.requiresAuth && !user) return false;
    
    // Filter by permission requirement
    if (item.requirePermission && !hasPermission(item.requirePermission as any)) return false;
    
    return true;
  });

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
        <div className="p-4 border-b border-border space-y-3">
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
          {!isCollapsed && (
            <div className="flex justify-center">
              <ConnectionStatusIndicator />
            </div>
          )}
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

      {/* Swipe Area for Opening Sidebar */}
      <div
        {...swipeHandlers}
        className="lg:hidden fixed left-0 top-0 bottom-0 w-8 z-30"
        style={{ touchAction: 'pan-y' }}
      />

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
        {...swipeHandlers}
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
