
import React from 'react';
import { usePackages } from '@/hooks/usePackages';
import { useNotifications } from '@/hooks/useNotifications';
import PackageNotificationCard from '@/components/notifications/PackageNotificationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Bell, Package } from 'lucide-react';

const NotificationManagement: React.FC = () => {
  const { data: packages = [], isLoading: packagesLoading } = usePackages();
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications();

  const packagesNeedingNotification = packages.filter(pkg => 
    !pkg.last_notification_status || pkg.last_notification_status !== pkg.status
  );

  const recentNotifications = notifications.slice(0, 10);

  if (packagesLoading || notificationsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-600 mt-1">Loading notifications...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
        <p className="text-gray-600 mt-1">Manage customer email notifications for package updates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packagesNeedingNotification.length}</div>
            <p className="text-xs text-muted-foreground">
              Packages with status changes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
            <p className="text-xs text-muted-foreground">
              Active packages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.filter(n => n.sent_at).length}</div>
            <p className="text-xs text-muted-foreground">
              Total notifications sent
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Notifications 
            {packagesNeedingNotification.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {packagesNeedingNotification.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Packages</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {packagesNeedingNotification.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-600">No pending notifications at this time.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packagesNeedingNotification.map(pkg => (
                <PackageNotificationCard
                  key={pkg.id}
                  packageData={{
                    id: pkg.id,
                    tracking_number: pkg.tracking_number,
                    status: pkg.status,
                    customer_name: pkg.customer_name,
                    customer_email: pkg.customer_email,
                    last_notification_status: pkg.last_notification_status,
                    last_notification_sent_at: pkg.last_notification_sent_at,
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map(pkg => (
              <PackageNotificationCard
                key={pkg.id}
                packageData={{
                  id: pkg.id,
                  tracking_number: pkg.tracking_number,
                  status: pkg.status,
                  customer_name: pkg.customer_name,
                  customer_email: pkg.customer_email,
                  last_notification_status: pkg.last_notification_status,
                  last_notification_sent_at: pkg.last_notification_sent_at,
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNotifications.map(notification => (
                  <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{notification.subject}</p>
                      <p className="text-sm text-gray-600">To: {notification.recipient}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={notification.sent_at ? "default" : "secondary"}>
                      {notification.sent_at ? "Sent" : "Pending"}
                    </Badge>
                  </div>
                ))}
                {recentNotifications.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No notifications yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationManagement;
