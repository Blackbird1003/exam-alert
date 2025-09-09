"use client";

import { Student } from "@/app/generated/prisma";
import { getStudentExams, getStudentNotifications } from "../actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { StudentLayout } from "@/components/student-layout";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock } from "lucide-react";


type ExamData = {
  id: string;
  courseCode: string;
  courseTitle: string;
  examDate: Date | null;
  examTime: string | null;
  hall: {
    name: string;
  } | null;
  timeTableName: string;
  timeTableSession: string;
  faculty: string;
};

const bgColors = [
  "bg-[#FEE2E2]", // red-ish background
  "bg-[#D1FAE5]", // green-ish background
  "bg-[#DBEAFE]", // blue-ish background
  "bg-[#FEF9C3]", // yellow-ish background
  "bg-[#F3E8FF]", // purple-ish background
  "bg-[#FEF3C7]", // orange-ish background
];

export default function DashboardClient({ student }: { student: Student }) {
  const router = useRouter();
  const [exams, setExams] = useState<ExamData[]>([]);
  const [notifications, setNotifications] = useState<unknown[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch both exams and notifications in parallel
        const [examsResult, notificationsResult] = await Promise.all([
          getStudentExams(),
          getStudentNotifications()
        ]);
        
        if (examsResult.success) {
          setExams(examsResult.exams);
          setError(null);
        } else {
          setError(examsResult.message);
          toast.error(examsResult.message);
        }

        if (notificationsResult.success) {
          setNotifications(notificationsResult.notifications);
          setUnreadCount(notificationsResult.unreadCount || 0);
        }
      } catch (error) {
        setError("Failed to load data");
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Logout function can be implemented later if needed
  // const handleLogout = async () => {
  //   const { success, message } = await studentLogout();
  //   if (success) {
  //     toast.success(message);
  //     router.push("/student/login");
  //   } else {
  //     toast.error(message);
  //   }
  // };

  // Helper function to check if exam is upcoming (within next 7 days)
  const isUpcomingExam = (examDate: Date | null) => {
    if (!examDate) return false;
    const exam = new Date(examDate);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return exam >= now && exam <= weekFromNow;
  };

  return (
    <StudentLayout>
      <div className="min-h-screen  px-4 py-6">
        <header className="">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                Welcome, {student.firstName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Your upcoming exams are listed below
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <Badge variant="secondary" className="bg-blue-100 text-blue-600">
                  {unreadCount} new notifications
                </Badge>
              </div>
            )}
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading your exams...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && exams.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No exams scheduled for your faculty.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for updates.</p>
          </div>
        )}

        {/* Exams Grid */}
        {!loading && !error && exams.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
            {exams.map((exam, index) => {
              const bgColor = bgColors[index % bgColors.length];
              const examDate = exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'TBD';
              const examTime = exam.examTime || 'TBD';
              const hallName = exam.hall?.name || 'TBD';
              const isUpcoming = isUpcomingExam(exam.examDate);
              
              return (
                <div
                  key={exam.id}
                  className={`rounded-xl p-4 shadow-md ${bgColor} cursor-pointer hover:shadow-lg transition relative`}
                  onClick={() => router.push(`/student/exam-details?id=${exam.id}`)}
                >
                  {isUpcoming && (
                    <Badge className="absolute top-2 right-2 bg-red-100 text-red-600 border-red-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Upcoming
                    </Badge>
                  )}
                  <p className="text-sm text-gray-600">
                    {examDate} • {examTime}
                  </p>
                  <h2 className="text-lg font-bold mt-1">{exam.courseCode}</h2>
                  <p className="text-sm text-gray-600 mb-1">{exam.courseTitle}</p>
                  <p className="text-gray-700">{hallName}</p>
                  {examDate !== 'TBD' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Session: {exam.timeTableSession}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
