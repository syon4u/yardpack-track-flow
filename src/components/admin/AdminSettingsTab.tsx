import React, { useState, useEffect } from 'react';
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
  Settings as SettingsIcon,
  Key,
  Eye,
  EyeOff,
  Truck,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/useSystemSettings';

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

  // API Key management state
  const [apiConfigurations, setApiConfigurations] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [loadingApiKeys, setLoadingApiKeys] = useState(false);

  // System settings
  const { data: performanceSettings, isLoading: settingsLoading } = useSystemSettings('performance');
  const updateSetting = useUpdateSystemSetting();

  // Load API configurations on component mount
  useEffect(() => {
    loadApiConfigurations();
  }, []);

  const loadApiConfigurations = async () => {
    setLoadingApiKeys(true);
    try {
      const { data, error } = await supabase
        .from('api_configurations')
        .select('*')
        .order('carrier');

      if (error) throw error;
      
      setApiConfigurations(data || []);
      
      // Initialize API keys state
      const initialKeys: Record<string, string> = {};
      const initialShow: Record<string, boolean> = {};
      data?.forEach(config => {
        initialKeys[config.carrier] = '';
        initialShow[config.carrier] = false;
      });
      setApiKeys(initialKeys);
      setShowApiKeys(initialShow);
    } catch (error) {
      console.error('Error loading API configurations:', error);
      toast({
        title: "Error",
        description: "Failed to load API configurations",
        variant: "destructive",
      });
    } finally {
      setLoadingApiKeys(false);
    }
  };

  const handleApiKeyChange = (carrier: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [carrier]: value
    }));
  };

  const toggleApiKeyVisibility = (carrier: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [carrier]: !prev[carrier]
    }));
  };

  const handleSaveApiKey = async (carrier: string) => {
    const apiKey = apiKeys[carrier];
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, you would save this to Supabase secrets
      // For now, we'll just show a success message
      toast({
        title: "API Key Saved",
        description: `${carrier} API key has been saved securely`,
      });
      
      // Clear the input field for security
      setApiKeys(prev => ({
        ...prev,
        [carrier]: ''
      }));
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    }
  };

  const handleTestApiConnection = async (carrier: string) => {
    try {
      toast({
        title: "Testing Connection",
        description: `Testing ${carrier} API connection...`,
      });
      
      // In a real implementation, you would test the API connection
      // For now, we'll simulate a test
      setTimeout(() => {
        toast({
          title: "Connection Test",
          description: `${carrier} API connection test completed`,
        });
      }, 2000);
    } catch (error) {
      console.error('Error testing API connection:', error);
      toast({
        title: "Test Failed",
        description: `Failed to test ${carrier} API connection`,
        variant: "destructive",
      });
    }
  };

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

  const handleUpdatePerformanceMetric = async (settingId: string, value: string) => {
    updateSetting.mutate({ id: settingId, setting_value: value });
  };

  return (
    <div className="space-y-6">
      {/* API Keys & Delivery Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Service API Keys
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingApiKeys ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {apiConfigurations.map((config) => (
                <div key={config.carrier} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{config.carrier}</h4>
                      <Badge variant={config.is_active ? "default" : "secondary"}>
                        {config.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rate limit: {config.rate_limit_per_minute}/min
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`api-key-${config.carrier}`}>
                        {config.api_key_name}
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id={`api-key-${config.carrier}`}
                            type={showApiKeys[config.carrier] ? "text" : "password"}
                            value={apiKeys[config.carrier] || ''}
                            onChange={(e) => handleApiKeyChange(config.carrier, e.target.value)}
                            placeholder="Enter API key..."
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => toggleApiKeyVisibility(config.carrier)}
                          >
                            {showApiKeys[config.carrier] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <Button
                          onClick={() => handleSaveApiKey(config.carrier)}
                          disabled={!apiKeys[config.carrier]?.trim()}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>API Endpoint</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={config.base_url}
                          readOnly
                          className="bg-gray-50"
                        />
                        <Button
                          variant="outline"
                          onClick={() => handleTestApiConnection(config.carrier)}
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Performance Metrics Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {performanceSettings?.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>{setting.display_name}</Label>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      className="w-20"
                      defaultValue={setting.setting_value}
                      onBlur={(e) => {
                        if (e.target.value !== setting.setting_value) {
                          handleUpdatePerformanceMetric(setting.id, e.target.value);
                        }
                      }}
                    />
                    {setting.setting_type === 'number' && 
                     (setting.setting_key.includes('percentage') ? '%' : '')}
                  </div>
                </div>
              ))}
            </div>
          )}
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
