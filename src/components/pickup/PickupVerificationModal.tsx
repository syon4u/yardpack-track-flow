
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePickupVerificationMethods, useCreatePickupRecord } from '@/hooks/usePickupVerification';
import { Database } from '@/integrations/supabase/types';
import { Camera, Signature, QrCode, Key, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import DigitalSignaturePad from './DigitalSignaturePad';
import PhotoCaptureComponent from './PhotoCaptureComponent';

type Package = Database['public']['Tables']['packages']['Row'];

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
  const { profile } = useAuth();
  const { data: verificationMethods } = usePickupVerificationMethods();
  const createPickupRecord = useCreatePickupRecord();

  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [pickupPersonName, setPickupPersonName] = useState('');
  const [pickupPersonPhone, setPickupPersonPhone] = useState('');
  const [pickupPersonRelationship, setPickupPersonRelationship] = useState('customer');
  const [pickupNotes, setPickupNotes] = useState('');
  const [packageCondition, setPackageCondition] = useState('good');
  const [customerSatisfied, setCustomerSatisfied] = useState(true);
  const [verificationData, setVerificationData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMethod = verificationMethods?.find(m => m.id === selectedMethodId);

  const handleSubmit = async () => {
    if (!pkg || !profile || !selectedMethodId || !pickupPersonName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPickupRecord.mutateAsync({
        package_id: pkg.id,
        verification_method_id: selectedMethodId,
        pickup_person_name: pickupPersonName.trim(),
        pickup_person_phone: pickupPersonPhone.trim() || undefined,
        pickup_person_relationship: pickupPersonRelationship,
        authorized_by_staff: profile.id,
        verification_data: verificationData,
        pickup_notes: pickupNotes.trim() || undefined,
        package_condition: packageCondition,
        customer_satisfied: customerSatisfied,
      });

      toast.success('Package pickup recorded successfully');
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error recording pickup:', error);
      toast.error('Failed to record package pickup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedMethodId('');
    setPickupPersonName('');
    setPickupPersonPhone('');
    setPickupPersonRelationship('customer');
    setPickupNotes('');
    setPackageCondition('good');
    setCustomerSatisfied(true);
    setVerificationData({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!pkg) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Record Package Pickup
          </DialogTitle>
          <div className="text-sm text-gray-600">
            <p><strong>Package:</strong> {pkg.tracking_number}</p>
            <p><strong>Description:</strong> {pkg.description}</p>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Verification Method Selection */}
          <div>
            <Label htmlFor="verification-method">Verification Method *</Label>
            <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
              <SelectTrigger>
                <SelectValue placeholder="Select verification method" />
              </SelectTrigger>
              <SelectContent>
                {verificationMethods?.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center gap-2">
                      {method.name === 'digital_signature' && <Signature className="h-4 w-4" />}
                      {method.name === 'photo_id' && <Camera className="h-4 w-4" />}
                      {method.name === 'qr_code' && <QrCode className="h-4 w-4" />}
                      {method.name === 'pin_code' && <Key className="h-4 w-4" />}
                      {method.name === 'staff_verification' && <User className="h-4 w-4" />}
                      <span className="capitalize">{method.name.replace('_', ' ')}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMethod?.description && (
              <p className="text-sm text-gray-500 mt-1">{selectedMethod.description}</p>
            )}
          </div>

          {/* Pickup Person Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickup-person-name">Pickup Person Name *</Label>
              <Input
                id="pickup-person-name"
                value={pickupPersonName}
                onChange={(e) => setPickupPersonName(e.target.value)}
                placeholder="Full name of person collecting package"
              />
            </div>
            <div>
              <Label htmlFor="pickup-person-phone">Phone Number</Label>
              <Input
                id="pickup-person-phone"
                value={pickupPersonPhone}
                onChange={(e) => setPickupPersonPhone(e.target.value)}
                placeholder="Contact number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="relationship">Relationship to Customer</Label>
            <Select value={pickupPersonRelationship} onValueChange={setPickupPersonRelationship}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer (Self)</SelectItem>
                <SelectItem value="authorized_representative">Authorized Representative</SelectItem>
                <SelectItem value="family_member">Family Member</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="employee">Employee/Staff</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verification Components */}
          {selectedMethod?.requires_signature && (
            <div>
              <Label>Digital Signature *</Label>
              <DigitalSignaturePad
                onSave={(signatureData) => setVerificationData({ ...verificationData, signature: signatureData })}
              />
            </div>
          )}

          {selectedMethod?.requires_photo && (
            <div>
              <Label>Photo ID Verification *</Label>
              <PhotoCaptureComponent
                onCapture={(photoData) => setVerificationData({ ...verificationData, photo: photoData })}
              />
            </div>
          )}

          {selectedMethod?.requires_code && (
            <div>
              <Label htmlFor="verification-code">Verification Code *</Label>
              <Input
                id="verification-code"
                value={verificationData.code || ''}
                onChange={(e) => setVerificationData({ ...verificationData, code: e.target.value })}
                placeholder="Enter QR code or PIN"
                className="font-mono"
              />
            </div>
          )}

          {/* Package Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="package-condition">Package Condition</Label>
              <Select value={packageCondition} onValueChange={setPackageCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="opened">Opened/Tampered</SelectItem>
                  <SelectItem value="wet">Water Damage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customer-satisfied">Customer Satisfaction</Label>
              <Select 
                value={customerSatisfied ? 'satisfied' : 'unsatisfied'} 
                onValueChange={(value) => setCustomerSatisfied(value === 'satisfied')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="satisfied">Satisfied</SelectItem>
                  <SelectItem value="unsatisfied">Unsatisfied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="pickup-notes">Pickup Notes</Label>
            <Textarea
              id="pickup-notes"
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="Any additional notes about the pickup..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !selectedMethodId || !pickupPersonName.trim()}
            >
              {isSubmitting ? 'Recording...' : 'Record Pickup'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PickupVerificationModal;
