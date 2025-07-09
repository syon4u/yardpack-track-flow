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
      <Card className="glass-card border-emerald/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-emerald" />
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
    <Card className="glass-card border-amber/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <AlertTriangle className="h-5 w-5 text-amber" />
          Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {urgentAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-accent/30 transition-colors backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${alert.color}`}>
                <alert.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">{alert.title}</span>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground font-medium">{alert.count}</Badge>
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
              className="flex items-center gap-1 text-foreground hover:bg-accent"
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