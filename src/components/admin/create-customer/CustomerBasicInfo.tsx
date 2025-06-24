
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CustomerBasicInfoProps {
  formData: {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
  };
  customerType: string;
  isMobile: boolean;
  onChange: (field: string, value: string) => void;
}

const CustomerBasicInfo: React.FC<CustomerBasicInfoProps> = ({ 
  formData, 
  customerType, 
  isMobile, 
  onChange 
}) => {
  return (
    <>
      <div>
        <Label htmlFor="full_name" className={isMobile ? 'text-sm' : ''}>Full Name *</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => onChange('full_name', e.target.value)}
          placeholder="Enter customer's full name"
          required
          className={isMobile ? 'h-12 text-base' : ''}
        />
      </div>

      <div>
        <Label htmlFor="email" className={isMobile ? 'text-sm' : ''}>
          Email {customerType === 'registered' ? '*' : ''}
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="Enter customer's email"
          required={customerType === 'registered'}
          className={isMobile ? 'h-12 text-base' : ''}
        />
      </div>

      {customerType === 'registered' && (
        <div>
          <Label htmlFor="password" className={isMobile ? 'text-sm' : ''}>Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            placeholder="Enter temporary password"
            required
            minLength={6}
            className={isMobile ? 'h-12 text-base' : ''}
          />
        </div>
      )}

      <div>
        <Label htmlFor="phone_number" className={isMobile ? 'text-sm' : ''}>Phone Number</Label>
        <Input
          id="phone_number"
          type="tel"
          value={formData.phone_number}
          onChange={(e) => onChange('phone_number', e.target.value)}
          placeholder="Enter phone number"
          className={isMobile ? 'h-12 text-base' : ''}
        />
      </div>
    </>
  );
};

export default CustomerBasicInfo;
