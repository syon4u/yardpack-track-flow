import { useState } from 'react';

export interface PackageFormData {
  tracking_number: string;
  customer_id: string;
  description: string;
  delivery_address: string;
  sender_name: string;
  sender_address: string;
  weight: string;
  dimensions: string;
  package_value: string;
  notes: string;
  carrier: string;
  external_tracking_number: string;
}

export const usePackageFormData = () => {
  const [formData, setFormData] = useState<PackageFormData>({
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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof PackageFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
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
    setFieldErrors({});
  };

  return {
    formData,
    fieldErrors,
    setFieldErrors,
    updateFormData,
    resetForm
  };
};