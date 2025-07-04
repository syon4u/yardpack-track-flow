import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Phone, Bell, Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommunicationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  preferredMethod: 'email' | 'sms' | 'both';
  frequency: 'immediate' | 'daily' | 'weekly';
  notificationTypes: {
    packageReceived: boolean;
    inTransit: boolean;
    arrived: boolean;
    readyForPickup: boolean;
    invoiceRequired: boolean;
    paymentReminder: boolean;
    promotions: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  alternateEmail?: string;
  alternatePhone?: string;
}

const CustomerCommunicationPreferences: React.FC = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CommunicationPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    preferredMethod: 'email',
    frequency: 'immediate',
    notificationTypes: {
      packageReceived: true,
      inTransit: true,
      arrived: true,
      readyForPickup: true,
      invoiceRequired: true,
      paymentReminder: true,
      promotions: false,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Preferences Updated",
      description: "Your communication preferences have been saved successfully.",
    });
    
    setIsSaving(false);
  };

  const updatePreference = (key: keyof CommunicationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNotificationType = (type: keyof CommunicationPreferences['notificationTypes'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: value
      }
    }));
  };

  const updateQuietHours = (key: keyof CommunicationPreferences['quietHours'], value: any) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [key]: value
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication Preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage how and when you receive notifications about your packages.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Methods */}
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Methods
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <Label htmlFor="email-notifications">Email Notifications</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
              </div>
              <Switch
                id="sms-notifications"
                checked={preferences.smsNotifications}
                onCheckedChange={(checked) => updatePreference('smsNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-500" />
                <Label htmlFor="push-notifications">Push Notifications</Label>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Preferred Method */}
        <div>
          <Label htmlFor="preferred-method" className="text-sm font-medium">
            Preferred Method
          </Label>
          <Select 
            value={preferences.preferredMethod} 
            onValueChange={(value) => updatePreference('preferredMethod', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select preferred method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="sms">SMS Only</SelectItem>
              <SelectItem value="both">Both Email & SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Frequency */}
        <div>
          <Label htmlFor="frequency" className="text-sm font-medium">
            Notification Frequency
          </Label>
          <Select 
            value={preferences.frequency} 
            onValueChange={(value) => updatePreference('frequency', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="daily">Daily Summary</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Notification Types */}
        <div>
          <h4 className="font-medium mb-4">What to notify me about</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(preferences.notificationTypes).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="text-sm">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  {key === 'promotions' && (
                    <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
                  )}
                </Label>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => updateNotificationType(key as any, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quiet Hours */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Quiet Hours</h4>
            <Switch
              checked={preferences.quietHours.enabled}
              onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
            />
          </div>
          
          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time" className="text-sm">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={preferences.quietHours.startTime}
                  onChange={(e) => updateQuietHours('startTime', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-time" className="text-sm">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={preferences.quietHours.endTime}
                  onChange={(e) => updateQuietHours('endTime', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Alternate Contacts */}
        <div>
          <h4 className="font-medium mb-4">Alternate Contact Information</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="alternate-email" className="text-sm">Alternate Email</Label>
              <Input
                id="alternate-email"
                type="email"
                placeholder="alternate@email.com"
                value={preferences.alternateEmail || ''}
                onChange={(e) => updatePreference('alternateEmail', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="alternate-phone" className="text-sm">Alternate Phone</Label>
              <Input
                id="alternate-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={preferences.alternatePhone || ''}
                onChange={(e) => updatePreference('alternatePhone', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerCommunicationPreferences;