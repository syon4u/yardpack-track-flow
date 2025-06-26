
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSendNotification } from '@/hooks/useNotifications';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PackageNotificationCardProps {
  packageData: {
    id: string;
    tracking_number: string;
    status: string;
    customer_name: string;
    customer_email: string | null;
    last_notification_status: string | null;
    last_notification_sent_at: string | null;
  };
}

const PackageNotificationCard: React.FC<PackageNotificationCardProps> = ({ packageData }) => {
  const { mutate: sendNotification, isPending } = useSendNotification();
  const { toast } = useToast();

  const handleSendNotification = () => {
    if (!packageData.customer_email) {
      toast({
        title: "No Email Address",
        description: "Customer does not have an email address on file.",
        variant: "destructive",
      });
      return;
    }

    sendNotification(
      { packageId: packageData.id, status: packageData.status },
      {
        onSuccess: () => {
          toast({
            title: "Notification Sent",
            description: `Email notification sent to ${packageData.customer_email}`,
          });
        },
        onError: (error: any) => {
          toast({
            title: "Failed to Send",
            description: error.message || "Failed to send notification",
            variant: "destructive",
          });
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'received': 'bg-blue-100 text-blue-800',
      'in_transit': 'bg-yellow-100 text-yellow-800',
      'arrived': 'bg-green-100 text-green-800',
      'ready_for_pickup': 'bg-purple-100 text-purple-800',
      'picked_up': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isNotificationCurrent = packageData.last_notification_status === packageData.status;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {packageData.tracking_number}
          </CardTitle>
          <Badge className={getStatusColor(packageData.status)}>
            {packageData.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Customer: {packageData.customer_name}</p>
          <p className="text-sm text-gray-600">
            Email: {packageData.customer_email || 'No email on file'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="text-sm">
              {isNotificationCurrent && packageData.last_notification_sent_at ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Notification sent
                </span>
              ) : (
                <span className="text-gray-500">
                  {packageData.last_notification_status ? 'Status changed - notification needed' : 'No notifications sent'}
                </span>
              )}
            </span>
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={isPending || !packageData.customer_email}
            size="sm"
            variant={isNotificationCurrent ? "outline" : "default"}
          >
            <Send className="h-4 w-4 mr-2" />
            {isPending ? 'Sending...' : isNotificationCurrent ? 'Resend' : 'Send Update'}
          </Button>
        </div>

        {packageData.last_notification_sent_at && (
          <p className="text-xs text-gray-500">
            Last sent: {new Date(packageData.last_notification_sent_at).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PackageNotificationCard;
