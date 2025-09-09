"use server";

import prisma from "@/lib/prisma";

export async function getAdminDashboardStats() {
    try {
        // Get all statistics in parallel for better performance
        const [
            totalStudents,
            scheduledExams,
            totalEmailsSent,
            recentEmails
        ] = await Promise.all([
            // Total students count
            prisma.student.count(),
            
            // Scheduled exams (exams that have dates and times set)
            prisma.timeTableCourse.count({
                where: {
                    AND: [
                        { examDate: { not: null } },
                        { examTime: { not: null } }
                    ]
                }
            }),
            
            // Total emails sent this month
            prisma.notification.count({
                where: {
                    status: "sent",
                    sentAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
                        lte: new Date() // Today
                    }
                }
            }),
            
            // Recent emails (last 5 sent emails)
            prisma.notification.findMany({
                where: {
                    status: "sent",
                    sentAt: { not: null }
                },
                include: {
                    recipient: {
                        select: {
                            firstName: true,
                            lastName: true,
                            faculty: true
                        }
                    }
                },
                orderBy: {
                    sentAt: 'desc'
                },
                take: 5
            })
        ]);

        // Count unique recipients for recent emails
        const emailsWithRecipientCounts = await Promise.all(
            recentEmails.map(async (email) => {
                // Get count of students from same faculty to estimate recipients
                const recipientCount = await prisma.student.count({
                    where: {
                        faculty: email.recipient.faculty
                    }
                });

                return {
                    id: email.id,
                    sentTo: `${recipientCount} students`,
                    date: email.sentAt?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) || 'Unknown',
                    content: email.message.length > 100 
                        ? email.message.substring(0, 100) + '...'
                        : email.message,
                    subject: email.subject,
                    type: email.type
                };
            })
        );

        return {
            success: true,
            stats: {
                students: totalStudents,
                exams: scheduledExams,
                emailsSent: totalEmailsSent
            },
            recentEmails: emailsWithRecipientCounts,
            message: "Dashboard statistics fetched successfully"
        };
    } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
        return {
            success: false,
            stats: {
                students: 0,
                exams: 0,
                emailsSent: 0
            },
            recentEmails: [],
            message: "Failed to fetch dashboard statistics"
        };
    }
}

export async function getDetailedEmailStats() {
    try {
        const [
            totalNotifications,
            sentNotifications,
            failedNotifications,
            pendingNotifications,
            notificationsByType
        ] = await Promise.all([
            prisma.notification.count(),
            prisma.notification.count({ where: { status: "sent" } }),
            prisma.notification.count({ where: { status: "failed" } }),
            prisma.notification.count({ where: { status: "pending" } }),
            prisma.notification.groupBy({
                by: ["type"],
                _count: { type: true }
            })
        ]);

        const typeStats = notificationsByType.reduce((acc, item) => {
            acc[item.type] = item._count.type;
            return acc;
        }, {} as Record<string, number>);

        return {
            success: true,
            emailStats: {
                total: totalNotifications,
                sent: sentNotifications,
                failed: failedNotifications,
                pending: pendingNotifications,
                byType: typeStats
            }
        };
    } catch (error) {
        console.error("Error fetching detailed email stats:", error);
        return {
            success: false,
            emailStats: {
                total: 0,
                sent: 0,
                failed: 0,
                pending: 0,
                byType: {}
            }
        };
    }
}