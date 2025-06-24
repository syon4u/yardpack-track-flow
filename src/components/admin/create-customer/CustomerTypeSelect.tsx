
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CustomerTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  isMobile: boolean;
}

const CustomerTypeSelect: React.FC<CustomerTypeSelectProps> = ({ value, onChange, isMobile }) => {
  return (
    <div>
      <Label htmlFor="customer_type" className={isMobile ? 'text-sm' : ''}>Customer Type *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={isMobile ? 'h-12 text-base' : ''}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="guest">Guest Customer</SelectItem>
          <SelectItem value="registered">Registered Customer</SelectItem>
          <SelectItem value="package_only">Package-Only Customer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CustomerTypeSelect;
