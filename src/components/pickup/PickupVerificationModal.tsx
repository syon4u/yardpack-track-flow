
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePickupVerificationMethods, useCreatePickupRecord } from '@/hooks/usePickupVerification';
import DigitalSignaturePad from './DigitalSignaturePad';
import PhotoCaptureComponent from './PhotoCaptureComponent';

// Use the same Package interface as PackageTable
interface Package {
  id: string;
  tracking_number: string;
  description: string;
  status: string;
  date_received: string;
  estimated_delivery?: string;
  invoices?: any[];
  total_due?: number;
  customer_name?: string;
  magaya_shipment_id?: string | null;
  magaya_reference_number?: string | null;
  warehouse_location?: string | null;
  consolidation_status?: string | null;
}

interface PickupVerificationModalProps {
  package: Package | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PickupVerificationModal: React.FC<PickupVerificationModalProps> = ({
  package: pkg,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: verificationMethods } = usePickupVerificationMethods();
  const createPickupRecord = useCreatePickupRecord();

  const [formData, setFormData] = useState({
    verification_method_id: '',
    pickup_person_name: '',
    pickup_person_phone: '',
    pickup_person_relationship: 'customer',
    pickup_notes: '',
    package_condition: 'good',
    customer_satisfied: true,
  });

  const [verificationData, setVerificationData] = useState<any>({});
  const [currentStep, setCurrentStep] = useState(1);

  const selectedMethod = verificationMethods?.find(m => m.id === formData.verification_method_id);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVerificationData = (data: any) => {
    setVerificationData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    if (!pkg || !user) return;

    try {
      await createPickupRecord.mutateAsync({
        package_id: pkg.id,
        verification_method_id: formData.verification_method_id,
        pickup_person_name: formData.pickup_person_name,
        pickup_person_phone: formData.pickup_person_phone,
        pickup_person_relationship: formData.pickup_person_relationship,
        authorized_by_staff: user.id,
        verification_data: verificationData,
        pickup_notes: formData.pickup_notes,
        package_condition: formData.package_condition,
        customer_satisfied: formData.customer_satisfied,
      });

      toast({
        title: "Pickup Recorded Successfully",
        description: `Package ${pkg.tracking_number} has been marked as picked up.`,
      });

      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: "Error Recording Pickup",
        description: "Failed to record the package pickup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      verification_method_id: '',
      pickup_person_name: '',
      pickup_person_phone: '',
      pickup_person_relationship: 'customer',
      pickup_notes: '',
      package_condition: 'good',
      customer_satisfied: true,
    });
    setVerificationData({});
    setCurrentStep(1);
  };

  if (!pkg) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Package Pickup</DialogTitle>
          <p className="text-sm text-gray-600">
            Package: {pkg.tracking_number} - {pkg.description}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="verification_method">Verification Method</Label>
                <Select
                  value={formData.verification_method_id}
                  onValueChange={(value) => handleInputChange('verification_method_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select verification method" />
                  </SelectTrigger>
                  <SelectContent>
                    {verificationMethods?.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pickup_person_name">Pickup Person Name</Label>
                <Input
                  id="pickup_person_name"
                  value={formData.pickup_person_name}
                  onChange={(e) => handleInputChange('pickup_person_name', e.target.value)}
                  placeholder="Full name of person collecting package"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pickup_person_phone">Phone Number (Optional)</Label>
                <Input
                  id="pickup_person_phone"
                  value={formData.pickup_person_phone}
                  onChange={(e) => handleInputChange('pickup_person_phone', e.target.value)}
                  placeholder="Contact number"
                />
              </div>

              <div>
                <Label>Relationship to Customer</Label>
                <RadioGroup
                  value={formData.pickup_person_relationship}
                  onValueChange={(value) => handleInputChange('pickup_person_relationship', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer">Customer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="authorized_representative" id="authorized_representative" />
                    <Label htmlFor="authorized_representative">Authorized Representative</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="family_member" id="family_member" />
                    <Label htmlFor="family_member">Family Member</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.verification_method_id || !formData.pickup_person_name}
                  className="flex-1"
                >
                  Next: Verification
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {selectedMethod?.name.replace('_', ' ').toUpperCase()} Verification
              </h3>

              {selectedMethod?.requires_signature && (
                <div>
                  <Label>Digital Signature</Label>
                  <DigitalSignaturePad
                    onSave={(signature) => handleVerificationData({ signature })}
                  />
                </div>
              )}

              {selectedMethod?.requires_photo && (
                <div>
                  <Label>Photo Verification</Label>
                  <PhotoCaptureComponent
                    onCapture={(photo) => handleVerificationData({ photo })}
                  />
                </div>
              )}

              {selectedMethod?.requires_code && (
                <div>
                  <Label htmlFor="verification_code">Verification Code</Label>
                  <Input
                    id="verification_code"
                    placeholder="Enter pickup code"
                    onChange={(e) => handleVerificationData({ code: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="package_condition">Package Condition</Label>
                <Select
                  value={formData.package_condition}
                  onValueChange={(value) => handleInputChange('package_condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                    <SelectItem value="wet">Water Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pickup_notes">Notes (Optional)</Label>
                <Textarea
                  id="pickup_notes"
                  value={formData.pickup_notes}
                  onChange={(e) => handleInputChange('pickup_notes', e.target.value)}
                  placeholder="Any additional notes about the pickup"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="customer_satisfied"
                  checked={formData.customer_satisfied}
                  onChange={(e) => handleInputChange('customer_satisfied', e.target.checked)}
                />
                <Label htmlFor="customer_satisfied">Customer satisfied with pickup process</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setCurrentStep(1)} variant="outline">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createPickupRecord.isPending}
                  className="flex-1"
                >
                  {createPickupRecord.isPending ? 'Recording...' : 'Complete Pickup'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PickupVerificationModal;
