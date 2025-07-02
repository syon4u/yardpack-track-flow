import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Mail, 
  MailCheck, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useUpdatePackageStatus } from '@/hooks/packages/useUpdatePackageStatus';
import { useSendNotification } from '@/hooks/useNotifications';
import { format } from 'date-fns';

type PackageStatus = Database['public']['Enums']['package_status'];
type PackageRow = Database['public']['Tables']['packages']['Row'];

interface PackageProcessFlowProps {
  packageData: PackageRow;
  userRole: 'customer' | 'admin' | 'warehouse';
  onStatusChange?: () => void;
}

const PackageProcessFlow: React.FC<PackageProcessFlowProps> = ({
  packageData,
  userRole,
  onStatusChange
}) => {
  const [confirmingStatus, setConfirmingStatus] = useState<PackageStatus | null>(null);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdatePackageStatus();
  const { mutate: sendNotification, isPending: isSendingNotification } = useSendNotification();

  const stages = [
    {
      status: 'received' as PackageStatus,
      label: 'Received',
      icon: Package,
      description: 'Package received at facility',
      actions: ['Generate tracking info', 'Send confirmation'],
    },
    {
      status: 'in_transit' as PackageStatus,
      label: 'In Transit',
      icon: Truck,
      description: 'Package in transit to Jamaica',
      actions: ['Update tracking data', 'Send transit notification'],
    },
    {
      status: 'arrived' as PackageStatus,
      label: 'Arrived',
      icon: MapPin,
      description: 'Package arrived in Jamaica',
      actions: ['Assign warehouse location', 'Process customs'],
    },
    {
      status: 'ready_for_pickup' as PackageStatus,
      label: 'Ready for Pickup',
      icon: Clock,
      description: 'Package ready for customer pickup',
      actions: ['Generate pickup code', 'Send pickup notification'],
    },
    {
      status: 'picked_up' as PackageStatus,
      label: 'Picked Up',
      icon: CheckCircle,
      description: 'Package picked up by customer',
      actions: ['Complete verification', 'Close package'],
    },
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage.status === packageData.status);
  };

  const getStageStatus = (stageIndex: number) => {
    const currentIndex = getCurrentStageIndex();
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'pending';
  };

  const canAdvanceToStatus = (targetStatus: PackageStatus) => {
    if (userRole === 'customer') return false;
    
    const currentIndex = getCurrentStageIndex();
    const targetIndex = stages.findIndex(stage => stage.status === targetStatus);
    
    // Can only advance to the next stage
    return targetIndex === currentIndex + 1;
  };

  const handleStatusChange = (newStatus: PackageStatus) => {
    if (!canAdvanceToStatus(newStatus)) return;
    
    setConfirmingStatus(newStatus);
    updateStatus({ packageId: packageData.id, status: newStatus }, {
      onSuccess: () => {
        setConfirmingStatus(null);
        onStatusChange?.();
      },
      onError: () => {
        setConfirmingStatus(null);
      }
    });
  };

  const handleSendNotification = (status: PackageStatus) => {
    sendNotification({ packageId: packageData.id, status });
  };

  const getNotificationStatus = (status: PackageStatus) => {
    if (packageData.last_notification_status === status && packageData.last_notification_sent_at) {
      return 'sent';
    }
    return 'none';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Package Process Flow</h3>
        <Badge variant="outline" className="text-sm">
          Current: {stages[getCurrentStageIndex()]?.label}
        </Badge>
      </div>

      {/* Horizontal Flow */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const stageStatus = getStageStatus(index);
            const Icon = stage.icon;
            const notificationStatus = getNotificationStatus(stage.status);
            const canAdvance = canAdvanceToStatus(stage.status);
            
            return (
              <React.Fragment key={stage.status}>
                <div className="flex flex-col items-center space-y-2 flex-1">
                  {/* Stage Icon */}
                  <div className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                    ${stageStatus === 'completed' 
                      ? 'bg-green-100 border-green-500 text-green-700' 
                      : stageStatus === 'current'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                    }
                    ${canAdvance ? 'cursor-pointer hover:bg-blue-50' : ''}
                  `}
                  onClick={() => canAdvance && handleStatusChange(stage.status)}
                  >
                    <Icon className="w-5 h-5" />
                    {stageStatus === 'completed' && (
                      <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-600 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      stageStatus === 'current' ? 'text-blue-700' : 
                      stageStatus === 'completed' ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-gray-500 max-w-24 break-words">
                      {stage.description}
                    </p>
                  </div>

                  {/* Notification Status */}
                  <div className="flex items-center gap-1">
                    {notificationStatus === 'sent' ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <MailCheck className="w-3 h-3" />
                        <span className="text-xs">Sent</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">-</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Admins */}
                  {userRole !== 'customer' && stageStatus === 'current' && (
                    <div className="flex flex-col gap-1 mt-2">
                      {canAdvance && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 px-2"
                          onClick={() => handleStatusChange(stage.status)}
                          disabled={isUpdatingStatus && confirmingStatus === stage.status}
                        >
                          {isUpdatingStatus && confirmingStatus === stage.status 
                            ? 'Updating...' 
                            : 'Advance'
                          }
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-6 px-2"
                        onClick={() => handleSendNotification(stage.status)}
                        disabled={isSendingNotification}
                      >
                        {isSendingNotification ? 'Sending...' : 'Notify'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Connector Arrow */}
                {index < stages.length - 1 && (
                  <div className={`
                    flex items-center justify-center w-8 h-12
                    ${index < getCurrentStageIndex() ? 'text-green-500' : 'text-gray-300'}
                  `}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Timeline Information */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Timeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Date Received:</span>
            <span className="ml-2 font-medium">
              {format(new Date(packageData.date_received), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
          {packageData.estimated_delivery && (
            <div>
              <span className="text-gray-600">Est. Delivery:</span>
              <span className="ml-2 font-medium">
                {format(new Date(packageData.estimated_delivery), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
          {packageData.actual_delivery && (
            <div>
              <span className="text-gray-600">Actual Delivery:</span>
              <span className="ml-2 font-medium">
                {format(new Date(packageData.actual_delivery), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
          )}
          {packageData.last_notification_sent_at && (
            <div>
              <span className="text-gray-600">Last Notification:</span>
              <span className="ml-2 font-medium">
                {format(new Date(packageData.last_notification_sent_at), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageProcessFlow;