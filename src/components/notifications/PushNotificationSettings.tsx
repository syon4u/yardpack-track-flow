import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Bell, TestTube, Check, X } from 'lucide-react';
import { usePushNotifications, PushNotificationPreferences } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

const PushNotificationSettings: React.FC = () => {
  const {
    isSupported,
    permissionStatus,
    deviceToken,
    updateNotificationPreferences,
    testPushNotification,
    initializePushNotifications
  } = usePushNotifications();

  const { toast } = useToast();
  const [preferences, setPreferences] = useState<PushNotificationPreferences>({
    enabled: false,
    packageStatusUpdates: true,
    deliveryNotifications: true,
    invoiceNotifications: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handlePreferenceChange = async (key: keyof PushNotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    if (key === 'enabled' && value && permissionStatus !== 'granted') {
      await initializePushNotifications();
      return;
    }

    setIsSaving(true);
    const success = await updateNotificationPreferences(newPreferences);
    setIsSaving(false);

    if (success) {
      toast({
        title: 'Settings Updated',
        description: 'Your notification preferences have been saved.',
      });
    } else {
      toast({
        title: 'Update Failed',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      });
    }
  };

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return <Badge variant="default" className="flex items-center gap-1"><Check className="h-3 w-3" />Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive" className="flex items-center gap-1"><X className="h-3 w-3" />Denied</Badge>;
      default:
        return <Badge variant="secondary">Not Requested</Badge>;
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Push notifications are not supported on this device or browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Permission Status</h4>
            <p className="text-sm text-muted-foreground">
              Current push notification permission status
            </p>
          </div>
          {getPermissionBadge()}
        </div>

        {/* Device Token Status */}
        {deviceToken && (
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Device Registered</h4>
              <p className="text-sm text-muted-foreground">
                This device is registered for push notifications
              </p>
            </div>
            <Badge variant="default">Active</Badge>
          </div>
        )}

        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Enable Push Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Receive push notifications on this device
            </p>
          </div>
          <Switch
            checked={preferences.enabled}
            onCheckedChange={(checked) => handlePreferenceChange('enabled', checked)}
            disabled={isSaving}
          />
        </div>

        {/* Specific Notification Types */}
        {preferences.enabled && permissionStatus === 'granted' && (
          <div className="space-y-4 pl-4 border-l-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium">Package Status Updates</h5>
                <p className="text-sm text-muted-foreground">
                  Get notified when your package status changes
                </p>
              </div>
              <Switch
                checked={preferences.packageStatusUpdates}
                onCheckedChange={(checked) => handlePreferenceChange('packageStatusUpdates', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium">Delivery Notifications</h5>
                <p className="text-sm text-muted-foreground">
                  Get notified when packages are ready for pickup
                </p>
              </div>
              <Switch
                checked={preferences.deliveryNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('deliveryNotifications', checked)}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium">Invoice Notifications</h5>
                <p className="text-sm text-muted-foreground">
                  Get notified about invoice updates and due dates
                </p>
              </div>
              <Switch
                checked={preferences.invoiceNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('invoiceNotifications', checked)}
                disabled={isSaving}
              />
            </div>
          </div>
        )}

        {/* Test Button */}
        {preferences.enabled && deviceToken && (
          <div className="pt-4 border-t">
            <Button
              onClick={testPushNotification}
              variant="outline"
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;