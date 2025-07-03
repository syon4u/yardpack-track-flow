import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, Settings, Activity } from 'lucide-react';
import { useMagayaAutoSyncConfig, useUpdateMagayaAutoSyncConfig } from '@/hooks/useMagayaAutoSync';

const PACKAGE_STATUSES = [
  { value: 'received', label: 'Received' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'picked_up', label: 'Picked Up' },
];

const MagayaAutoSyncSettings: React.FC = () => {
  const { data: config, isLoading } = useMagayaAutoSyncConfig();
  const updateConfigMutation = useUpdateMagayaAutoSyncConfig();

  const [localConfig, setLocalConfig] = React.useState({
    is_enabled: false,
    sync_on_status_changes: ['arrived', 'ready_for_pickup', 'picked_up'],
    retry_attempts: 3,
    retry_delay_seconds: 30,
  });

  React.useEffect(() => {
    if (config) {
      setLocalConfig({
        is_enabled: config.is_enabled,
        sync_on_status_changes: config.sync_on_status_changes,
        retry_attempts: config.retry_attempts,
        retry_delay_seconds: config.retry_delay_seconds,
      });
    }
  }, [config]);

  const handleSave = () => {
    updateConfigMutation.mutate(localConfig);
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      sync_on_status_changes: checked
        ? [...prev.sync_on_status_changes, status]
        : prev.sync_on_status_changes.filter(s => s !== status)
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading auto-sync settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Magaya Auto-Sync Settings
        </CardTitle>
        <CardDescription>
          Configure automatic synchronization with Magaya when package statuses change
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-sync-enabled"
            checked={localConfig.is_enabled}
            onCheckedChange={(checked) => 
              setLocalConfig(prev => ({ ...prev, is_enabled: checked }))
            }
          />
          <Label htmlFor="auto-sync-enabled">
            Enable automatic Magaya synchronization
          </Label>
        </div>

        {localConfig.is_enabled && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Sync on these status changes:
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {PACKAGE_STATUSES.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={localConfig.sync_on_status_changes.includes(status.value)}
                      onCheckedChange={(checked) => 
                        handleStatusChange(status.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`status-${status.value}`} className="text-sm">
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retry-attempts">Retry Attempts</Label>
                <Input
                  id="retry-attempts"
                  type="number"
                  min="0"
                  max="10"
                  value={localConfig.retry_attempts}
                  onChange={(e) => 
                    setLocalConfig(prev => ({ 
                      ...prev, 
                      retry_attempts: parseInt(e.target.value) || 0 
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retry-delay">Retry Delay (seconds)</Label>
                <Input
                  id="retry-delay"
                  type="number"
                  min="10"
                  max="300"
                  value={localConfig.retry_delay_seconds}
                  onChange={(e) => 
                    setLocalConfig(prev => ({ 
                      ...prev, 
                      retry_delay_seconds: parseInt(e.target.value) || 30 
                    }))
                  }
                />
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            {config?.is_enabled ? 'Auto-sync is active' : 'Auto-sync is disabled'}
          </div>
          <Button
            onClick={handleSave}
            disabled={updateConfigMutation.isPending}
          >
            {updateConfigMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MagayaAutoSyncSettings;