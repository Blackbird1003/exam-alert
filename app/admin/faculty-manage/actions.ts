"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Semester } from "@/app/generated/prisma";

export async function getFaculties() {
    const faculties = await prisma.faculty.findMany({
        include: {
            facultyHalls: true,
            timeTables: {
                include: {
                    courses: {
                        include: {
                            hall: true,
                            examSessions: {
                                include: {
                                    hall: true
                                },
                                orderBy: {
                                    sessionNumber: 'asc'
                                }
                            },
                        },
                    },
                },
            },
        },
    });

    return {
        success: true,
        faculties,
    };
}

export async function createFaculty(name: string) {
    try {
        const faculty = await prisma.faculty.create({
            data: {
                name,
            },
        });

        revalidatePath("/admin/faculty-manage");
        return {
            success: true,
            message: "Faculty created successfully",
            faculty,
        };
    } catch (error) {
        console.error("Error creating faculty:", error);
        return {
            success: false,
            message: "Failed to create faculty",
        };
    }
}

export async function deleteFaculty(id: string) {
    try {
        await prisma.faculty.delete({
            where: { id },
        });

        revalidatePath("/admin/faculty-manage");
        return {
            success: true,
            message: "Faculty deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting faculty:", error);
        return {
            success: false,
            message: "Failed to delete faculty",
        };
    }
}

export async function addFacultyHall(facultyId: string, name: string, maxCapacity: number) {
    try {
        const hall = await prisma.facultyHall.create({
            data: {
                name,
                facultyId,
                maxCapacity,
            },
        });

        revalidatePath("/admin/faculty-manage");
        return {
            success: true,
            message: "Hall added successfully",
            hall,
        };
    } catch (error) {
        console.error("Error adding hall:", error);
        return {
            success: false,
            message: "Failed to add hall",
        };
    }
}

export async function deleteFacultyHall(id: string) {
    try {
        await prisma.facultyHall.delete({
            where: { id },
        });

        revalidatePath("/admin/faculty-manage");
        return {
            success: true,
            message: "Hall deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting hall:", error);
        return {
            success: false,
            message: "Failed to delete hall",
        };
    }
}

export async function createTimeTable(facultyId: string, name: string, session: string, semester: Semester, examStartDate?: Date) {
    try {
        const timetable = await prisma.timeTable.create({
            data: {
                name,
                facultyId,
                session,
                semester,
                examStartDate,
            },
        });

        revalidatePath("/admin/faculty-manage");
        return {
            success: true,
            message: "Timetable created successfully",
            timetable,
        };
    } catch (error: unknown) {
        console.error("Error creating timetable:", error);
        
        return {
            success: false,
            message: "Failed to create timetable",
        };
    }
}

export async function deleteTimeTable(id: string) {
    try {
        await prisma.timeTable.delete({
            where: { id },
        });

        revalidatePath("/admin/faculty-manage");
        return {
            success: true,
            message: "Timetable deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting timetable:", error);
        return {
            success: false,
            message: "Failed to delete timetable",
        };
    }
}

export async function addCourseToTimeTable(
    timeTableId: string,
    courseCode: string,
    courseTitle: string,
    courseUnit: number,
    numberOfStudents: number
) {
    try {
        const course = await prisma.timeTableCourse.create({
            data: {
                timeTableId,
                courseCode,
                courseTitle,
                courseUnit,
                numberOfStudents,
            },
        });

        revalidatePath("/admin/faculty-manage");
        return {
            success: true,
            message: "Course added successfully",
            course,
        };
    } catch (error) {
        console.error("Error adding course:", error);
        return {
            success: false,
            message: "Failed to add course",
        };
    }
}

export async function deleteCourse(id: string) {
    try {
        await prisma.timeTableCourse.delete({
            where: { id },
        });

        revalidatePath("/admin/faculty-manage");
        return {
            success: true,
            message: "Course deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting course:", error);
        return {
            success: false,
            message: "Failed to delete course",
        };
    }
}

export async function updateTimeTableExamStartDate(timeTableId: string, examStartDate: Date) {
    try {
        const timeTable = await prisma.timeTable.update({
            where: { id: timeTableId },
            data: { examStartDate },
        });

        revalidatePath("/admin/faculty-manage");
        return {
            success: true,
            message: "Exam start date updated successfully",
            timeTable,
        };
    } catch (error) {
        console.error("Error updating exam start date:", error);
        return {
            success: false,
            message: "Failed to update exam start date",
        };
    }
}

export async function scheduleExam(
    courseId: string,
    examDate: Date,
    examTime: string,
    duration: number,
    hallId: string
) {
    try {
        const course = await prisma.timeTableCourse.update({
            where: { id: courseId },
            data: {
                examDate,
                examTime,
                duration,
                hallId,
            },
        });

        revalidatePath("/admin/faculty-manage");
        return {
            success: true,
            message: "Exam scheduled successfully",
            course,
        };
    } catch (error) {
        console.error("Error scheduling exam:", error);
        return {
            success: false,
            message: "Failed to schedule exam",
        };
    }
}

export async function autoScheduleExams(timeTableId: string) {
    try {
        const timeTable = await prisma.timeTable.findUnique({
            where: { id: timeTableId },
            include: {
                courses: {
                    orderBy: [
                        { numberOfStudents: 'desc' },
                        { courseCode: 'asc' }
                    ],
                    include: {
                        examSessions: true
                    }
                },
                faculty: {
                    include: {
                        facultyHalls: {
                            orderBy: { maxCapacity: 'desc' }
                        }
                    }
                }
            }
        });

        if (!timeTable || !timeTable.examStartDate) {
            return {
                success: false,
                message: "Timetable not found or exam start date not set",
                emailsSent: false,
            };
        }

        const halls = timeTable.faculty.facultyHalls;
        if (halls.length === 0) {
            return {
                success: false,
                message: "No halls available for scheduling",
                emailsSent: false,
            };
        }

        const examTimes = ['9:00', '14:00'];
        const examDuration = 180; // 3 hours default
        const startDate = new Date(timeTable.examStartDate);
        const scheduleConflicts: string[] = [];

        // Filter courses that need scheduling (courses without exam sessions)
        const coursesToSchedule = timeTable.courses.filter(course => course.examSessions.length === 0);
        
        console.log(`Starting auto-schedule for ${coursesToSchedule.length} courses`);

        if (coursesToSchedule.length === 0) {
            return {
                success: false,
                message: "No courses found that need scheduling",
                emailsSent: false,
            };
        }

        const scheduledCourses = [];

        for (const course of coursesToSchedule) {
            const studentsToSchedule = course.numberOfStudents;
            let remainingStudents = studentsToSchedule;
            let sessionNumber = 1;
            const examSessions: { hallId: string; examDate: Date; examTime: string; studentsAssigned: number; sessionNumber: number; hallName: string }[] = [];

            console.log(`Scheduling course ${course.courseCode} with ${studentsToSchedule} students`);

            // Try to schedule all students for this course
            while (remainingStudents > 0) {
                let bestSlot: any = null;

                const tempDate = new Date(startDate);
                let attempts = 0;
                const maxAttempts = 50;

                // Find the best available slot
                while (!bestSlot && attempts < maxAttempts) {
                    for (const timeSlot of examTimes) {
                        for (const hall of halls) {
                            // Check if hall is available at this time
                            const conflictingCourse = await prisma.timeTableCourse.findFirst({
                                where: {
                                    hallId: hall.id,
                                    examDate: tempDate,
                                    examTime: timeSlot,
                                    NOT: { id: course.id }
                                }
                            });

                            // Check if this hall is already used for this course at this time
                            const existingSession = examSessions.find(session => 
                                session.hallId === hall.id && 
                                session.examDate.getTime() === tempDate.getTime() && 
                                session.examTime === timeSlot
                            );

                            if (!conflictingCourse && !existingSession) {
                                const studentsCanFit = Math.min(remainingStudents, hall.maxCapacity);
                                
                                // Prefer halls that can fit more students
                                if (!bestSlot || studentsCanFit > bestSlot.studentsCanFit) {
                                    bestSlot = {
                                        hall: hall,
                                        date: new Date(tempDate),
                                        time: timeSlot,
                                        studentsCanFit: studentsCanFit
                                    };
                                }
                            }
                        }
                    }

                    if (!bestSlot) {
                        // Move to next day
                        tempDate.setDate(tempDate.getDate() + 1);
                        
                        // Skip weekends
                        while (tempDate.getDay() === 0 || tempDate.getDay() === 6) {
                            tempDate.setDate(tempDate.getDate() + 1);
                        }
                        attempts++;
                    }
                }

                if (bestSlot) {
                    // Create exam session
                    await prisma.courseExamSession.create({
                        data: {
                            courseId: course.id,
                            hallId: bestSlot.hall.id,
                            examDate: bestSlot.date,
                            examTime: bestSlot.time,
                            duration: examDuration,
                            studentsAssigned: bestSlot.studentsCanFit,
                            sessionNumber: sessionNumber
                        }
                    });

                    examSessions.push({
                        hallId: bestSlot.hall.id,
                        examDate: bestSlot.date,
                        examTime: bestSlot.time,
                        studentsAssigned: bestSlot.studentsCanFit,
                        sessionNumber: sessionNumber,
                        hallName: bestSlot.hall.name
                    });

                    remainingStudents -= bestSlot.studentsCanFit;
                    sessionNumber++;

                    console.log(`Session ${sessionNumber - 1} for ${course.courseCode}: ${bestSlot.studentsCanFit} students in ${bestSlot.hall.name} on ${bestSlot.date.toISOString().split('T')[0]} at ${bestSlot.time}`);
                } else {
                    scheduleConflicts.push(`Course ${course.courseCode}: Unable to schedule ${remainingStudents} remaining students after ${maxAttempts} attempts`);
                    break;
                }
            }

            // Update the main course record with the first session details for backward compatibility
            if (examSessions.length > 0) {
                const firstSession = examSessions[0];
                await prisma.timeTableCourse.update({
                    where: { id: course.id },
                    data: {
                        examDate: firstSession.examDate,
                        examTime: firstSession.examTime,
                        duration: examDuration,
                        hallId: firstSession.hallId,
                    }
                });

                scheduledCourses.push(course.id);
                console.log(`Successfully scheduled ${course.courseCode} across ${examSessions.length} session(s)`);
            }
        }

        revalidatePath("/admin/faculty-manage");
        
        // Log for debugging
        console.log(`Auto-scheduling completed for timetable ${timeTableId}. Processed ${coursesToSchedule.length} courses with ${scheduleConflicts.length} conflicts.`);
        
        const scheduledCount = scheduledCourses.length;
        const emailResults = { successful: 0, failed: 0, total: 0 };
        
        // Send emails for successfully scheduled courses if any were scheduled
        if (scheduledCount > 0) {
            try {
                const { sendCourseExamNotification } = await import("../email-notifications/actions");
                
                const emailPromises = scheduledCourses.map(async (courseId) => {
                    return await sendCourseExamNotification(courseId, "SCHEDULE", "Your exam has been scheduled. Please review the details below.");
                });

                const emailResponses = await Promise.all(emailPromises);
                
                // Calculate email statistics
                emailResults.total = emailResponses.length;
                emailResults.successful = emailResponses.filter(response => response.success).reduce((sum, response) => sum + (response.stats?.successful || 0), 0);
                emailResults.failed = emailResponses.filter(response => response.success).reduce((sum, response) => sum + (response.stats?.failed || 0), 0);

                console.log(`Email notifications sent: ${emailResults.successful} successful, ${emailResults.failed} failed`);
            } catch (emailError) {
                console.error("Failed to send email notifications:", emailError);
                scheduleConflicts.push("Email notifications could not be sent automatically");
            }
        }

        const message = scheduleConflicts.length > 0
            ? `Auto-scheduling completed: ${scheduledCount} courses scheduled, ${scheduleConflicts.length} issues found. Emails sent to ${emailResults.successful} students.`
            : `All ${scheduledCount} exams scheduled successfully across multiple halls where needed! Email notifications sent to ${emailResults.successful} students.`;

        return {
            success: true,
            message,
            conflicts: scheduleConflicts,
            emailsSent: emailResults.total > 0,
            emailStats: emailResults,
            timeTableId, // Include for redirect purposes
        };
    } catch (error) {
        console.error("Error auto-scheduling exams:", error);
        return {
            success: false,
            message: `Failed to auto-schedule exams: ${error instanceof Error ? error.message : 'Unknown error'}`,
            emailsSent: false,
        };
    }
}

export async function clearExamSchedule(timeTableId: string) {
    try {
        // Get all courses for this timetable
        const courses = await prisma.timeTableCourse.findMany({
            where: { timeTableId },
            select: { id: true }
        });

        // Delete all exam sessions for these courses
        await prisma.courseExamSession.deleteMany({
            where: {
                courseId: {
                    in: courses.map(course => course.id)
                }
            }
        });

        // Clear the main course schedule fields
        await prisma.timeTableCourse.updateMany({
            where: { timeTableId },
            data: {
                examDate: null,
                examTime: null,
                duration: null,
                hallId: null,
            },
        });

        revalidatePath("/admin/faculty-manage");
        return {
            success: true,
            message: "Exam schedule cleared successfully",
        };
    } catch (error) {
        console.error("Error clearing exam schedule:", error);
        return {
            success: false,
            message: "Failed to clear exam schedule",
        };
    }
}
