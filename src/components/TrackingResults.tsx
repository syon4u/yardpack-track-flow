import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type PackageRow = Database['public']['Tables']['packages']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface PackageWithProfile extends PackageRow {
  profiles: ProfileRow | null;
}

interface TrackingResultsProps {
  trackingNumber: string;
  onBack: () => void;
}

const TrackingResults: React.FC<TrackingResultsProps> = ({ trackingNumber, onBack }) => {
  const [packageData, setPackageData] = useState<PackageWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select(`
            *,
            customers!fk_packages_customer_id(
              full_name,
              email
            )
          `)
          .eq('tracking_number', trackingNumber.trim())
          .single();

        if (error) {
          setError('Package not found. Please check your tracking number.');
          return;
        }

        // Transform the data to match our expected structure
        const transformedData: PackageWithProfile = {
          ...data,
          profiles: data.customers ? {
            id: '',
            full_name: data.customers.full_name,
            email: data.customers.email || '',
            phone_number: null,
            address: null,
            role: 'customer' as const,
            created_at: '',
            updated_at: ''
          } : null
        };

        setPackageData(transformedData);
      } catch (err) {
        setError('Failed to fetch package information.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [trackingNumber]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-500';
      case 'in_transit': return 'bg-yellow-500';
      case 'arrived_jamaica': return 'bg-orange-500';
      case 'ready_pickup': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Received at Miami';
      case 'in_transit': return 'In Transit to Jamaica';
      case 'arrived_jamaica': return 'Arrived in Jamaica';
      case 'ready_pickup': return 'Ready for Pickup';
      case 'completed': return 'Delivered/Completed';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle className="h-6 w-6 text-white" />;
    }
    
    switch (status) {
      case 'received': return <Package className="h-6 w-6 text-white" />;
      case 'in_transit': return <Truck className="h-6 w-6 text-white" />;
      case 'arrived_jamaica': return <MapPin className="h-6 w-6 text-white" />;
      case 'ready_pickup': return <CheckCircle className="h-6 w-6 text-white" />;
      case 'completed': return <CheckCircle className="h-6 w-6 text-white" />;
      default: return <Clock className="h-6 w-6 text-white" />;
    }
  };

  const statusFlow = ['received', 'in_transit', 'arrived_jamaica', 'ready_pickup', 'completed'];
  const currentStatusIndex = packageData ? statusFlow.indexOf(packageData.status) : -1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-green-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-green-300 hover:text-yellow-400 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Package Tracking</h1>
              <p className="text-green-200">Tracking Number: {trackingNumber}</p>
            </div>
            <Package className="h-12 w-12 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="p-8 text-center">
              <div className="text-red-400 text-xl mb-4">{error}</div>
              <Button onClick={onBack} variant="outline" className="border-red-500 text-red-400">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : packageData ? (
          <div className="space-y-8">
            {/* Package Overview */}
            <Card className="bg-white/5 backdrop-blur-md border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Package Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-green-200 text-sm">Description</p>
                    <p className="text-white font-semibold">{packageData.description}</p>
                  </div>
                  <div>
                    <p className="text-green-200 text-sm">Current Status</p>
                    <Badge className={`${getStatusColor(packageData.status)} text-white`}>
                      {getStatusText(packageData.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-green-200 text-sm">Date Received</p>
                    <p className="text-white">{new Date(packageData.date_received).toLocaleDateString()}</p>
                  </div>
                  {packageData.estimated_delivery && (
                    <div>
                      <p className="text-green-200 text-sm">Estimated Delivery</p>
                      <p className="text-white">{new Date(packageData.estimated_delivery).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-white/5 backdrop-blur-md border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Shipping Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {statusFlow.map((status, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    
                    return (
                      <div key={status} className="flex items-center space-x-4">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center border-2
                          ${isCompleted 
                            ? `${getStatusColor(status)} border-transparent` 
                            : 'bg-gray-600 border-gray-500'
                          }
                          ${isCurrent ? 'ring-4 ring-yellow-400/50' : ''}
                        `}>
                          {getStatusIcon(status, isCompleted)}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
                            {getStatusText(status)}
                          </h3>
                          <p className={`text-sm ${isCompleted ? 'text-green-200' : 'text-gray-500'}`}>
                            {isCompleted 
                              ? isCurrent 
                                ? 'Current Status' 
                                : 'Completed'
                              : 'Pending'
                            }
                          </p>
                        </div>
                        {index < statusFlow.length - 1 && (
                          <div className={`w-px h-16 ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(packageData.sender_name || packageData.delivery_address) && (
              <Card className="bg-white/5 backdrop-blur-md border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Shipping Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {packageData.sender_name && (
                      <div>
                        <p className="text-green-200 text-sm">Sender</p>
                        <p className="text-white">{packageData.sender_name}</p>
                      </div>
                    )}
                    {packageData.delivery_address && (
                      <div>
                        <p className="text-green-200 text-sm">Delivery Address</p>
                        <p className="text-white">{packageData.delivery_address}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TrackingResults;
