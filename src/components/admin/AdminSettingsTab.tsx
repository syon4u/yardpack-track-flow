
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminSettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-600">Send automatic notifications to customers</p>
            </div>
            <Badge variant="secondary">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Duty Calculation</h4>
              <p className="text-sm text-gray-600">Automatically calculate duties at 15%</p>
            </div>
            <Badge variant="secondary">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Send SMS updates to customers</p>
            </div>
            <Badge variant="outline">Disabled</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsTab;
