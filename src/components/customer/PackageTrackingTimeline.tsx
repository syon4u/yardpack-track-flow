import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Plane, 
  Ship, 
  MapPin, 
  Clock, 
  CheckCircle,
  Circle,
  Truck,
  Archive,
  ExternalLink
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type PackageStatus = Database['public']['Enums']['package_status'];

interface TrackingEvent {
  id: string;
  status: PackageStatus;
  timestamp: string;
  location?: string;
  description: string;
  isCompleted: boolean;
  icon: React.ElementType;
}

interface PackageTrackingTimelineProps {
  packageData: {
    id: string;
    tracking_number: string;
    status: PackageStatus;
    date_received: string;
    estimated_delivery?: string | null;
    actual_delivery?: string | null;
    carrier?: string | null;
    external_tracking_number?: string | null;
    last_api_sync?: string | null;
  };
  trackingEvents?: Array<{
    id: string;
    event_type: string;
    event_description: string;
    event_location?: string | null;
    event_timestamp: string;
  }>;
}

const PackageTrackingTimeline: React.FC<PackageTrackingTimelineProps> = ({
  packageData,
  trackingEvents = []
}) => {
  // Create timeline events based on package status and tracking events
  const createTimelineEvents = (): TrackingEvent[] => {
    const events: TrackingEvent[] = [];
    const currentStatus = packageData.status;
    
    // Define the standard journey
    const standardJourney = [
      {
        status: 'received' as PackageStatus,
        description: 'Package received at Miami warehouse',
        location: 'Miami, FL',
        icon: Archive,
      },
      {
        status: 'in_transit' as PackageStatus,
        description: 'Package in transit to Jamaica',
        location: 'In Transit',
        icon: Ship,
      },
      {
        status: 'arrived' as PackageStatus,
        description: 'Package arrived in Jamaica',
        location: 'Kingston, Jamaica',
        icon: Plane,
      },
      {
        status: 'ready_for_pickup' as PackageStatus,
        description: 'Package ready for pickup',
        location: 'YardPack Warehouse',
        icon: Package,
      },
      {
        status: 'picked_up' as PackageStatus,
        description: 'Package picked up by customer',
        location: 'Customer',
        icon: CheckCircle,
      },
    ];

    // Map status to completion order
    const statusOrder = {
      'received': 0,
      'in_transit': 1,
      'arrived': 2,
      'ready_for_pickup': 3,
      'picked_up': 4,
    };

    const currentStatusIndex = statusOrder[currentStatus];

    // Create events with completion status
    standardJourney.forEach((journey, index) => {
      const isCompleted = index <= currentStatusIndex;
      
      // Find corresponding timestamp
      let timestamp = '';
      if (journey.status === 'received') {
        timestamp = packageData.date_received;
      } else if (journey.status === 'picked_up' && packageData.actual_delivery) {
        timestamp = packageData.actual_delivery;
      } else if (isCompleted) {
        // Use tracking events if available
        const trackingEvent = trackingEvents.find(te => 
          te.event_type.toLowerCase().includes(journey.status) ||
          te.event_description.toLowerCase().includes(journey.status)
        );
        timestamp = trackingEvent?.event_timestamp || new Date().toISOString();
      }

      events.push({
        id: `${journey.status}-${index}`,
        status: journey.status,
        timestamp,
        location: journey.location,
        description: journey.description,
        isCompleted,
        icon: journey.icon,
      });
    });

    return events;
  };

  const timelineEvents = createTimelineEvents();

  const getStatusColor = (status: PackageStatus, isCompleted: boolean) => {
    if (!isCompleted) return 'text-muted-foreground';
    
    switch (status) {
      case 'received': return 'text-blue-600';
      case 'in_transit': return 'text-yellow-600';
      case 'arrived': return 'text-purple-600';
      case 'ready_for_pickup': return 'text-green-600';
      case 'picked_up': return 'text-emerald-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: PackageStatus) => {
    const variants = {
      'received': 'bg-blue-100 text-blue-800',
      'in_transit': 'bg-yellow-100 text-yellow-800',
      'arrived': 'bg-purple-100 text-purple-800',
      'ready_for_pickup': 'bg-green-100 text-green-800',
      'picked_up': 'bg-emerald-100 text-emerald-800',
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Package Tracking Timeline
          </div>
          {getStatusBadge(packageData.status)}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Tracking: {packageData.tracking_number}</span>
          {packageData.carrier && (
            <span>Carrier: {packageData.carrier}</span>
          )}
          {packageData.external_tracking_number && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              External Tracking
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timeline */}
          <div className="relative">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              const isLast = index === timelineEvents.length - 1;
              
              return (
                <div key={event.id} className="flex items-start gap-4 relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div 
                      className={`absolute left-5 top-10 w-0.5 h-16 ${
                        event.isCompleted ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                  
                  {/* Icon */}
                  <div 
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      event.isCompleted 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'bg-background border-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-8">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${
                        event.isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {event.description}
                      </h4>
                      {event.timestamp && event.isCompleted && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(event.timestamp), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                    
                    {event.timestamp && event.isCompleted && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(event.timestamp), 'h:mm a')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estimated Delivery */}
          {packageData.estimated_delivery && packageData.status !== 'picked_up' && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Estimated Delivery</span>
                </div>
                <span className="text-sm font-medium">
                  {format(parseISO(packageData.estimated_delivery), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          )}

          {/* Last Sync Info */}
          {packageData.last_api_sync && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              Last updated: {format(parseISO(packageData.last_api_sync), 'MMM dd, yyyy h:mm a')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageTrackingTimeline;