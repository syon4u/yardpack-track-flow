
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Calculator, 
  MessageSquare, 
  Mail, 
  DollarSign, 
  Clock, 
  Shield, 
  Database,
  Settings as SettingsIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSettingsTab: React.FC = () => {
  const { toast } = useToast();
  
  // State for various settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoDutyCalculation, setAutoDutyCalculation] = useState(true);
  const [dutyRate, setDutyRate] = useState('15');
  const [autoInvoiceGeneration, setAutoInvoiceGeneration] = useState(false);
  const [packageRetentionDays, setPackageRetentionDays] = useState('30');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [systemMaintenanceMode, setSystemMaintenanceMode] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [maintenanceMessage, setMaintenanceMessage] = useState('System is currently under maintenance. Please try again later.');

  const handleSaveSettings = () => {
    // Here you would typically save to your backend/database
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  const handleResetDefaults = () => {
    setEmailNotifications(true);
    setSmsNotifications(false);
    setAutoDutyCalculation(true);
    setDutyRate('15');
    setAutoInvoiceGeneration(false);
    setPackageRetentionDays('30');
    setLowStockThreshold('10');
    setSystemMaintenanceMode(false);
    setBackupFrequency('daily');
    setMaintenanceMessage('System is currently under maintenance. Please try again later.');
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send automatic email notifications to customers about package updates
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send SMS updates to customers (requires SMS service configuration)
              </p>
            </div>
            <Switch
              id="sms-notifications"
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-duty">Auto Duty Calculation</Label>
              <p className="text-sm text-muted-foreground">
                Automatically calculate duties based on package value
              </p>
            </div>
            <Switch
              id="auto-duty"
              checked={autoDutyCalculation}
              onCheckedChange={setAutoDutyCalculation}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duty-rate">Default Duty Rate (%)</Label>
              <Input
                id="duty-rate"
                type="number"
                min="0"
                max="100"
                value={dutyRate}
                onChange={(e) => setDutyRate(e.target.value)}
                disabled={!autoDutyCalculation}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-invoice">Auto Invoice Generation</Label>
                <p className="text-sm text-muted-foreground">
                  Generate invoices automatically when packages arrive
                </p>
              </div>
              <Switch
                id="auto-invoice"
                checked={autoInvoiceGeneration}
                onCheckedChange={setAutoInvoiceGeneration}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operational Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retention-days">Package Retention (Days)</Label>
              <Input
                id="retention-days"
                type="number"
                min="1"
                value={packageRetentionDays}
                onChange={(e) => setPackageRetentionDays(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                How long to keep packages before archiving
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="low-stock">Low Stock Threshold</Label>
              <Input
                id="low-stock"
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Alert when storage space is low
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable to restrict system access during maintenance
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenance-mode"
                checked={systemMaintenanceMode}
                onCheckedChange={setSystemMaintenanceMode}
              />
              {systemMaintenanceMode && (
                <Badge variant="destructive">ACTIVE</Badge>
              )}
            </div>
          </div>

          {systemMaintenanceMode && (
            <div className="space-y-2">
              <Label htmlFor="maintenance-message">Maintenance Message</Label>
              <Textarea
                id="maintenance-message"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Enter the message to display to users during maintenance"
                rows={3}
              />
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="backup-frequency">Backup Frequency</Label>
            <select 
              id="backup-frequency"
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">System Version:</span>
              <span className="text-sm text-muted-foreground">v2.1.4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Database Status:</span>
              <Badge variant="secondary">Connected</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Backup:</span>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Active Users:</span>
              <span className="text-sm text-muted-foreground">127</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button onClick={handleSaveSettings} className="flex-1 sm:flex-none">
          <SettingsIcon className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
        <Button variant="outline" onClick={handleResetDefaults} className="flex-1 sm:flex-none">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsTab;
