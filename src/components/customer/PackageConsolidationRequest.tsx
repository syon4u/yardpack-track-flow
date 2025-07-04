import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Package, 
  Plus, 
  Minus, 
  Calculator, 
  Info, 
  Send,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';
import { useToast } from '@/hooks/use-toast';

interface ConsolidationRequest {
  selectedPackages: string[];
  requestedWeight?: number;
  specialInstructions?: string;
  urgentDelivery: boolean;
  consolidationType: 'standard' | 'fragile' | 'document';
}

const PackageConsolidationRequest: React.FC = () => {
  const { toast } = useToast();
  const { data: packagesResult } = useOptimizedPackages({ statusFilter: 'arrived' });
  const packages = packagesResult?.data || [];
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [request, setRequest] = useState<ConsolidationRequest>({
    selectedPackages: [],
    urgentDelivery: false,
    consolidationType: 'standard',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter packages that are available for consolidation
  const availablePackages = packages?.filter(pkg => 
    pkg.status === 'arrived' && 
    !pkg.consolidation_status || 
    pkg.consolidation_status === 'pending'
  ) || [];

  const togglePackageSelection = (packageId: string) => {
    setRequest(prev => ({
      ...prev,
      selectedPackages: prev.selectedPackages.includes(packageId)
        ? prev.selectedPackages.filter(id => id !== packageId)
        : [...prev.selectedPackages, packageId]
    }));
  };

  const selectedPackageData = availablePackages.filter(pkg => 
    request.selectedPackages.includes(pkg.id)
  );

  const calculateEstimatedSavings = () => {
    const numPackages = request.selectedPackages.length;
    if (numPackages < 2) return 0;
    
    // Estimated savings based on consolidation
    const baseSaving = numPackages * 5; // $5 per additional package
    const urgentFee = request.urgentDelivery ? 15 : 0;
    return Math.max(0, baseSaving - urgentFee);
  };

  const calculateTotalWeight = () => {
    return selectedPackageData.reduce((total, pkg) => total + (pkg.weight || 0), 0);
  };

  const calculateTotalValue = () => {
    return selectedPackageData.reduce((total, pkg) => total + (pkg.package_value || 0), 0);
  };

  const handleSubmitRequest = async () => {
    if (request.selectedPackages.length < 2) {
      toast({
        title: "Invalid Selection",
        description: "Please select at least 2 packages for consolidation.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Consolidation Request Submitted",
      description: `Your request to consolidate ${request.selectedPackages.length} packages has been submitted successfully.`,
    });

    // Reset form
    setRequest({
      selectedPackages: [],
      urgentDelivery: false,
      consolidationType: 'standard',
    });
    
    setShowRequestDialog(false);
    setIsSubmitting(false);
  };

  const getConsolidationTypeDescription = (type: string) => {
    switch (type) {
      case 'standard':
        return 'Regular consolidation for general items';
      case 'fragile':
        return 'Special handling for fragile items (+$5)';
      case 'document':
        return 'Document-only consolidation for papers';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Consolidation
          </div>
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Request Consolidation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Request Package Consolidation</DialogTitle>
                <DialogDescription>
                  Select multiple packages to consolidate into one shipment and save on delivery costs.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Package Selection */}
                <div>
                  <Label className="text-base font-medium">Select Packages</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose 2 or more packages that have arrived in Jamaica
                  </p>
                  
                  {availablePackages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No packages available for consolidation.</p>
                      <p className="text-sm">Packages must have arrived in Jamaica first.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {availablePackages.map((pkg) => (
                        <div key={pkg.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={pkg.id}
                            checked={request.selectedPackages.includes(pkg.id)}
                            onCheckedChange={() => togglePackageSelection(pkg.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <label htmlFor={pkg.id} className="text-sm font-medium cursor-pointer">
                                {pkg.tracking_number}
                              </label>
                              <div className="flex items-center gap-2">
                                {pkg.weight && (
                                  <Badge variant="outline" className="text-xs">
                                    {pkg.weight} lbs
                                  </Badge>
                                )}
                                {pkg.package_value && (
                                  <Badge variant="outline" className="text-xs">
                                    ${pkg.package_value}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {pkg.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Consolidation Summary */}
                {request.selectedPackages.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-medium mb-3">Consolidation Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Selected Packages:</span>
                        <span className="ml-2 font-medium">{request.selectedPackages.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Weight:</span>
                        <span className="ml-2 font-medium">{calculateTotalWeight().toFixed(1)} lbs</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Value:</span>
                        <span className="ml-2 font-medium">${calculateTotalValue().toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Estimated Savings:</span>
                        <span className="ml-2 font-medium text-green-600">
                          ${calculateEstimatedSavings().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Consolidation Options */}
                <div>
                  <Label className="text-base font-medium">Consolidation Type</Label>
                  <div className="space-y-3 mt-3">
                    {['standard', 'fragile', 'document'].map((type) => (
                      <div key={type} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={type}
                          name="consolidationType"
                          value={type}
                          checked={request.consolidationType === type}
                          onChange={(e) => setRequest(prev => ({ ...prev, consolidationType: e.target.value as any }))}
                          className="w-4 h-4"
                        />
                        <div>
                          <label htmlFor={type} className="text-sm font-medium cursor-pointer">
                            {type.charAt(0).toUpperCase() + type.slice(1)} Consolidation
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {getConsolidationTypeDescription(type)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Options */}
                <div>
                  <Label className="text-base font-medium">Special Options</Label>
                  <div className="flex items-center space-x-2 mt-3">
                    <Checkbox
                      id="urgent-delivery"
                      checked={request.urgentDelivery}
                      onCheckedChange={(checked) => setRequest(prev => ({ ...prev, urgentDelivery: !!checked }))}
                    />
                    <label htmlFor="urgent-delivery" className="text-sm">
                      Urgent Delivery (+$15)
                    </label>
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <Label htmlFor="instructions" className="text-base font-medium">
                    Special Instructions
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Any special handling instructions or notes..."
                    value={request.specialInstructions || ''}
                    onChange={(e) => setRequest(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitRequest}
                  disabled={request.selectedPackages.length < 2 || isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Combine multiple packages into one delivery to save on shipping costs.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Calculator className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h4 className="text-sm font-medium">Save Money</h4>
              <p className="text-xs text-muted-foreground">
                Reduce delivery costs by up to $25
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h4 className="text-sm font-medium">One Delivery</h4>
              <p className="text-xs text-muted-foreground">
                Receive all packages together
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h4 className="text-sm font-medium">Secure Packaging</h4>
              <p className="text-xs text-muted-foreground">
                Professional consolidation service
              </p>
            </div>
          </div>

          {/* Available Packages Preview */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Available for Consolidation ({availablePackages.length})
            </h4>
            
            {availablePackages.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No packages available for consolidation.</p>
                <p className="text-sm">New packages will appear here when they arrive in Jamaica.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availablePackages.slice(0, 3).map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{pkg.tracking_number}</p>
                      <p className="text-xs text-muted-foreground">{pkg.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Arrived
                      </Badge>
                      {pkg.weight && (
                        <Badge variant="secondary" className="text-xs">
                          {pkg.weight} lbs
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {availablePackages.length > 3 && (
                  <p className="text-center text-sm text-muted-foreground">
                    +{availablePackages.length - 3} more packages available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageConsolidationRequest;