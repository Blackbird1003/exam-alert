"use server";

import { authHelper } from "../helpers/auth";
import prisma from "@/lib/prisma";
import { getStudent } from "../helpers/student";

export async function studentLogout() {
    const { success, message } = await authHelper.studentLogout();

    return { success, message };
}

export async function getStudentExams() {
    const student = await getStudent();
    
    if (!student) {
        return { success: false, exams: [], message: "Not authenticated" };
    }

    try {
        // Find the faculty that matches the student's faculty name
        const faculty = await prisma.faculty.findFirst({
            where: { 
                name: { 
                    equals: student.faculty, 
                    mode: 'insensitive' 
                } 
            },
            include: {
                timeTables: {
                    include: {
                        courses: {
                            include: {
                                hall: true,
                                examSessions: {
                                    include: { hall: true },
                                    orderBy: { sessionNumber: 'asc' }
                                }
                            },
                            orderBy: { examDate: 'asc' }
                        }
                    }
                }
            }
        });

        if (!faculty) {
            return { success: false, exams: [], message: "Faculty not found" };
        }

        // Flatten all courses from all timetables
        const allCourses = faculty.timeTables.flatMap(timeTable => 
            timeTable.courses.map(course => ({
                ...course,
                timeTableName: timeTable.name,
                timeTableSession: timeTable.session,
                faculty: faculty.name
            }))
        );

        return { 
            success: true, 
            exams: allCourses,
            message: "Exams fetched successfully" 
        };
    } catch (error) {
        console.error("Error fetching student exams:", error);
        return { success: false, exams: [], message: "Error fetching exams" };
    }
}

export async function getStudentExamById(courseId: string) {
    const student = await getStudent();
    
    if (!student) {
        return { success: false, exam: null, message: "Not authenticated" };
    }

    try {
        // Find the faculty that matches the student's faculty name
        const faculty = await prisma.faculty.findFirst({
            where: { 
                name: { 
                    equals: student.faculty, 
                    mode: 'insensitive' 
                } 
            }
        });

        if (!faculty) {
            return { success: false, exam: null, message: "Faculty not found" };
        }

        // Find the course and verify it belongs to the student's faculty
        const course = await prisma.timeTableCourse.findFirst({
            where: {
                id: courseId,
                timeTable: { facultyId: faculty.id }
            },
            include: {
                hall: true,
                timeTable: { 
                    include: { faculty: true } 
                },
                examSessions: {
                    include: { hall: true },
                    orderBy: { sessionNumber: 'asc' }
                }
            }
        });

        if (!course) {
            return { success: false, exam: null, message: "Exam not found or access denied" };
        }

        return { 
            success: true, 
            exam: course, 
            message: "Exam details fetched successfully" 
        };
    } catch (error) {
        console.error("Error fetching student exam by ID:", error);
        return { success: false, exam: null, message: "Error fetching exam details" };
    }
}

export async function getStudentProfile() {
    const student = await getStudent();
    
    if (!student) {
        return { success: false, profile: null, message: "Not authenticated" };
    }

    try {
        return { 
            success: true, 
            profile: {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                matricNumber: student.matricNumber,
                phone: student.phone,
                email: student.email,
                faculty: student.faculty,
                department: student.department,
                level: student.level,
            },
            message: "Profile fetched successfully" 
        };
    } catch (error) {
        console.error("Error fetching student profile:", error);
        return { success: false, profile: null, message: "Error fetching profile" };
    }
}

export async function updateStudentProfile(profileData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    faculty: string;
    department: string;
    level: string;
}) {
    const student = await getStudent();
    
    if (!student) {
        return { success: false, message: "Not authenticated" };
    }

    try {
        // Check if email is already taken by another student
        if (profileData.email !== student.email) {
            const existingStudent = await prisma.student.findFirst({
                where: {
                    email: profileData.email,
                    NOT: { id: student.id }
                }
            });

            if (existingStudent) {
                return { success: false, message: "Email is already taken by another student" };
            }
        }

        // Update the student profile
        const updatedStudent = await prisma.student.update({
            where: { id: student.id },
            data: {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
                email: profileData.email,
                faculty: profileData.faculty,
                department: profileData.department,
                level: profileData.level,
            }
        });

        return { 
            success: true, 
            profile: {
                id: updatedStudent.id,
                firstName: updatedStudent.firstName,
                lastName: updatedStudent.lastName,
                matricNumber: updatedStudent.matricNumber,
                phone: updatedStudent.phone,
                email: updatedStudent.email,
                faculty: updatedStudent.faculty,
                department: updatedStudent.department,
                level: updatedStudent.level,
            },
            message: "Profile updated successfully" 
        };
    } catch (error) {
        console.error("Error updating student profile:", error);
        return { success: false, message: "Error updating profile" };
    }
}

export async function getStudentNotifications() {
    const student = await getStudent();
    
    if (!student) {
        return { success: false, notifications: [], message: "Not authenticated" };
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { recipientId: student.id },
            orderBy: { createdAt: 'desc' },
            take: 10 // Get latest 10 notifications
        });

        // Count unread notifications (sent in the last 7 days and status is "sent")
        const recentNotifications = await prisma.notification.count({
            where: {
                recipientId: student.id,
                status: "sent",
                sentAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                }
            }
        });

        return { 
            success: true, 
            notifications,
            unreadCount: recentNotifications,
            message: "Notifications fetched successfully" 
        };
    } catch (error) {
        console.error("Error fetching student notifications:", error);
        return { success: false, notifications: [], unreadCount: 0, message: "Error fetching notifications" };
    }
}
