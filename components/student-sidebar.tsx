"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  CalendarDays,
  Settings,
  LogOut,
  User,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { studentLogout } from "@/app/student/actions";
import { toast } from "sonner";

interface StudentSidebarProps {
  collapsed?: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/student/dashboard",
    icon: Home,
    description: "Overview of activities",
  },
  {
    title: "Timetable",
    href: "/student/timetable-page",
    icon: CalendarDays,
    description: "View your exam schedule",
  },
  {
    title: "Settings",
    href: "/student/settings-student",
    icon: Settings,
    description: "Manage account preferences",
  },
  {
    title: "Profile",
    href: "/student/settings-student/profile",
    icon: User,
    description: "Edit profile & password",
  },
];

/**
 * ✅ Custom hook for sidebar state
 */
export function useStudentSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return { collapsed, toggleCollapse };
}

export function StudentSidebar({ collapsed = false }: StudentSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { success, message } = await studentLogout();
      if (success) {
        toast.success(message);
        router.push("/student/login");
      } else {
        toast.error(message);
      }
    } catch {
      toast.error("Error during logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    const buttonContent = (
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-12 text-left transition-all duration-200 hover:bg-accent/50",
          active &&
            "bg-primary/10 text-primary border border-primary/20 shadow-sm font-medium",
          collapsed && "px-2 justify-center"
        )}
        onClick={() => router.push(item.href)}
      >
        <Icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{item.title}</div>
            {item.description && (
              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                {item.description}
              </div>
            )}
          </div>
        )}
      </Button>
    );

    if (collapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent side="right">
              <div className="font-medium">{item.title}</div>
              {item.description && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonContent;
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r shadow-sm transition-all duration-300",
        collapsed ? "w-16" : "w-72"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b bg-background/50 backdrop-blur",
          collapsed ? "justify-center px-2" : "justify-start px-4"
        )}
      >
        {collapsed ? (
          <GraduationCap className="h-6 w-6 text-primary" />
        ) : (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Student Panel
            </h2>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-2">
          {navItems.map((item) => (
            <NavItemComponent key={item.href} item={item} />
          ))}
        </nav>
      </ScrollArea>

      <Separator className="mx-3" />

      {/* Logout */}
      <div className="p-3">
        {collapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-12 hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="font-medium">Logout</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Exit student panel
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-left hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Exit student panel
              </div>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
