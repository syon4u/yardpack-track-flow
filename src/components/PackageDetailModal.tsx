
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MagayaIntegrationPanel } from './magaya/MagayaIntegrationPanel';
import { TransformedPackage } from '@/types/package';
import { format } from 'date-fns';
import { Package, Calendar, User, MapPin, DollarSign, FileText } from 'lucide-react';

interface PackageDetailModalProps {
  packageData: TransformedPackage | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'customer' | 'admin' | 'warehouse';
}

const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  packageData,
  isOpen,
  onClose,
  userRole,
}) => {
  if (!packageData) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'arrived':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ready_for_pickup':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'picked_up':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Package Details - {packageData.tracking_number}
          </DialogTitle>
          <DialogDescription>
            Comprehensive package information and management
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Package Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Package Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={getStatusColor(packageData.status)}>
                  {packageData.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-muted-foreground">{packageData.description}</p>
                </div>
                <div>
                  <span className="font-medium">External Tracking:</span>
                  <p className="text-muted-foreground font-mono">
                    {packageData.external_tracking_number || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Weight:</span>
                  <p className="text-muted-foreground">
                    {packageData.weight ? `${packageData.weight} lbs` : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Dimensions:</span>
                  <p className="text-muted-foreground">{packageData.dimensions || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Value:</span>
                  <p className="text-muted-foreground">
                    {packageData.package_value ? `$${packageData.package_value}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Carrier:</span>
                  <p className="text-muted-foreground">{packageData.carrier || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Name:</span>
                <p className="text-muted-foreground">{packageData.customer_name}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium">Email:</span>
                <p className="text-muted-foreground">{packageData.customer_email || 'N/A'}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium">Delivery Address:</span>
                <p className="text-muted-foreground">{packageData.delivery_address}</p>
              </div>
              {packageData.sender_name && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <span className="font-medium">Sender:</span>
                    <p className="text-muted-foreground">{packageData.sender_name}</p>
                  </div>
                  {packageData.sender_address && (
                    <div className="text-sm">
                      <span className="font-medium">Sender Address:</span>
                      <p className="text-muted-foreground">{packageData.sender_address}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span className="font-medium">Date Received:</span>
                  <p className="text-muted-foreground">{formatDate(packageData.date_received)}</p>
                </div>
                <div>
                  <span className="font-medium">Estimated Delivery:</span>
                  <p className="text-muted-foreground">{formatDate(packageData.estimated_delivery)}</p>
                </div>
                {packageData.actual_delivery && (
                  <div>
                    <span className="font-medium">Actual Delivery:</span>
                    <p className="text-muted-foreground">{formatDate(packageData.actual_delivery)}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">{formatDate(packageData.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          {(packageData.duty_amount || packageData.total_due) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {packageData.duty_rate && (
                    <div>
                      <span className="font-medium">Duty Rate:</span>
                      <p className="text-muted-foreground">{(packageData.duty_rate * 100).toFixed(1)}%</p>
                    </div>
                  )}
                  {packageData.duty_amount && (
                    <div>
                      <span className="font-medium">Duty Amount:</span>
                      <p className="text-muted-foreground">${packageData.duty_amount.toFixed(2)}</p>
                    </div>
                  )}
                  {packageData.total_due && (
                    <div className="col-span-2">
                      <span className="font-medium">Total Due:</span>
                      <p className="text-lg font-semibold text-green-600">
                        ${packageData.total_due.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Magaya Integration Panel - Only for admin/warehouse */}
        {userRole !== 'customer' && (
          <>
            <Separator className="my-6" />
            <MagayaIntegrationPanel packageData={packageData} />
          </>
        )}

        {/* Invoice Information */}
        {packageData.invoices && packageData.invoices.length > 0 && (
          <>
            <Separator className="my-6" />
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  Uploaded invoice documents for this package
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {packageData.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{invoice.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded: {format(new Date(invoice.uploaded_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Notes */}
        {packageData.notes && (
          <>
            <Separator className="my-6" />
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{packageData.notes}</p>
              </CardContent>
            </Card>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PackageDetailModal;
