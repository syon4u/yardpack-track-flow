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
  ChevronDown,
  ChevronRight,
  FileText,
  User,
  Settings,
  QrCode,
  Camera
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useUpdatePackageStatus } from '@/hooks/packages/useUpdatePackageStatus';
import { useSendNotification } from '@/hooks/useNotifications';
import { useGeneratePickupCode } from '@/hooks/usePickupVerification';
import { format } from 'date-fns';

type PackageStatus = Database['public']['Enums']['package_status'];
type PackageRow = Database['public']['Tables']['packages']['Row'];

interface Activity {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  icon: React.ComponentType<{ className?: string }>;
  completedAt?: string;
}

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
  const [expandedStage, setExpandedStage] = useState<PackageStatus | null>(null);
  const [confirmingStatus, setConfirmingStatus] = useState<PackageStatus | null>(null);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdatePackageStatus();
  const { mutate: sendNotification, isPending: isSendingNotification } = useSendNotification();
  const generatePickupCode = useGeneratePickupCode();

  // Define activities for each stage (like Dynamics 365 CRM)
  const getActivitiesForStage = (status: PackageStatus): Activity[] => {
    const baseActivities = {
      received: [
        {
          id: 'log-package',
          name: 'Log Package Details',
          description: 'Record package information in system',
          required: true,
          completed: true,
          icon: FileText,
          completedAt: packageData.created_at
        },
        {
          id: 'verify-customer',
          name: 'Verify Customer Information',
          description: 'Confirm customer details and contact info',
          required: true,
          completed: !!packageData.customer_id,
          icon: User
        },
        {
          id: 'send-confirmation',
          name: 'Send Confirmation Email',
          description: 'Notify customer that package was received',
          required: false,
          completed: packageData.last_notification_status === 'received' && !!packageData.last_notification_sent_at,
          icon: Mail,
          completedAt: packageData.last_notification_sent_at || undefined
        }
      ],
      in_transit: [
        {
          id: 'update-tracking',
          name: 'Update Tracking Information',
          description: 'Record transit details and estimated arrival',
          required: true,
          completed: !!packageData.external_tracking_number,
          icon: Truck
        },
        {
          id: 'send-transit-notification',
          name: 'Send Transit Notification',
          description: 'Inform customer package is in transit',
          required: false,
          completed: packageData.last_notification_status === 'in_transit' && !!packageData.last_notification_sent_at,
          icon: Mail,
          completedAt: packageData.last_notification_sent_at || undefined
        }
      ],
      arrived: [
        {
          id: 'customs-processing',
          name: 'Process Through Customs',
          description: 'Complete customs clearance procedures',
          required: true,
          completed: !!packageData.duty_amount,
          icon: FileText
        },
        {
          id: 'warehouse-assignment',
          name: 'Assign Warehouse Location',
          description: 'Allocate storage location in facility',
          required: true,
          completed: !!packageData.warehouse_location,
          icon: MapPin
        },
        {
          id: 'send-arrival-notification',
          name: 'Send Arrival Notification',
          description: 'Notify customer of package arrival',
          required: false,
          completed: packageData.last_notification_status === 'arrived' && !!packageData.last_notification_sent_at,
          icon: Mail,
          completedAt: packageData.last_notification_sent_at || undefined
        }
      ],
      ready_for_pickup: [
        {
          id: 'generate-pickup-code',
          name: 'Generate Pickup Code',
          description: 'Create unique pickup verification code',
          required: true,
          completed: false, // Would need to check pickup_codes table
          icon: QrCode
        },
        {
          id: 'prepare-package',
          name: 'Prepare Package for Pickup',
          description: 'Move package to pickup area',
          required: true,
          completed: packageData.warehouse_location === 'pickup_area',
          icon: Package
        },
        {
          id: 'send-pickup-notification',
          name: 'Send Pickup Ready Notification',
          description: 'Inform customer package is ready',
          required: true,
          completed: packageData.last_notification_status === 'ready_for_pickup' && !!packageData.last_notification_sent_at,
          icon: Mail,
          completedAt: packageData.last_notification_sent_at || undefined
        }
      ],
      picked_up: [
        {
          id: 'verify-identity',
          name: 'Verify Customer Identity',
          description: 'Confirm pickup person authorization',
          required: true,
          completed: !!packageData.actual_delivery,
          icon: User,
          completedAt: packageData.actual_delivery || undefined
        },
        {
          id: 'capture-signature',
          name: 'Capture Digital Signature',
          description: 'Record pickup confirmation signature',
          required: true,
          completed: !!packageData.actual_delivery,
          icon: Camera,
          completedAt: packageData.actual_delivery || undefined
        },
        {
          id: 'complete-process',
          name: 'Complete Package Process',
          description: 'Close package in system',
          required: true,
          completed: packageData.status === 'picked_up',
          icon: CheckCircle,
          completedAt: packageData.actual_delivery || undefined
        }
      ]
    };

    return baseActivities[status] || [];
  };

  const stages = [
    {
      status: 'received' as PackageStatus,
      label: 'Package Received',
      icon: Package,
      description: 'Package logged and processed',
    },
    {
      status: 'in_transit' as PackageStatus,
      label: 'In Transit',
      icon: Truck,
      description: 'En route to Jamaica',
    },
    {
      status: 'arrived' as PackageStatus,
      label: 'Arrived in Jamaica',
      icon: MapPin,
      description: 'Customs and warehouse processing',
    },
    {
      status: 'ready_for_pickup' as PackageStatus,
      label: 'Ready for Pickup',
      icon: Clock,
      description: 'Available for customer collection',
    },
    {
      status: 'picked_up' as PackageStatus,
      label: 'Package Delivered',
      icon: CheckCircle,
      description: 'Successfully delivered to customer',
    },
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage.status === packageData.status);
  };

  const getStageStatus = (stageIndex: number) => {
    const currentIndex = getCurrentStageIndex();
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'inactive';
  };

  const canAdvanceToStatus = (targetStatus: PackageStatus) => {
    if (userRole === 'customer') return false;
    
    const currentIndex = getCurrentStageIndex();
    const targetIndex = stages.findIndex(stage => stage.status === targetStatus);
    
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

  const handleGeneratePickupCode = async (codeType: 'qr' | 'pin') => {
    try {
      await generatePickupCode.mutateAsync({
        package_id: packageData.id,
        code_type: codeType,
        expires_in_hours: 48 // 2 days expiry
      });
    } catch (error) {
      console.error('Failed to generate pickup code:', error);
    }
  };

  const getRequiredActivitiesCount = (status: PackageStatus) => {
    const activities = getActivitiesForStage(status);
    const required = activities.filter(a => a.required);
    const completed = activities.filter(a => a.required && a.completed);
    return { completed: completed.length, total: required.length };
  };

  const isStageCompleted = (status: PackageStatus) => {
    const counts = getRequiredActivitiesCount(status);
    return counts.completed === counts.total;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Business Process Flow</h3>
        <Badge variant="outline" className="text-sm">
          {stages[getCurrentStageIndex()]?.label}
        </Badge>
      </div>

      {/* Dynamics 365 Style Process Flow */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between relative">
          {stages.map((stage, index) => {
            const stageStatus = getStageStatus(index);
            const Icon = stage.icon;
            const activities = getActivitiesForStage(stage.status);
            const requiredCounts = getRequiredActivitiesCount(stage.status);
            const isExpanded = expandedStage === stage.status;
            const canAdvance = canAdvanceToStatus(stage.status);
            
            return (
              <div key={stage.status} className="flex-1 relative">
                {/* Stage Header */}
                <div className="flex flex-col items-center">
                  {/* Stage Circle */}
                  <div className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center border-3 transition-all duration-300 cursor-pointer
                    ${stageStatus === 'completed' 
                      ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' 
                      : stageStatus === 'active'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md animate-pulse'
                      : 'bg-gray-50 border-gray-300 text-gray-400'
                    }
                    ${canAdvance ? 'hover:bg-blue-100 hover:border-blue-600' : ''}
                  `}
                  onClick={() => setExpandedStage(isExpanded ? null : stage.status)}
                  >
                    <Icon className="w-6 h-6" />
                    {stageStatus === 'completed' && (
                      <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-green-600 bg-white rounded-full shadow-sm" />
                    )}
                    {stageStatus === 'active' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="text-center mt-3 max-w-32">
                    <p className={`text-sm font-semibold ${
                      stageStatus === 'active' ? 'text-blue-700' : 
                      stageStatus === 'completed' ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stage.description}
                    </p>
                    
                    {/* Progress Indicator */}
                    <div className="mt-2">
                      <div className={`text-xs ${
                        stageStatus === 'active' ? 'text-blue-600' : 
                        stageStatus === 'completed' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {requiredCounts.completed}/{requiredCounts.total} Required
                      </div>
                      
                      {/* Expand/Collapse Indicator */}
                      <button
                        onClick={() => setExpandedStage(isExpanded ? null : stage.status)}
                        className="mt-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Connection Line */}
                {index < stages.length - 1 && (
                  <div className={`
                    absolute top-8 left-[calc(100%-2rem)] w-[calc(100%-4rem)] h-0.5 
                    ${index < getCurrentStageIndex() ? 'bg-green-500' : 'bg-gray-300'}
                    transition-colors duration-300
                  `} />
                )}

                {/* Expanded Activities (Dynamics 365 style) */}
                {isExpanded && (
                  <div className="absolute top-24 left-0 right-0 z-10 bg-white border rounded-lg shadow-lg p-4 animate-fade-in">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700 border-b pb-2">
                        Stage Activities
                      </h4>
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs
                            ${activity.completed 
                              ? 'bg-green-100 text-green-700' 
                              : activity.required 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-500'
                            }
                          `}>
                            {activity.completed ? <CheckCircle className="w-3 h-3" /> : <activity.icon className="w-3 h-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${activity.completed ? 'text-green-700' : 'text-gray-700'}`}>
                                {activity.name}
                              </p>
                              {activity.required && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                            {activity.completedAt && (
                              <p className="text-xs text-green-600 mt-1">
                                Completed: {format(new Date(activity.completedAt), 'MMM dd, yyyy HH:mm')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Action Buttons for Admins */}
                      {userRole !== 'customer' && stageStatus === 'active' && (
                        <div className="border-t pt-3 flex gap-2">
                          {canAdvance && isStageCompleted(stage.status) && (
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={() => handleStatusChange(stage.status)}
                              disabled={isUpdatingStatus && confirmingStatus === stage.status}
                            >
                              {isUpdatingStatus && confirmingStatus === stage.status 
                                ? 'Advancing...' 
                                : 'Complete Stage'
                              }
                            </Button>
                          )}
                           <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleSendNotification(stage.status)}
                            disabled={isSendingNotification}
                          >
                            {isSendingNotification ? 'Sending...' : 'Send Notification'}
                          </Button>
                          {stage.status === 'ready_for_pickup' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleGeneratePickupCode('pin')}
                                disabled={generatePickupCode.isPending}
                              >
                                {generatePickupCode.isPending ? 'Generating...' : 'Generate PIN'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleGeneratePickupCode('qr')}
                                disabled={generatePickupCode.isPending}
                              >
                                {generatePickupCode.isPending ? 'Generating...' : 'Generate QR'}
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-3 text-gray-700">Process Timeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Package Received:</span>
            <span className="font-medium">
              {format(new Date(packageData.date_received), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
          {packageData.estimated_delivery && (
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-medium">
                {format(new Date(packageData.estimated_delivery), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
          {packageData.actual_delivery && (
            <div className="flex justify-between">
              <span className="text-gray-600">Actual Delivery:</span>
              <span className="font-medium text-green-600">
                {format(new Date(packageData.actual_delivery), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
          )}
          {packageData.last_notification_sent_at && (
            <div className="flex justify-between">
              <span className="text-gray-600">Last Notification:</span>
              <span className="font-medium">
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