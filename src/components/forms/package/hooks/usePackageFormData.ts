import { useState, useCallback } from 'react';
import { ValidationHelper } from '@/utils/validation';
import { supabase } from '@/integrations/supabase/client';

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
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});

  const validateField = useCallback(async (field: keyof PackageFormData, value: string) => {
    setIsValidating(prev => ({ ...prev, [field]: true }));
    
    try {
      // Basic validation
      let error: string | undefined;

      switch (field) {
        case 'tracking_number':
          if (!value.trim()) {
            error = 'Tracking number is required';
          } else if (!/^[A-Za-z0-9\-_]+$/.test(value)) {
            error = 'Tracking number can only contain letters, numbers, hyphens, and underscores';
          } else {
            // Check for duplicate tracking number
            const { data: existing } = await supabase
              .from('packages')
              .select('id')
              .eq('tracking_number', value.trim())
              .single();
            
            if (existing) {
              error = 'Tracking number already exists';
            }
          }
          break;
        case 'description':
          if (!value.trim()) {
            error = 'Description is required';
          } else if (value.length > 500) {
            error = 'Description must be less than 500 characters';
          }
          break;
        case 'customer_id':
          if (!value) {
            error = 'Customer is required';
          }
          break;
        case 'delivery_address':
          if (!value.trim()) {
            error = 'Delivery address is required';
          } else if (value.length < 5) {
            error = 'Address must be at least 5 characters';
          }
          break;
        case 'weight':
          if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
            error = 'Weight must be a positive number';
          }
          break;
        case 'package_value':
          if (value && (isNaN(Number(value)) || Number(value) < 0)) {
            error = 'Package value must be a positive number';
          }
          break;
      }

      setFieldErrors(prev => ({ ...prev, [field]: error || '' }));
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setIsValidating(prev => ({ ...prev, [field]: false }));
    }
  }, []);

  const updateFormData = useCallback((field: keyof PackageFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear existing error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Debounced validation for critical fields
    if (['tracking_number', 'description', 'customer_id', 'delivery_address'].includes(field)) {
      const timeoutId = setTimeout(() => {
        validateField(field, value);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [fieldErrors, validateField]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.tracking_number.trim()) {
      errors.tracking_number = 'Tracking number is required';
    }
    if (!formData.customer_id) {
      errors.customer_id = 'Customer is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!formData.delivery_address.trim()) {
      errors.delivery_address = 'Delivery address is required';
    }

    // Check for duplicate tracking number
    if (formData.tracking_number.trim() && !errors.tracking_number) {
      try {
        const { data: existing } = await supabase
          .from('packages')
          .select('id')
          .eq('tracking_number', formData.tracking_number.trim())
          .single();
        
        if (existing) {
          errors.tracking_number = 'Tracking number already exists';
        }
      } catch (err) {
        // No existing package found, which is good
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
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
    setIsValidating({});
  }, []);

  return {
    formData,
    fieldErrors,
    isValidating,
    setFieldErrors,
    updateFormData,
    validateField,
    validateForm,
    resetForm
  };
};