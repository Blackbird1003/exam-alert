"use client";

import { Student } from "@/app/generated/prisma";
import { studentLogout } from "../actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { StudentLayout } from "@/components/student-layout";

import { Menu, User } from "lucide-react"; // Icons

// Sample exam data (replace with real data from your DB)
const mockExams = [
  {
    id: 1,
    date: "2025-09-10",
    time: "10:00 AM",
    courseCode: "CSC201",
    hall: "science complex hall 2",
    bgColor: "bg-[#FEE2E2]", // red-ish background
  },
  {
    id: 2,
    date: "2025-09-12",
    time: "2:00 PM",
    courseCode: "CSC205",

    hall: "science complex hall 1",
    bgColor: "bg-[#D1FAE5]", // green-ish background
  },
  {
    id: 3,
    date: "2025-09-14",
    time: "9:00 AM",
    courseCode: "CSC210",

    hall: "science complex hall 3",
    bgColor: "bg-[#DBEAFE]", // blue-ish background
  },
  {
    id: 4,
    date: "2025-09-16",
    time: "1:00 PM",
    courseCode: "CSC220",
    courseTitle: "Computer Networks",
    hall: "science room hall 2",
    bgColor: "bg-[#FEF9C3]", // yellow-ish background
  },
];

export default function DashboardClient({ student }: { student: Student }) {
  const router = useRouter();
  const [exams] = useState(mockExams);

  const handleLogout = async () => {
    const { success, message } = await studentLogout();
    if (success) {
      toast.success(message);
      router.push("/student/login");
    } else {
      toast.error(message);
    }
  };

  return (
    <StudentLayout>
      <div className="min-h-screen  px-4 py-6">
        <header className="">
          <h1 className="text-xl md:text-2xl font-bold">
            Welcome, {student.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Your upcoming exams are listed below
          </p>
        </header>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className={`rounded-xl p-4 shadow-md ${exam.bgColor} cursor-pointer hover:shadow-lg transition`}
              onClick={() => router.push(`/student/exams/${exam.id}`)}
            >
              <p className="text-sm text-gray-600">
                {exam.date} • {exam.time}
              </p>
              <h2 className="text-lg font-bold mt-1">{exam.courseCode}</h2>
              <p className="text-gray-700">{exam.hall}</p>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
