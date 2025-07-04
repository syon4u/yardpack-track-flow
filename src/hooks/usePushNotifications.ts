import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PushNotificationPreferences {
  enabled: boolean;
  packageStatusUpdates: boolean;
  deliveryNotifications: boolean;
  invoiceNotifications: boolean;
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'prompt-with-rationale'>('prompt');
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkSupport = async () => {
      if (Capacitor.isNativePlatform()) {
        setIsSupported(true);
        await initializePushNotifications();
      } else {
        // Web push notifications support
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          setIsSupported(true);
        }
      }
    };

    checkSupport();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      setPermissionStatus(permission.receive);

      if (permission.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();

        // Listen for registration token
        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ' + token.value);
          setDeviceToken(token.value);
          await updateDeviceToken(token.value);
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
          toast({
            title: 'Push Notification Error',
            description: 'Failed to register for push notifications',
            variant: 'destructive',
          });
        });

        // Listen for push notifications
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
          // Handle foreground notifications
          toast({
            title: notification.title || 'Notification',
            description: notification.body || 'You have a new notification',
          });
        });

        // Handle notification taps
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed: ', notification);
          // Handle notification tap actions
          const data = notification.notification.data;
          if (data?.packageId) {
            // Navigate to package details
            window.location.href = `/package/${data.packageId}`;
          }
        });
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const updateDeviceToken = async (token: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          push_token: token,
          push_notifications_enabled: true 
        } as any)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating device token:', error);
      }
    } catch (error) {
      console.error('Error updating device token:', error);
    }
  };

  const updateNotificationPreferences = async (preferences: PushNotificationPreferences) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          push_notifications_enabled: preferences.enabled,
          notification_preferences: preferences
        } as any)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating notification preferences:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  };

  const testPushNotification = async () => {
    if (!deviceToken || !user) return;

    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          deviceToken,
          title: 'Test Notification',
          body: 'This is a test push notification',
          data: { test: true }
        }
      });

      if (error) {
        console.error('Error sending test notification:', error);
        toast({
          title: 'Test Failed',
          description: 'Failed to send test notification',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Test Sent',
          description: 'Test notification sent successfully',
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return {
    isSupported,
    permissionStatus,
    deviceToken,
    updateNotificationPreferences,
    testPushNotification,
    initializePushNotifications
  };
};