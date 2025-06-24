
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

export const MobileFormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  error
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={label} 
        className={`${isMobile ? 'text-sm' : ''} ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}
      >
        {label}
      </Label>
      <Input
        id={label}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${isMobile ? 'h-12 text-base' : ''} ${error ? 'border-red-500' : ''}`}
      />
      {error && (
        <p className={`text-red-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {error}
        </p>
      )}
    </div>
  );
};

interface MobileFormProps {
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const MobileForm: React.FC<MobileFormProps> = ({
  title,
  children,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  isLoading
}) => {
  const isMobile = useIsMobile();

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${isMobile ? 'space-y-6' : ''}`}>
      <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>
        {title}
      </h2>
      
      <div className={`space-y-4 ${isMobile ? 'space-y-6' : ''}`}>
        {children}
      </div>
      
      <div className={`flex gap-2 ${isMobile ? 'flex-col pt-4' : 'justify-end'}`}>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className={isMobile ? 'h-12 text-base' : ''}
          >
            {cancelText}
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading}
          className={isMobile ? 'h-12 text-base' : ''}
        >
          {isLoading ? 'Loading...' : submitText}
        </Button>
      </div>
    </form>
  );
};
