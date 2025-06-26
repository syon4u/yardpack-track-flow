
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Mail } from 'lucide-react';

interface NotificationStatusProps {
  lastNotificationStatus: string | null;
  lastNotificationSentAt: string | null;
  currentStatus: string;
}

const NotificationStatus: React.FC<NotificationStatusProps> = ({
  lastNotificationStatus,
  lastNotificationSentAt,
  currentStatus
}) => {
  const getNotificationStatus = () => {
    if (!lastNotificationStatus) {
      return { status: 'none', color: 'secondary', icon: Mail, text: 'No notifications sent' };
    }
    
    if (lastNotificationStatus === currentStatus && lastNotificationSentAt) {
      return { status: 'sent', color: 'default', icon: CheckCircle, text: 'Email sent' };
    }
    
    if (lastNotificationStatus !== currentStatus) {
      return { status: 'pending', color: 'secondary', icon: Clock, text: 'Notification pending' };
    }
    
    return { status: 'failed', color: 'destructive', icon: AlertCircle, text: 'Failed to send' };
  };

  const { status, color, icon: Icon, text } = getNotificationStatus();

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      <Badge variant={color as any}>
        {text}
      </Badge>
      {lastNotificationSentAt && (
        <span className="text-xs text-gray-500">
          {new Date(lastNotificationSentAt).toLocaleString()}
        </span>
      )}
    </div>
  );
};

export default NotificationStatus;
