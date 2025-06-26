
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

interface ApiStatusCardProps {
  apiStatus: Record<string, 'connected' | 'error' | 'unconfigured'>;
}

const ApiStatusCard: React.FC<ApiStatusCardProps> = ({ apiStatus }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Delivery Service API Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(apiStatus).map(([carrier, status]) => (
            <div key={carrier} className="flex items-center justify-between">
              <span className="font-medium">{carrier}</span>
              <Badge variant={
                status === 'connected' ? 'default' :
                status === 'error' ? 'destructive' : 'secondary'
              }>
                {status === 'connected' ? 'Connected' :
                 status === 'error' ? 'Error' : 'Not Configured'}
              </Badge>
            </div>
          ))}
        </div>
        {Object.values(apiStatus).some(status => status === 'unconfigured') && (
          <p className="text-sm text-muted-foreground mt-2">
            Visit System Settings to configure missing API keys for automatic tracking sync.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiStatusCard;
