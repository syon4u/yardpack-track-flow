
import React, { useState } from 'react';
import { useCreatePackage } from '@/hooks/usePackages';
import { useCarrierDetection } from '@/hooks/useTrackingAPI';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CreatePackageFormProps {
  onClose: () => void;
}

const CreatePackageForm: React.FC<CreatePackageFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const createPackageMutation = useCreatePackage();
  const { detectCarrier } = useCarrierDetection();
  
  const [formData, setFormData] = useState({
    tracking_number: '',
    customer_id: '',
    description: '',
    delivery_address: '',
    sender_name: '',
    sender_address: '',
    weight: '',
    dimensions: '',
    package_value: '',
    notes: '',
    carrier: '',
    external_tracking_number: ''
  });

  // Fetch customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'customer');
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createPackageMutation.mutateAsync({
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        package_value: formData.package_value ? parseFloat(formData.package_value) : undefined,
        carrier: formData.carrier || undefined,
        external_tracking_number: formData.external_tracking_number || undefined,
      });
      
      toast({
        title: "Success",
        description: "Package created successfully",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-detect carrier when external tracking number changes
    if (field === 'external_tracking_number' && value) {
      const detectedCarrier = detectCarrier(value);
      if (detectedCarrier !== 'UNKNOWN') {
        setFormData(prev => ({ ...prev, carrier: detectedCarrier }));
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Package</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tracking_number">Internal Tracking Number</Label>
              <Input
                id="tracking_number"
                value={formData.tracking_number}
                onChange={(e) => handleInputChange('tracking_number', e.target.value)}
                placeholder="YP2024XXX"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="customer_id">Customer</Label>
              <Select value={formData.customer_id} onValueChange={(value) => handleInputChange('customer_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="external_tracking_number">Carrier Tracking Number</Label>
              <Input
                id="external_tracking_number"
                value={formData.external_tracking_number}
                onChange={(e) => handleInputChange('external_tracking_number', e.target.value)}
                placeholder="External carrier tracking number"
              />
            </div>
            
            <div>
              <Label htmlFor="carrier">Carrier</Label>
              <Select value={formData.carrier} onValueChange={(value) => handleInputChange('carrier', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USPS">USPS</SelectItem>
                  <SelectItem value="FEDEX">FedEx</SelectItem>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="DHL">DHL</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Package contents description"
              required
            />
          </div>

          <div>
            <Label htmlFor="delivery_address">Delivery Address</Label>
            <Textarea
              id="delivery_address"
              value={formData.delivery_address}
              onChange={(e) => handleInputChange('delivery_address', e.target.value)}
              placeholder="Full delivery address in Jamaica"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sender_name">Sender Name</Label>
              <Input
                id="sender_name"
                value={formData.sender_name}
                onChange={(e) => handleInputChange('sender_name', e.target.value)}
                placeholder="Store or sender name"
              />
            </div>
            
            <div>
              <Label htmlFor="sender_address">Sender Address</Label>
              <Input
                id="sender_address"
                value={formData.sender_address}
                onChange={(e) => handleInputChange('sender_address', e.target.value)}
                placeholder="Miami address"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="0.0"
              />
            </div>
            
            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => handleInputChange('dimensions', e.target.value)}
                placeholder="L x W x H inches"
              />
            </div>
            
            <div>
              <Label htmlFor="package_value">Package Value ($)</Label>
              <Input
                id="package_value"
                type="number"
                step="0.01"
                value={formData.package_value}
                onChange={(e) => handleInputChange('package_value', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or instructions"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPackageMutation.isPending}
            >
              {createPackageMutation.isPending ? 'Creating...' : 'Create Package'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePackageForm;
