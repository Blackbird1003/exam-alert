// app/student/timetable/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StudentLayout } from "@/components/student-layout";
import { useState } from "react";

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

export default function TimetablePage() {
  const router = useRouter();
  const [exams] = useState(mockExams);

  return (
    <StudentLayout>
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <header className="">
          <h1 className="text-xl md:text-2xl font-bold">Timetable</h1>
          <p className="text-muted-foreground mt-1">
            View your upcoming exams and schedule
          </p>
        </header>
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
      </main>
    </StudentLayout>
  );
}
