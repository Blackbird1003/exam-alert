"use client";

import { useState, useEffect, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  ChevronDown,
  Shield,
  Building2,
  GraduationCap,
  BarChart3,
  Loader2,
} from "lucide-react";
import { adminLogout } from "@/app/admin/actions";
import { toast } from "sonner";
import { Admin } from "@/app/generated/prisma";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: Home,
        description: "Overview & analytics",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Students",
        href: "/admin/student-manage",
        icon: GraduationCap,
        description: "Manage student records",
      },
      {
        title: "Faculty",
        href: "/admin/faculty-manage",
        icon: Building2,
        description: "Manage faculties & departments",
      },
      {
        title: "Exam Schedule",
        href: "/admin/exam-management",
        icon: Calendar,
        description: "Schedule and manage exams",
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "SMS Notifications",
        href: "/admin/sms-noti-panel",
        icon: MessageSquare,
        description: "Send notifications & templates",
      },
      {
        title: "Logs & Reports",
        href: "/admin/sms-log",
        icon: BarChart3,
        description: "View SMS logs and reports",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/admin/settings-side",
        icon: Settings,
        description: "System configuration",
      },
    ],
  },
];

interface AdminSidebarProps {
  className?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const AdminSidebar = memo(function AdminSidebar({
  className,
  collapsed = false,
}: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Main", "Management"])
  );
  const router = useRouter();
  const pathname = usePathname();

  // Load admin data from cookie (client-side)
  useEffect(() => {
    const loadAdmin = () => {
      try {
        const adminCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("admin="));

        if (adminCookie) {
          const adminData = JSON.parse(
            decodeURIComponent(adminCookie.split("=")[1])
          ) as Admin;
          setAdmin(adminData);
        }
      } catch (error) {
        console.error("Failed to load admin data:", error);
      }
    };
    loadAdmin();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { success, message } = await adminLogout();
      if (success) {
        toast.success(message);
        router.push("/admin/login");
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error("An error occurred during logout");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const confirmLogout = () => {
    setShowLogoutDialog(true);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  };

  const getAdminInitials = () => {
    if (!admin?.email) return "AD";
    return admin.email.substring(0, 2).toUpperCase();
  };

  const NavItemComponent = ({
    item,
    isCollapsed = false,
  }: {
    item: NavItem;
    isCollapsed?: boolean;
  }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    const buttonContent = (
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-12 text-left transition-all duration-200 hover:bg-accent/50",
          active &&
            "bg-primary/10 text-primary border border-primary/20 shadow-sm font-medium",
          isCollapsed && "px-2 justify-center"
        )}
        onClick={() => {
          router.push(item.href);
          setIsOpen(false);
        }}
      >
        <Icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{item.title}</div>
              {item.description && (
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {item.description}
                </div>
              )}
            </div>
            {active && (
              <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
            )}
          </>
        )}
      </Button>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-popover border shadow-md"
            >
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

  // Desktop sidebar content
  const SidebarContent = ({
    isCollapsed = false,
  }: {
    isCollapsed?: boolean;
  }) => (
    <div className="flex h-full flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b bg-background/50 backdrop-blur",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin Panel
            </h2>
          </div>
        )}
        {isCollapsed && <Shield className="h-6 w-6 text-primary" />}
      </div>

      {/* Admin Profile Section */}
      {admin && (
        <div className={cn("p-4 border-b bg-accent/20", isCollapsed && "p-2")}>
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}
          >
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src="" alt={admin.email} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getAdminInitials()}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  Administrator
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {admin.email}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className={cn("space-y-1 p-2", !isCollapsed && "p-3")}>
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <Collapsible
                  open={expandedSections.has(section.title)}
                  onOpenChange={() => toggleSection(section.title)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 h-8 text-xs font-medium text-muted-foreground hover:text-foreground px-2"
                    >
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform duration-200",
                          !expandedSections.has(section.title) && "-rotate-90"
                        )}
                      />
                      {section.title}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1">
                    {section.items.map((item) => (
                      <NavItemComponent
                        key={item.href}
                        item={item}
                        isCollapsed={isCollapsed}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
              {isCollapsed && (
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavItemComponent
                      key={item.href}
                      item={item}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Separator */}
      <Separator className="mx-3" />

      {/* Logout */}
      <div className="p-3">
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-12 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-popover border shadow-md"
              >
                <div className="font-medium">Log Out</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Sign out of admin panel
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-left hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={confirmLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium">
                {isLoggingOut ? "Logging out..." : "Log Out"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Sign out of admin panel
              </div>
            </div>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur shadow-md border"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-80 p-0 border-r shadow-xl"
            onInteractOutside={() => setIsOpen(false)}
          >
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex fixed left-0 top-0 z-30 h-full border-r shadow-sm transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-72",
          className
        )}
      >
        <SidebarContent isCollapsed={collapsed} />
      </div>

      {/* Main content spacer for desktop */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-72"
        )}
      />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-destructive" />
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of the admin panel? You&apos;ll
              need to log in again to access the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Log Out"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

// Hook for easier integration in admin pages
export function useAdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return {
    AdminSidebar,
    collapsed,
    setCollapsed,
    toggleCollapse: () => setCollapsed(!collapsed),
  };
}
