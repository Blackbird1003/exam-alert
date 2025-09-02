"use server";

import prisma from "@/lib/prisma";
import { emailService, NotificationData } from "@/lib/email";
import { NotificationType } from "@/app/generated/prisma";

export interface SendNotificationData {
  type: NotificationType;
  subject: string;
  message: string;
  recipientFilters: {
    faculty?: string;
    department?: string;
    level?: string;
    matricNumbers?: string[];
  };
}

export interface NotificationLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  type: NotificationType;
  subject: string;
  message: string;
  status: string;
  sentAt: Date | null;
  createdAt: Date;
}

export async function sendBulkNotification(data: SendNotificationData) {
  try {
    // Build the where clause for filtering students
    const whereClause: any = {};
    
    if (data.recipientFilters.faculty) {
      whereClause.faculty = data.recipientFilters.faculty;
    }
    
    if (data.recipientFilters.department) {
      whereClause.department = data.recipientFilters.department;
    }
    
    if (data.recipientFilters.level) {
      whereClause.level = data.recipientFilters.level;
    }
    
    if (data.recipientFilters.matricNumbers && data.recipientFilters.matricNumbers.length > 0) {
      whereClause.matricNumber = {
        in: data.recipientFilters.matricNumbers
      };
    }

    // Get all students matching the criteria
    const students = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        matricNumber: true,
        faculty: true,
        department: true,
        level: true,
      },
    });

    if (students.length === 0) {
      return {
        success: false,
        message: "No students found matching the criteria",
      };
    }

    // Create notification records in database
    const notificationPromises = students.map(student =>
      prisma.notification.create({
        data: {
          recipientId: student.id,
          type: data.type,
          subject: data.subject,
          message: data.message,
          status: "pending",
        },
      })
    );

    const notifications = await Promise.all(notificationPromises);

    // Send emails
    const emailPromises = students.map(async (student, index) => {
      const notificationData: NotificationData = {
        studentName: `${student.firstName} ${student.lastName}`,
        courseTitle: "General Notification", // This would be dynamic in a real course-specific notification
        examDate: "TBD",
        examTime: "TBD",
        examVenue: "TBD",
        faculty: student.faculty,
        matricNumber: student.matricNumber,
      };

      const result = await emailService.sendNotificationEmail(
        data.type,
        student.email,
        notificationData,
        data.message
      );

      // Update notification status
      await prisma.notification.update({
        where: { id: notifications[index].id },
        data: {
          status: result.success ? "sent" : "failed",
          sentAt: result.success ? new Date() : null,
        },
      });

      return {
        studentId: student.id,
        email: student.email,
        ...result,
      };
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: true,
      message: `Notification sent successfully to ${successful} students. ${failed} failed.`,
      stats: {
        total: students.length,
        successful,
        failed,
      },
      results,
    };

  } catch (error) {
    console.error("Failed to send bulk notification:", error);
    return {
      success: false,
      message: "Failed to send notification. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendCourseExamNotification(
  courseId: string,
  type: NotificationType = "SCHEDULE",
  customMessage?: string
) {
  try {
    // Get course details with related data
    const course = await prisma.timeTableCourse.findUnique({
      where: { id: courseId },
      include: {
        timeTable: {
          include: {
            faculty: true,
          },
        },
        hall: true,
        examSessions: {
          include: {
            hall: true,
          },
        },
      },
    });

    if (!course) {
      return {
        success: false,
        message: "Course not found",
      };
    }

    // Get students from the same faculty who might be taking this course
    const students = await prisma.student.findMany({
      where: {
        faculty: course.timeTable.faculty.name,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        matricNumber: true,
        faculty: true,
        department: true,
        level: true,
      },
    });

    if (students.length === 0) {
      return {
        success: false,
        message: "No students found for this faculty",
      };
    }

    // Format exam details
    const examDate = course.examDate?.toLocaleDateString() || "TBD";
    const examTime = course.examTime || "TBD";
    const examVenue = course.hall?.name || "TBD";

    // Create notification records and send emails
    const results = await Promise.all(
      students.map(async (student) => {
        // Create notification record
        const notification = await prisma.notification.create({
          data: {
            recipientId: student.id,
            type,
            subject: `${type.toLowerCase().charAt(0).toUpperCase() + type.slice(1)} - ${course.courseTitle}`,
            message: customMessage || `Your ${course.courseTitle} exam notification.`,
            status: "pending",
          },
        });

        // Prepare notification data
        const notificationData: NotificationData = {
          studentName: `${student.firstName} ${student.lastName}`,
          courseTitle: `${course.courseCode} - ${course.courseTitle}`,
          examDate,
          examTime,
          examVenue,
          faculty: course.timeTable.faculty.name,
          matricNumber: student.matricNumber,
        };

        // Send email
        const result = await emailService.sendNotificationEmail(
          type,
          student.email,
          notificationData,
          customMessage
        );

        // Update notification status
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: result.success ? "sent" : "failed",
            sentAt: result.success ? new Date() : null,
          },
        });

        return {
          studentId: student.id,
          email: student.email,
          ...result,
        };
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: true,
      message: `Course notification sent to ${successful} students. ${failed} failed.`,
      stats: {
        total: students.length,
        successful,
        failed,
      },
      courseDetails: {
        code: course.courseCode,
        title: course.courseTitle,
        examDate,
        examTime,
        venue: examVenue,
      },
    };

  } catch (error) {
    console.error("Failed to send course exam notification:", error);
    return {
      success: false,
      message: "Failed to send course notification. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getNotificationLogs(filters: {
  faculty?: string;
  department?: string;
  level?: string;
  type?: NotificationType;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; data?: NotificationLog[]; total?: number; message?: string }> {
  try {
    const whereClause: any = {};

    // Build filters
    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      whereClause.createdAt = {};
      if (filters.dateFrom) {
        whereClause.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        whereClause.createdAt.lte = new Date(filters.dateTo);
      }
    }

    // Add student filters if provided
    if (filters.faculty || filters.department || filters.level) {
      whereClause.recipient = {};
      if (filters.faculty) whereClause.recipient.faculty = filters.faculty;
      if (filters.department) whereClause.recipient.department = filters.department;
      if (filters.level) whereClause.recipient.level = filters.level;
    }

    // Get total count
    const total = await prisma.notification.count({ where: whereClause });

    // Get notifications with recipient details
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        recipient: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            matricNumber: true,
            faculty: true,
            department: true,
            level: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });

    const logs: NotificationLog[] = notifications.map(notification => ({
      id: notification.id,
      recipientEmail: notification.recipient.email,
      recipientName: `${notification.recipient.firstName} ${notification.recipient.lastName}`,
      type: notification.type,
      subject: notification.subject,
      message: notification.message,
      status: notification.status,
      sentAt: notification.sentAt,
      createdAt: notification.createdAt,
    }));

    return {
      success: true,
      data: logs,
      total,
    };

  } catch (error) {
    console.error("Failed to get notification logs:", error);
    return {
      success: false,
      message: "Failed to fetch notification logs",
    };
  }
}

export async function getNotificationStats(): Promise<{
  success: boolean;
  data?: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    byType: Record<NotificationType, number>;
    recentActivity: number;
  };
  message?: string;
}> {
  try {
    const [total, sent, failed, pending, byType, recentActivity] = await Promise.all([
      // Total notifications
      prisma.notification.count(),
      
      // Sent notifications
      prisma.notification.count({ where: { status: "sent" } }),
      
      // Failed notifications
      prisma.notification.count({ where: { status: "failed" } }),
      
      // Pending notifications
      prisma.notification.count({ where: { status: "pending" } }),
      
      // By type
      prisma.notification.groupBy({
        by: ["type"],
        _count: { type: true },
      }),
      
      // Recent activity (last 7 days)
      prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const typeStats: Record<NotificationType, number> = {
      SCHEDULE: 0,
      REMINDER: 0,
      CHANGE: 0,
      EMERGENCY: 0,
    };

    byType.forEach(item => {
      typeStats[item.type] = item._count.type;
    });

    return {
      success: true,
      data: {
        total,
        sent,
        failed,
        pending,
        byType: typeStats,
        recentActivity,
      },
    };

  } catch (error) {
    console.error("Failed to get notification stats:", error);
    return {
      success: false,
      message: "Failed to fetch notification statistics",
    };
  }
}

export async function testEmailConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await emailService.verifyConnection();
    return {
      success: result.success,
      message: result.success 
        ? "Email connection is working properly" 
        : `Email connection failed: ${result.error}`,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to test email connection",
    };
  }
}