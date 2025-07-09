import React from 'react';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const RecentActivity: React.FC = () => {
  const navigate = useNavigate();
  const { data: packagesResult } = useOptimizedPackages({}, { page: 1, limit: 10 });
  
  const recentPackages = packagesResult?.data?.slice(0, 8) || [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'received': return 'secondary';
      case 'in_transit': return 'default';
      case 'arrived': return 'outline';
      case 'ready_for_pickup': return 'secondary';
      case 'picked_up': return 'default';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received': return 'Received at Miami';
      case 'in_transit': return 'In Transit';
      case 'arrived': return 'Arrived in Jamaica';
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'picked_up': return 'Picked Up';
      default: return status;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/dashboard?tab=packages')}
          className="flex items-center gap-2 border-border text-foreground hover:bg-accent"
        >
          View All
          <ExternalLink className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentPackages.length > 0 ? (
          recentPackages.map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-accent/30 transition-colors backdrop-blur-sm">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-foreground">
                      {pkg.tracking_number}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {pkg.customer_name || 'Unknown Customer'}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(pkg.status)} className="text-xs font-medium">
                    {getStatusLabel(pkg.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(pkg.updated_at), 'MMM d, HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;