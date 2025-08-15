"use client";

import { KeyRound, GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { StudentLayout } from "@/components/student-layout";

export default function SMSNotificationPanel() {
  const router = useRouter();
  return (
    <StudentLayout>
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <header className="">
          <h1 className="text-xl md:text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </header>

        {/* SMS Template */}

        <Button
          variant="ghost"
          className="w-full flex justify-start gap-3"
          onClick={() => router.push("/student/settings-student/password")}
        >
          <KeyRound className="h-5 w-5" />
          Password
        </Button>

        <Button
          variant="ghost"
          className="w-full flex justify-start gap-3"
          onClick={() => router.push("/student/settings-student/profile")}
        >
          <GraduationCap className="h-5 w-5" />
          Profile
        </Button>

        <Button
          variant="ghost"
          className="w-full flex justify-start gap-3"
          onClick={() => router.push("/student/login")}
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
      </main>
    </StudentLayout>
  );
}
