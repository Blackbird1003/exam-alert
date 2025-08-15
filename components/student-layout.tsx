"use client";

import { StudentSidebar, useStudentSidebar } from "./student-sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { PanelLeft } from "lucide-react";

interface StudentLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function StudentLayout({ children, className }: StudentLayoutProps) {
  const { collapsed, toggleCollapse } = useStudentSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar
        icon={<PanelLeft />}
        text="Dashboard"
        href="/student/dashboard"
        collapsed={collapsed}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="hidden lg:flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-9 w-9"
            >
              <PanelLeft
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  collapsed && "rotate-180"
                )}
              />
            </Button>
            <div className="text-sm text-muted-foreground">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </div>
          </div>

          {/* User icon on the right */}
        </header>

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-auto bg-accent/5",
            "p-4 lg:p-8",
            className
          )}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
