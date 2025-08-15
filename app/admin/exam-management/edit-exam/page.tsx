"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";

export default function EditExamPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    courseTitle: "Introduction to Computer Science",
    courseCode: "20250112",
    faculty: "Faculty of Science",
    department: "Computer Science Department",
    level: "100 Level",
    email: "bulalab@school.ng",
    examDate: "2025-04-25",
    examTime: "10:00",
    venue: "3 in 1 Hall",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Exam schedule saved and SMS notification sent to students.");
  };

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        <h2 className="text-xl font-semibold mb-1">Edit Exam</h2>
        <p className="text-sm text-gray-500 mb-4">Edit Exam Schedule</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Course Title
            </label>
            <input
              type="text"
              name="courseTitle"
              value={formData.courseTitle}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Course Code
            </label>
            <input
              type="text"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Faculty</label>
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option>Faculty of Science</option>
              <option>Faculty of Arts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option>Computer Science Department</option>
              <option>Mathematics Department</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option>100 Level</option>
              <option>200 Level</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Exam Date
              </label>
              <div className="flex items-center border rounded p-2">
                <Calendar className="w-4 h-4 mr-2" />
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Exam Time
              </label>
              <div className="flex items-center border rounded p-2">
                <Clock className="w-4 h-4 mr-2" />
                <input
                  type="time"
                  name="examTime"
                  value={formData.examTime}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Exam Venue</label>
            <select
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option>3 in 1 Hall</option>
              <option>Main Auditorium</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-700 text-white py-2 rounded mt-4"
          >
            Save Exam
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
