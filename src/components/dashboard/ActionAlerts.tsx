import React from 'react';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Package, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActionAlerts: React.FC = () => {
  const navigate = useNavigate();
  
  // Get packages needing attention
  const { data: readyForPickupResult } = useOptimizedPackages({ 
    statusFilter: 'ready_for_pickup' 
  }, { page: 1, limit: 5 });
  
  const { data: arrivedResult } = useOptimizedPackages({ 
    statusFilter: 'arrived' 
  }, { page: 1, limit: 5 });

  const readyForPickup = readyForPickupResult?.data || [];
  const arrivedPackages = arrivedResult?.data || [];
  
  const alerts = [
    {
      id: 'ready_pickup',
      title: 'Ready for Pickup',
      count: readyForPickup.length,
      icon: Package,
      color: 'bg-orange-500',
      action: () => navigate('/dashboard?tab=packages&status=ready_for_pickup'),
      description: 'Packages waiting for customer pickup'
    },
    {
      id: 'just_arrived',
      title: 'Just Arrived',
      count: arrivedPackages.length,
      icon: Clock,
      color: 'bg-blue-500',
      action: () => navigate('/dashboard?tab=packages&status=arrived'),
      description: 'Recently arrived packages to process'
    }
  ];

  const urgentAlerts = alerts.filter(alert => alert.count > 0);

  if (urgentAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            All Clear
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No urgent actions required at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {urgentAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${alert.color}`}>
                <alert.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{alert.title}</span>
                  <Badge variant="secondary">{alert.count}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {alert.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={alert.action}
              className="flex items-center gap-1"
            >
              View
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActionAlerts;