"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AdminLayout } from "@/components/admin-layout";
import { toast } from "sonner";
import { 
  Mail, 
  Send, 
  TestTube2, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Loader2 
} from "lucide-react";
import {
  sendBulkNotification,
  testEmailConnection,
  getNotificationStats,
  SendNotificationData,
} from "../email-notifications/actions";
import { NotificationType } from "@/app/generated/prisma";

const notificationTypes = [
  { value: 'SCHEDULE' as NotificationType, label: 'Schedule Update', color: 'bg-blue-100 text-blue-800' },
  { value: 'REMINDER' as NotificationType, label: 'Reminder', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CHANGE' as NotificationType, label: 'Schedule Change', color: 'bg-orange-100 text-orange-800' },
  { value: 'EMERGENCY' as NotificationType, label: 'Emergency', color: 'bg-red-100 text-red-800' }
];

export default function EmailNotificationPanel() {
  const [autoEmail, setAutoEmail] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'failed'>('unknown');
  const [stats, setStats] = useState<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    recentActivity: number;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'SCHEDULE' as NotificationType,
    subject: '',
    message: '',
    faculty: '',
    department: '',
    level: '',
  });

  // Load stats and test connection on component mount
  useEffect(() => {
    loadStats();
    testConnection();
  }, []);

  const loadStats = async () => {
    try {
      const result = await getNotificationStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testEmailConnection();
      setConnectionStatus(result.success ? 'success' : 'failed');
      if (!result.success) {
        toast.error(result.message);
      }
    } catch (error) {
      setConnectionStatus('failed');
      toast.error('Failed to test email connection');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSendNotification = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }

    setIsLoading(true);
    try {
      const notificationData: SendNotificationData = {
        type: formData.type,
        subject: formData.subject,
        message: formData.message,
        recipientFilters: {
          faculty: formData.faculty || undefined,
          department: formData.department || undefined,
          level: formData.level || undefined,
        },
      };

      const result = await sendBulkNotification(notificationData);
      
      if (result.success) {
        toast.success(result.message);
        setFormData({
          ...formData,
          subject: '',
          message: '',
        });
        loadStats(); // Refresh stats
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationTypeData = (type: NotificationType) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0];
  };

  const getCurrentTypeData = () => getNotificationTypeData(formData.type);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Email Notification Panel
          </h1>
          <p className="text-muted-foreground mt-1">Configure and send email notifications to students</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Connection Status */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {connectionStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {connectionStatus === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                    {connectionStatus === 'unknown' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                    <h3 className="text-base font-medium">Email Service Status</h3>
                  </div>
                  <Badge variant={connectionStatus === 'success' ? 'default' : 'destructive'}>
                    {connectionStatus === 'success' ? 'Connected' : connectionStatus === 'failed' ? 'Disconnected' : 'Unknown'}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube2 className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Auto Email Toggle */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-medium">Auto Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically send email notifications to students about their exams
                  </p>
                </div>
                <Switch
                  checked={autoEmail}
                  onCheckedChange={setAutoEmail}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </Card>

            {/* Send Notification Form */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Email Notification
              </h3>

              <div className="space-y-4">
                {/* Notification Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Notification Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as NotificationType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={type.color} variant="secondary">
                              {type.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Recipient Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="faculty">Faculty (Optional)</Label>
                    <Input
                      id="faculty"
                      value={formData.faculty}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      placeholder="e.g., Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department (Optional)</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level (Optional)</Label>
                    <Input
                      id="level"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={`${getCurrentTypeData().label} - Enter subject here`}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter your message here..."
                    rows={5}
                  />
                </div>

                <Button
                  onClick={handleSendNotification}
                  disabled={isLoading || connectionStatus !== 'success'}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            {stats && (
              <Card className="p-6">
                <h3 className="text-base font-medium mb-4">Email Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Sent</span>
                    <Badge variant="secondary">{stats.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Successful</span>
                    <Badge variant="default">{stats.sent}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Failed</span>
                    <Badge variant="destructive">{stats.failed}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recent (7 days)</span>
                    <Badge variant="outline">{stats.recentActivity}</Badge>
                  </div>
                </div>
              </Card>
            )}

            {/* Email Template Preview */}
            <Card className="p-6">
              <h3 className="text-base font-medium mb-4">Email Template Preview</h3>
              <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
                <div className="mb-2">
                  <Badge className={getCurrentTypeData().color} variant="secondary">
                    {getCurrentTypeData().label}
                  </Badge>
                </div>
                <p className="text-sm font-mono mb-2">
                  <strong>Subject:</strong> {formData.subject || `${getCurrentTypeData().label} - [Course Title]`}
                </p>
                <p className="text-sm font-mono">
                  Dear [Student Name],<br /><br />
                  {formData.message || `Your [Course Title] exam notification message will appear here.`}<br /><br />
                  <strong>Exam Details:</strong><br />
                  Course: [Course Title]<br />
                  Date: [Exam Date]<br />
                  Time: [Exam Time]<br />
                  Venue: [Exam Venue]<br />
                  Faculty: [Faculty]<br /><br />
                  Good luck!
                </p>
              </div>
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <p><strong>Available placeholders:</strong></p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <code className="bg-muted px-2 py-1 rounded text-xs">[Student Name]</code>
                  <code className="bg-muted px-2 py-1 rounded text-xs">[Course Title]</code>
                  <code className="bg-muted px-2 py-1 rounded text-xs">[Exam Date]</code>
                  <code className="bg-muted px-2 py-1 rounded text-xs">[Exam Time]</code>
                  <code className="bg-muted px-2 py-1 rounded text-xs">[Exam Venue]</code>
                  <code className="bg-muted px-2 py-1 rounded text-xs">[Faculty]</code>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}