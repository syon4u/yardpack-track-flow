
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, RefreshCw, Clock, MapPin, Loader2 } from 'lucide-react';
import { useTrackingEvents, useUSPSTracking } from '@/hooks/useTrackingAPI';
import { format } from 'date-fns';

interface TrackingDisplayProps {
  packageData: {
    id: string;
    tracking_number: string;
    external_tracking_number?: string;
    carrier?: string;
    status: string;
    api_sync_status?: string;
    last_api_sync?: string;
  };
}

const TrackingDisplay: React.FC<TrackingDisplayProps> = ({ packageData }) => {
  const { data: trackingEvents, isLoading } = useTrackingEvents(packageData.id);
  const uspsTrackingMutation = useUSPSTracking();

  const handleRefreshTracking = async () => {
    if (!packageData.external_tracking_number || packageData.carrier !== 'USPS') {
      return;
    }

    try {
      await uspsTrackingMutation.mutateAsync({
        trackingNumber: packageData.external_tracking_number,
        packageId: packageData.id
      });
    } catch (error) {
      console.error('Failed to refresh tracking:', error);
    }
  };

  const canRefreshTracking = packageData.external_tracking_number && packageData.carrier === 'USPS';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Tracking Information
          </div>
          {canRefreshTracking && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshTracking}
              disabled={uspsTrackingMutation.isPending}
              className="flex items-center gap-2"
            >
              {uspsTrackingMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Internal Tracking</p>
            <p className="font-mono text-sm">{packageData.tracking_number}</p>
          </div>
          {packageData.external_tracking_number && (
            <div>
              <p className="text-sm font-medium text-gray-600">Carrier Tracking</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm">{packageData.external_tracking_number}</p>
                {packageData.carrier && (
                  <Badge variant="secondary" className="text-xs">
                    {packageData.carrier}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant="default">{packageData.status}</Badge>
          </div>
          {packageData.api_sync_status && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">API Sync:</span>
              <Badge variant={packageData.api_sync_status === 'synced' ? 'default' : 'secondary'}>
                {packageData.api_sync_status}
              </Badge>
            </div>
          )}
        </div>

        {packageData.last_api_sync && (
          <div className="text-xs text-gray-500">
            Last synced: {format(new Date(packageData.last_api_sync), 'MMM dd, yyyy HH:mm')}
          </div>
        )}

        {/* Tracking Events */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Loading tracking events...</span>
          </div>
        ) : trackingEvents && trackingEvents.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Tracking History</h4>
            <div className="space-y-2">
              {trackingEvents.map((event, index) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {event.carrier}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {event.event_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-900">{event.event_description}</p>
                    <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.event_timestamp), 'MMM dd, yyyy HH:mm')}
                      </div>
                      {event.event_location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.event_location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            No tracking events available
            {!packageData.external_tracking_number && (
              <p className="text-xs mt-1">Add carrier tracking number to enable tracking</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrackingDisplay;
