-- Add push notification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN push_token TEXT,
ADD COLUMN push_notifications_enabled BOOLEAN DEFAULT false,
ADD COLUMN notification_preferences JSONB DEFAULT '{"enabled": false, "packageStatusUpdates": true, "deliveryNotifications": true, "invoiceNotifications": true}'::jsonb;