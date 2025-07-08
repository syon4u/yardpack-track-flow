import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Package, Users, RefreshCw } from 'lucide-react';
import { useMagayaBulkSync } from '@/hooks/useMagayaBulkSync';

interface MagayaBulkSyncModalProps {
  open: boolean;
  onClose: () => void;
}

const MagayaBulkSyncModal: React.FC<MagayaBulkSyncModalProps> = ({
  open,
  onClose,
}) => {
  const {
    startBulkSync,
    isStarting,
    syncSession,
    isSessionLoading,
    progress,
    isInProgress,
    isCompleted,
    isFailed,
    clearSession,
  } = useMagayaBulkSync();

  const handleStartSync = () => {
    startBulkSync('Jhavar Leakey');
  };

  const handleClose = () => {
    clearSession();
    onClose();
  };

  const getStatusIcon = () => {
    if (isInProgress) return <Clock className="h-5 w-5 text-blue-500" />;
    if (isCompleted) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (isFailed) return <XCircle className="h-5 w-5 text-red-500" />;
    return <RefreshCw className="h-5 w-5 text-gray-500" />;
  };

  const getStatusText = () => {
    if (isInProgress) return 'In Progress';
    if (isCompleted) return 'Completed';
    if (isFailed) return 'Failed';
    return 'Ready to Start';
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (isInProgress) return 'default';
    if (isCompleted) return 'secondary';
    if (isFailed) return 'destructive';
    return 'outline';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Magaya Bulk Sync - Jhavar Leakey
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge variant={getStatusVariant()} className="text-sm">
              {getStatusText()}
            </Badge>
            {syncSession && (
              <span className="text-sm text-muted-foreground">
                Session started: {new Date(syncSession.started_at).toLocaleString()}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {syncSession && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-muted-foreground text-center">
                {syncSession.processed_shipments} of {syncSession.total_shipments} shipments processed
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          {syncSession && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    Packages
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-green-600">
                    {syncSession.created_packages}
                  </div>
                  <CardDescription>Created</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-blue-600">
                    {syncSession.updated_packages}
                  </div>
                  <CardDescription>Updated</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Customers
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-purple-600">
                    {syncSession.created_customers}
                  </div>
                  <CardDescription>Created</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Errors
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-red-600">
                    {syncSession.error_count}
                  </div>
                  <CardDescription>Failed</CardDescription>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Information Card */}
          {!syncSession && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sync Information</CardTitle>
                <CardDescription>
                  This will sync all packages from the "Jhavar Leakey" supplier in Magaya to YardPack.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm space-y-1">
                  <p><strong>Supplier Filter:</strong> Jhavar Leakey</p>
                  <p><strong>Operation:</strong> One-way sync from Magaya to YardPack</p>
                  <p><strong>Data Precedence:</strong> Magaya data will overwrite existing YardPack data</p>
                  <p><strong>Customer Handling:</strong> Auto-create new customers, map similar ones</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {isCompleted && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Sync Completed Successfully
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700">
                  The bulk sync has been completed. All data has been successfully imported from Magaya.
                </p>
                {syncSession?.completed_at && (
                  <p className="text-sm text-green-600 mt-2">
                    Completed at: {new Date(syncSession.completed_at).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {isFailed && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Sync Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700">
                  The bulk sync encountered an error and could not be completed. Please check the logs for more details.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {isInProgress ? 'Close' : 'Cancel'}
            </Button>
            {!syncSession && (
              <Button 
                onClick={handleStartSync}
                disabled={isStarting}
                className="flex items-center gap-2"
              >
                {isStarting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Start Sync
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MagayaBulkSyncModal;