import { z } from 'zod';

// Common validation schemas
export const ValidationSchemas = {
  // Basic field validations
  email: z.string().email('Please enter a valid email address'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  
  // Package-related validations
  trackingNumber: z.string()
    .min(1, 'Tracking number is required')
    .max(50, 'Tracking number must be less than 50 characters')
    .regex(/^[A-Za-z0-9\-_]+$/, 'Tracking number can only contain letters, numbers, hyphens, and underscores'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  
  customerName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  // Numeric validations
  positiveNumber: z.number()
    .min(0, 'Value must be positive'),
  
  currency: z.number()
    .min(0, 'Amount must be positive')
    .max(999999.99, 'Amount is too large'),
  
  weight: z.number()
    .min(0.1, 'Weight must be at least 0.1')
    .max(1000, 'Weight cannot exceed 1000'),
  
  // Date validations
  futureDate: z.date()
    .refine(date => date > new Date(), 'Date must be in the future'),
  
  pastDate: z.date()
    .refine(date => date <= new Date(), 'Date cannot be in the future'),
};

// Package creation schema
export const PackageSchema = z.object({
  tracking_number: ValidationSchemas.trackingNumber,
  description: ValidationSchemas.description,
  customer_id: z.string().min(1, 'Customer is required'),
  delivery_address: ValidationSchemas.address,
  package_value: ValidationSchemas.currency.optional(),
  weight: ValidationSchemas.weight.optional(),
  estimated_delivery: z.date().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

// Customer creation schema
export const CustomerSchema = z.object({
  full_name: ValidationSchemas.customerName,
  email: ValidationSchemas.email.optional(),
  phone_number: ValidationSchemas.phone.optional(),
  address: ValidationSchemas.address.optional(),
  customer_type: z.enum(['registered', 'guest', 'package_only']),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
}).refine(data => data.email || data.phone_number, {
  message: 'Either email or phone number is required',
  path: ['email'],
});

// User profile schema
export const ProfileSchema = z.object({
  full_name: ValidationSchemas.customerName,
  email: ValidationSchemas.email,
  phone_number: ValidationSchemas.phone.optional(),
  address: ValidationSchemas.address.optional(),
});

// Real-time validation helper
export class ValidationHelper {
  private static debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  static async validateField(
    schema: z.ZodSchema,
    value: any,
    fieldName: string,
    debounceMs = 300
  ): Promise<{ isValid: boolean; error?: string }> {
    return new Promise((resolve) => {
      // Clear existing timer
      const existingTimer = this.debounceTimers.get(fieldName);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(() => {
        try {
          schema.parse(value);
          resolve({ isValid: true });
        } catch (error) {
          if (error instanceof z.ZodError) {
            resolve({ 
              isValid: false, 
              error: error.errors[0]?.message || 'Invalid value' 
            });
          } else {
            resolve({ 
              isValid: false, 
              error: 'Validation error' 
            });
          }
        }
        this.debounceTimers.delete(fieldName);
      }, debounceMs);

      this.debounceTimers.set(fieldName, timer);
    });
  }

  static validateSync(schema: z.ZodSchema, value: any): { isValid: boolean; error?: string } {
    try {
      schema.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          isValid: false, 
          error: error.errors[0]?.message || 'Invalid value' 
        };
      } else {
        return { 
          isValid: false, 
          error: 'Validation error' 
        };
      }
    }
  }

  static getFieldErrors(error: z.ZodError): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    error.errors.forEach((err) => {
      const fieldName = err.path.join('.');
      if (!fieldErrors[fieldName]) {
        fieldErrors[fieldName] = err.message;
      }
    });
    return fieldErrors;
  }
}

export type PackageFormData = z.infer<typeof PackageSchema>;
export type CustomerFormData = z.infer<typeof CustomerSchema>;
export type ProfileFormData = z.infer<typeof ProfileSchema>;