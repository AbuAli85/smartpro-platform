import { Link, useLocation } from "wouter";
import { Home, Calendar, MessageCircle, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useNotifications } from "@/contexts/NotificationContext";

export function BottomNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Get notification counts from context
  const { bookingCount } = useNotifications();

  if (!user) return null;

  const navItems = [
    {
      icon: Home,
      label: t("nav.home"),
      href: "/",
    },
    {
      icon: Calendar,
      label: t("nav.myBookings"),
      href: "/bookings",
      badge: bookingCount,
    },
    {
      icon: MessageCircle,
      label: t("nav.chatInbox"),
      href: "/chat",
    },
    {
      icon: Building2,
      label: t("nav.marketplace"),
      href: "/marketplace",
    },
    {
      icon: User,
      label: t("nav.profile"),
      href: "/profile",
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px] relative",
                  isActive
                    ? "text-[#003366]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    "h-6 w-6",
                    isActive && "fill-current"
                  )} />
                  {item.badge && item.badge > 0 && (
                    <NotificationBadge count={item.badge} />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
