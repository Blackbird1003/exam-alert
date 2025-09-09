"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { UserIcon, CalendarIcon, MessageSquareIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Admin } from "@/app/generated/prisma";
import { NotAuthorized } from "../components/not-autorized";
import { AdminLayout } from "@/components/admin-layout";
import { getAdminDashboardStats } from "./actions";
import { toast } from "sonner";

export function AdminDashboardClient({ admin }: { admin: Admin | null }) {
    const router = useRouter();
    const [stats, setStats] = useState({
        students: 0,
        exams: 0,
        emailsSent: 0,
    });
    const [recentEmails, setRecentEmails] = useState<Array<{
        id: string;
        sentTo: string;
        date: string;
        content: string;
        subject: string;
        type: string;
    }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRealStats = async () => {
            try {
                setLoading(true);
                const result = await getAdminDashboardStats();
                
                if (result.success) {
                    setStats(result.stats);
                    setRecentEmails(result.recentEmails);
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchRealStats();
    }, []);

    if (!admin) {
        return <NotAuthorized />;
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="">
                    <h1 className="text-xl md:text-2xl font-bold">Welcome, Admin!</h1>
                    <p className="text-muted-foreground mt-1">Manage your exam alert system from this dashboard</p>
                </header>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/admin/exam-manage")}>
                        Exams
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/admin/student-manage")}>
                        Students
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/admin/faculty-manage")}>
                        Faculties
                    </Button>
                </div>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <UserIcon className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-700">
                                {loading ? "..." : stats.students}
                            </div>
                            <p className="text-xs text-yellow-600 mt-1">Active students in system</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Scheduled Exams</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700">
                                {loading ? "..." : stats.exams}
                            </div>
                            <p className="text-xs text-green-600 mt-1">Upcoming exam schedules</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                            <MessageSquareIcon className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700">
                                {loading ? "..." : stats.emailsSent}
                            </div>
                            <p className="text-xs text-blue-600 mt-1">Messages sent this month</p>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-4">Recently Sent Emails</h2>
                    <Card>
                        <CardContent className="p-0">
                            <ScrollArea className="h-64 p-4">
                                {loading ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">Loading recent emails...</p>
                                    </div>
                                ) : recentEmails.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentEmails.map((email) => (
                                            <div key={email.id} className="pb-4 border-b last:border-b-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-sm font-medium">Sent To: {email.sentTo}</p>
                                                        <p className="text-xs text-blue-600 mt-1 capitalize">
                                                            {email.type.toLowerCase()}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{email.date}</p>
                                                </div>
                                                <p className="text-sm font-medium mb-1">{email.subject}</p>
                                                <p className="text-sm text-muted-foreground">{email.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No emails sent recently</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AdminLayout>
    );
}
