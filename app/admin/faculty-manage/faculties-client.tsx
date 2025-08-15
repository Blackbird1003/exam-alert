"use client";

import { useState } from "react";
import {
  Faculty,
  FacultyHall,
  TimeTable,
  TimeTableCourse,
} from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Building,
  Calendar,
  BookOpen,
  Users,
  School,
} from "lucide-react";
import {
  createFaculty,
  deleteFaculty,
  addFacultyHall,
  deleteFacultyHall,
  createTimeTable,
  deleteTimeTable,
  addCourseToTimeTable,
  deleteCourse,
} from "./actions";
import { AdminLayout } from "@/components/admin-layout";

type FacultyWithRelations = Faculty & {
  facultyHalls: FacultyHall[];
  timeTables: (TimeTable & { courses: TimeTableCourse[] })[];
};

type TabType = "faculties" | "halls" | "timetables" | "courses";

export function FacultyManageClient({
  faculties: initialFaculties,
}: {
  faculties: FacultyWithRelations[];
}) {
  const [activeTab, setActiveTab] = useState<TabType>("faculties");
  const [faculties] = useState(initialFaculties);
  const [loading, setLoading] = useState(false);

  // Faculty form state
  const [newFacultyName, setNewFacultyName] = useState("");

  // Hall form state
  const [selectedFacultyForHall, setSelectedFacultyForHall] = useState("");
  const [newHallName, setNewHallName] = useState("");
  const [newHallCapacity, setNewHallCapacity] = useState("");

  // Timetable form state
  const [selectedFacultyForTimetable, setSelectedFacultyForTimetable] =
    useState("");
  const [newTimetableName, setNewTimetableName] = useState("");
  const [newTimetableSession, setNewTimetableSession] = useState("");

  // Course form state
  const [selectedTimetableForCourse, setSelectedTimetableForCourse] =
    useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseUnit, setNewCourseUnit] = useState("");
  const [newCourseStudents, setNewCourseStudents] = useState("");

  // Handlers
  const handleCreateFaculty = async () => {
    if (!newFacultyName.trim()) {
      toast.error("Please enter a faculty name");
      return;
    }

    setLoading(true);
    const result = await createFaculty(newFacultyName.trim());

    if (result.success) {
      toast.success(result.message);
      setNewFacultyName("");
      // Refresh data
      window.location.reload();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleDeleteFaculty = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this faculty? This will also delete all associated halls and timetables."
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await deleteFaculty(id);

    if (result.success) {
      toast.success(result.message);
      window.location.reload();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleAddHall = async () => {
    if (!selectedFacultyForHall || !newHallName.trim() || !newHallCapacity) {
      toast.error("Please fill all fields");
      return;
    }

    const capacity = parseInt(newHallCapacity);
    if (isNaN(capacity) || capacity <= 0) {
      toast.error("Please enter a valid capacity");
      return;
    }

    setLoading(true);
    const result = await addFacultyHall(
      selectedFacultyForHall,
      newHallName.trim(),
      capacity
    );

    if (result.success) {
      toast.success(result.message);
      setSelectedFacultyForHall("");
      setNewHallName("");
      setNewHallCapacity("");
      window.location.reload();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleDeleteHall = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hall?")) {
      return;
    }

    setLoading(true);
    const result = await deleteFacultyHall(id);

    if (result.success) {
      toast.success(result.message);
      window.location.reload();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleCreateTimetable = async () => {
    if (
      !selectedFacultyForTimetable ||
      !newTimetableName.trim() ||
      !newTimetableSession.trim()
    ) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    const result = await createTimeTable(
      selectedFacultyForTimetable,
      newTimetableName.trim(),
      newTimetableSession.trim()
    );

    if (result.success) {
      toast.success(result.message);
      setSelectedFacultyForTimetable("");
      setNewTimetableName("");
      setNewTimetableSession("");
      window.location.reload();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleDeleteTimetable = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this timetable? This will also delete all associated courses."
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await deleteTimeTable(id);

    if (result.success) {
      toast.success(result.message);
      window.location.reload();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleAddCourse = async () => {
    if (
      !selectedTimetableForCourse ||
      !newCourseCode.trim() ||
      !newCourseTitle.trim() ||
      !newCourseUnit ||
      !newCourseStudents
    ) {
      toast.error("Please fill all fields");
      return;
    }

    const unit = parseInt(newCourseUnit);
    const students = parseInt(newCourseStudents);

    if (isNaN(unit) || unit <= 0 || isNaN(students) || students <= 0) {
      toast.error(
        "Please enter valid numbers for course unit and number of students"
      );
      return;
    }

    setLoading(true);
    const result = await addCourseToTimeTable(
      selectedTimetableForCourse,
      newCourseCode.trim(),
      newCourseTitle.trim(),
      unit,
      students
    );

    if (result.success) {
      toast.success(result.message);
      setSelectedTimetableForCourse("");
      setNewCourseCode("");
      setNewCourseTitle("");
      setNewCourseUnit("");
      setNewCourseStudents("");
      window.location.reload();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    setLoading(true);
    const result = await deleteCourse(id);

    if (result.success) {
      toast.success(result.message);
      window.location.reload();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  // Get all timetables for course dropdown
  const allTimetables = faculties.flatMap((faculty) =>
    faculty.timeTables.map((tt) => ({
      ...tt,
      facultyName: faculty.name,
    }))
  );

  const tabs = [
    { id: "faculties" as TabType, label: "Faculties", icon: School },
    { id: "halls" as TabType, label: "Halls", icon: Building },
    { id: "timetables" as TabType, label: "Timetables", icon: Calendar },
    { id: "courses" as TabType, label: "Courses", icon: BookOpen },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Faculty Management</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className="flex items-center gap-2"
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Faculties Tab */}
          {activeTab === "faculties" && (
            <div className="space-y-6">
              {/* Create Faculty Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Faculty
                  </CardTitle>
                  <CardDescription>
                    Add a new faculty to the system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label htmlFor="faculty-name">Faculty Name</Label>
                      <Input
                        id="faculty-name"
                        placeholder="Enter faculty name"
                        value={newFacultyName}
                        onChange={(e) => setNewFacultyName(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateFaculty} disabled={loading}>
                      {loading ? "Creating..." : "Create Faculty"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Faculties List */}
              <div className="grid gap-4">
                <h2 className="text-xl font-semibold">All Faculties</h2>
                {faculties.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">
                        No faculties found
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  faculties.map((faculty) => (
                    <Card key={faculty.id}>
                      <CardContent className="flex items-center justify-between py-4">
                        <div>
                          <h3 className="font-semibold">{faculty.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {faculty.facultyHalls.length} halls •{" "}
                            {faculty.timeTables.length} timetables
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFaculty(faculty.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Halls Tab */}
          {activeTab === "halls" && (
            <div className="space-y-6">
              {/* Add Hall Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Hall
                  </CardTitle>
                  <CardDescription>Add a new hall to a faculty</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="hall-faculty">Faculty</Label>
                      <Select
                        value={selectedFacultyForHall}
                        onValueChange={setSelectedFacultyForHall}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                        <SelectContent>
                          {faculties.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="hall-name">Hall Name</Label>
                      <Input
                        id="hall-name"
                        placeholder="Enter hall name"
                        value={newHallName}
                        onChange={(e) => setNewHallName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hall-capacity">Max Capacity</Label>
                      <Input
                        id="hall-capacity"
                        type="number"
                        placeholder="Enter max capacity"
                        value={newHallCapacity}
                        onChange={(e) => setNewHallCapacity(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleAddHall}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? "Adding..." : "Add Hall"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Halls List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">All Halls</h2>
                {faculties.map(
                  (faculty) =>
                    faculty.facultyHalls.length > 0 && (
                      <div key={faculty.id}>
                        <h3 className="text-lg font-medium mb-3">
                          {faculty.name}
                        </h3>
                        <div className="grid gap-3 mb-6">
                          {faculty.facultyHalls.map((hall) => (
                            <Card key={hall.id}>
                              <CardContent className="flex items-center justify-between py-4">
                                <div>
                                  <h4 className="font-semibold">{hall.name}</h4>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    Max Capacity: {hall.maxCapacity}
                                  </p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteHall(hall.id)}
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Timetables Tab */}
          {activeTab === "timetables" && (
            <div className="space-y-6">
              {/* Create Timetable Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Timetable
                  </CardTitle>
                  <CardDescription>
                    Create a new timetable for a faculty session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="timetable-faculty">Faculty</Label>
                      <Select
                        value={selectedFacultyForTimetable}
                        onValueChange={setSelectedFacultyForTimetable}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                        <SelectContent>
                          {faculties.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timetable-name">Timetable Name</Label>
                      <Input
                        id="timetable-name"
                        placeholder="Enter timetable name"
                        value={newTimetableName}
                        onChange={(e) => setNewTimetableName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timetable-session">Session</Label>
                      <Input
                        id="timetable-session"
                        placeholder="e.g., 2023/2024"
                        value={newTimetableSession}
                        onChange={(e) => setNewTimetableSession(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleCreateTimetable} disabled={loading}>
                      {loading ? "Generating..." : "Generate Timetable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Timetables List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">All Timetables</h2>
                {faculties.map(
                  (faculty) =>
                    faculty.timeTables.length > 0 && (
                      <div key={faculty.id}>
                        <h3 className="text-lg font-medium mb-3">
                          {faculty.name}
                        </h3>
                        <div className="grid gap-3 mb-6">
                          {faculty.timeTables.map((timetable) => (
                            <Card key={timetable.id}>
                              <CardContent className="flex items-center justify-between py-4">
                                <div>
                                  <h4 className="font-semibold">
                                    {timetable.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Session: {timetable.session} •{" "}
                                    {timetable.courses.length} courses
                                  </p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteTimetable(timetable.id)
                                  }
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              {/* Add Course Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Course
                  </CardTitle>
                  <CardDescription>
                    Add a new course to a timetable
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="course-timetable">Timetable</Label>
                      <Select
                        value={selectedTimetableForCourse}
                        onValueChange={setSelectedTimetableForCourse}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timetable" />
                        </SelectTrigger>
                        <SelectContent>
                          {allTimetables.map((timetable) => (
                            <SelectItem key={timetable.id} value={timetable.id}>
                              {timetable.facultyName} - {timetable.name} (
                              {timetable.session})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="course-code">Course Code</Label>
                      <Input
                        id="course-code"
                        placeholder="e.g., CSC101"
                        value={newCourseCode}
                        onChange={(e) => setNewCourseCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-title">Course Title</Label>
                      <Input
                        id="course-title"
                        placeholder="Enter course title"
                        value={newCourseTitle}
                        onChange={(e) => setNewCourseTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-unit">Course Unit</Label>
                      <Input
                        id="course-unit"
                        type="number"
                        placeholder="e.g., 3"
                        value={newCourseUnit}
                        onChange={(e) => setNewCourseUnit(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-students">No. of Students</Label>
                      <Input
                        id="course-students"
                        type="number"
                        placeholder="e.g., 150"
                        value={newCourseStudents}
                        onChange={(e) => setNewCourseStudents(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddCourse} disabled={loading}>
                      {loading ? "Adding..." : "Add Course"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Courses List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">All Courses</h2>
                {faculties.map((faculty) =>
                  faculty.timeTables.map(
                    (timetable) =>
                      timetable.courses.length > 0 && (
                        <div key={timetable.id}>
                          <h3 className="text-lg font-medium mb-3">
                            {faculty.name} - {timetable.name} (
                            {timetable.session})
                          </h3>
                          <div className="grid gap-3 mb-6">
                            {timetable.courses.map((course) => (
                              <Card key={course.id}>
                                <CardContent className="flex items-center justify-between py-4">
                                  <div>
                                    <h4 className="font-semibold">
                                      {course.courseCode} - {course.courseTitle}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      Unit: {course.courseUnit} • Students:{" "}
                                      {course.numberOfStudents}
                                    </p>
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteCourse(course.id)
                                    }
                                    disabled={loading}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
