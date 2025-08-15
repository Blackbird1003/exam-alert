"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CalendarIcon, Menu, UserCircle2 } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";

export default function SMSLogPage() {
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Example data
  const allLogs = [
    {
      id: 1,
      recipients: 200,
      date: "2025-04-25",
      time: "16:23",
      message:
        "Dear [StudentName], your [CourseTitle] exam holds on [ExamDate] at [ExamTime] in [ExamVenue]. Good luck!",
      faculty: "science",
      department: "cs",
      level: "100",
    },
    {
      id: 2,
      recipients: 150,
      date: "2025-05-01",
      time: "09:15",
      message:
        "Reminder: [CourseTitle] exam is coming soon. Check your timetable.",
      faculty: "arts",
      department: "math",
      level: "200",
    },
  ];

  // Filtering logic
  const filteredLogs = allLogs.filter((log) => {
    const matchesFaculty = faculty ? log.faculty === faculty : true;
    const matchesDepartment = department ? log.department === department : true;
    const matchesLevel = level ? log.level === level : true;

    const matchesDateFrom = dateFrom ? log.date >= dateFrom : true;
    const matchesDateTo = dateTo ? log.date <= dateTo : true;

    return (
      matchesFaculty &&
      matchesDepartment &&
      matchesLevel &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  return (
    <AdminLayout>
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">SMS Notification Panel</h1>
          </div>
        </header>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Date Sent (From)</label>
            <div className="flex items-center gap-2 border p-2 rounded-md">
              <CalendarIcon className="w-4 h-4" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm">Date Sent (To)</label>
            <div className="flex items-center gap-2 border p-2 rounded-md">
              <CalendarIcon className="w-4 h-4" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-4">
          <Select onValueChange={(value) => setFaculty(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="arts">Arts</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setDepartment(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cs">Computer Science</SelectItem>
              <SelectItem value="math">Mathematics</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setLevel(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100 Level</SelectItem>
              <SelectItem value="200">200 Level</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs */}
        <div className="space-y-3 mt-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-100 p-3 rounded-md text-sm border shadow-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <span>🤝 {log.recipients}+ Recipients</span>
                <span className="text-xs text-gray-500">
                  {log.date} {log.time}
                </span>
              </div>
              <p>{log.message}</p>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <p className="text-gray-500 text-sm text-center">
              No SMS logs match the selected filters.
            </p>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
