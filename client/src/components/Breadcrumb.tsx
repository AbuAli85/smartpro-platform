import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}
    >
      <Link href="/">
        <div className="flex items-center hover:text-foreground transition-colors cursor-pointer">
          <Home className="h-4 w-4" />
        </div>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4" />
            {item.href && !isLast ? (
              <Link href={item.href}>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  {item.label}
                </span>
              </Link>
            ) : (
              <span className={cn(isLast && "text-foreground font-medium")}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
