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
      <Card className="vibrant-card glass-card border-0 backdrop-blur-sm bg-gradient-success animate-fade-in" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            All Clear
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white font-medium">
            No urgent actions required at this time. ✨
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="vibrant-card glass-card border-0 backdrop-blur-sm bg-gradient-warm animate-fade-in" style={{ animationDelay: '700ms' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
          <AlertTriangle className="h-5 w-5 animate-pulse-glow" />
          Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {urgentAlerts.map((alert, index) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] animate-fade-in"
            style={{ animationDelay: `${800 + index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm animate-float">
                <alert.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">{alert.title}</span>
                  <Badge 
                    variant="secondary" 
                    className="bg-white/30 text-white border-white/50 px-2 py-1 rounded-full font-semibold"
                  >
                    {alert.count}
                  </Badge>
                </div>
                <p className="text-xs text-white font-medium">
                  {alert.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={alert.action}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white border-white/20 transition-all duration-300"
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