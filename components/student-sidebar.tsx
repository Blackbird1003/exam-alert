"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, CalendarDays, Bell, Settings, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { studentLogout } from "@/app/student/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useStudentSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed(!collapsed);
  return { collapsed, toggleCollapse };
}

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  collapsed: boolean;
  href?: string; // now optional
  onClick?: () => void; // new prop
}

export function StudentSidebar({
  icon,
  text,
  collapsed,
  href,
  onClick,
}: SidebarItemProps) {
  const router = useRouter();
  return (
    <aside
      className={cn(
        "h-screen border-r bg-background transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-2 py-4 space-y-2">
          <SidebarItem
            icon={<Home className="h-5 w-5" />}
            text="Dashboard"
            collapsed={collapsed}
            onClick={() => router.push("/student/dashboard")}
          />
          <SidebarItem
            icon={<CalendarDays className="h-5 w-5" />}
            text="Timetable"
            collapsed={collapsed}
            onClick={() => router.push("/student/timetable-page")}
          />
          <SidebarItem
            icon={<Bell className="h-5 w-5" />}
            text="Reminder"
            collapsed={collapsed}
            onClick={() => router.push("/student/my-reminders")}
          />
          <SidebarItem
            icon={<Settings className="h-5 w-5" />}
            text="Settings"
            collapsed={collapsed}
            onClick={() => router.push("/student/settings-student")}
          />
          {/* Added Profile item */}
          <SidebarItem
            icon={<User className="h-5 w-5" />}
            text="Profile"
            collapsed={collapsed}
            onClick={() => router.push("/student/settings-student/profile")}
          />
        </nav>
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={async () => {
              const { success, message } = await studentLogout();
              if (success) {
                toast.success(message);
                router.push("/student/login");
              } else {
                toast.error(message);
              }
            }}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  text,
  collapsed,
  href,
  onClick,
}) => {
  const content = (
    <div
      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
      onClick={onClick}
    >
      {icon}
      {!collapsed && <span className="ml-3">{text}</span>}
    </div>
  );

  // If href exists, wrap in Link; else just return clickable div
  return href ? <Link href={href}>{content}</Link> : content;
};
