
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CustomerAddressAndPreferencesProps {
  formData: {
    address: string;
    preferred_contact_method: string;
    notes: string;
  };
  isMobile: boolean;
  onChange: (field: string, value: string) => void;
}

const CustomerAddressAndPreferences: React.FC<CustomerAddressAndPreferencesProps> = ({ 
  formData, 
  isMobile, 
  onChange 
}) => {
  return (
    <>
      <div>
        <Label htmlFor="address" className={isMobile ? 'text-sm' : ''}>Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Enter customer's address"
          className={isMobile ? 'min-h-[100px] text-base' : ''}
        />
      </div>

      <div>
        <Label htmlFor="preferred_contact_method" className={isMobile ? 'text-sm' : ''}>Preferred Contact Method</Label>
        <Select value={formData.preferred_contact_method} onValueChange={(value) => onChange('preferred_contact_method', value)}>
          <SelectTrigger className={isMobile ? 'h-12 text-base' : ''}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes" className={isMobile ? 'text-sm' : ''}>Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Additional notes about the customer"
          className={isMobile ? 'min-h-[80px] text-base' : ''}
        />
      </div>
    </>
  );
};

export default CustomerAddressAndPreferences;
