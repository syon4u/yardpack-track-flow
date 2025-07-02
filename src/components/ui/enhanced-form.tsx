import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Label } from './label';
import { Input } from './input';
import { Textarea } from './textarea';
import { Button } from './button';
import { LoadingButton } from './loading-states';
import { Alert, AlertDescription } from './alert';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

// Enhanced form field wrapper
interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  error?: string;
  success?: string;
  hint?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  required, 
  error, 
  success,
  hint,
  children, 
  className,
  ...props 
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {label && (
        <Label className={cn(
          'text-sm font-medium',
          required && "after:content-['*'] after:ml-0.5 after:text-destructive",
          error && 'text-destructive',
          success && 'text-success'
        )}>
          {label}
        </Label>
      )}
      
      <div className="relative">
        {children}
        
        {/* Success/Error icons */}
        {(error || success) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error && <AlertCircle className="h-4 w-4 text-destructive" />}
            {success && <CheckCircle className="h-4 w-4 text-success" />}
          </div>
        )}
      </div>

      {/* Feedback messages */}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="py-2 border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-sm text-success">{success}</AlertDescription>
        </Alert>
      )}

      {hint && !error && !success && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
};

// Enhanced input with better mobile UX
interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, error, success, type, ...props }, ref) => {
    const isMobile = useIsMobile();

    return (
      <Input
        ref={ref}
        type={type}
        className={cn(
          'transition-smooth focus-ring',
          isMobile && 'h-12 text-base', // Better mobile touch targets
          error && 'border-destructive focus:ring-destructive/20',
          success && 'border-success focus:ring-success/20',
          className
        )}
        {...props}
      />
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

// Enhanced textarea with better mobile UX
interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

export const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ className, error, success, ...props }, ref) => {
    const isMobile = useIsMobile();

    return (
      <Textarea
        ref={ref}
        className={cn(
          'transition-smooth focus-ring',
          isMobile && 'min-h-24 text-base', // Better mobile experience
          error && 'border-destructive focus:ring-destructive/20',
          success && 'border-success focus:ring-success/20',
          className
        )}
        {...props}
      />
    );
  }
);

EnhancedTextarea.displayName = 'EnhancedTextarea';

// Form action buttons with better mobile layout
interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'outline' | 'ghost';
  };
  children?: React.ReactNode;
}

export const FormActions: React.FC<FormActionsProps> = ({ 
  primaryAction,
  secondaryAction,
  children,
  className,
  ...props 
}) => {
  const isMobile = useIsMobile();

  return (
    <div 
      className={cn(
        'flex gap-3 pt-6',
        isMobile ? 'flex-col-reverse' : 'justify-end',
        className
      )}
      {...props}
    >
      {secondaryAction && (
        <Button
          variant={secondaryAction.variant || 'outline'}
          onClick={secondaryAction.onClick}
          className={cn(
            'transition-smooth',
            isMobile && 'h-12 touch-target'
          )}
        >
          {secondaryAction.label}
        </Button>
      )}
      
      {primaryAction && (
        <LoadingButton
          onClick={primaryAction.onClick}
          loading={primaryAction.loading}
          disabled={primaryAction.disabled}
          className={cn(
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'transition-smooth',
            isMobile && 'h-12 touch-target'
          )}
        >
          {primaryAction.label}
        </LoadingButton>
      )}
      
      {children}
    </div>
  );
};

// Enhanced form container
interface EnhancedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const EnhancedForm: React.FC<EnhancedFormProps> = ({ 
  title,
  description,
  children,
  className,
  ...props 
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      'w-full max-w-2xl mx-auto',
      isMobile && 'px-4'
    )}>
      {(title || description) && (
        <div className={cn('mb-8', isMobile && 'mb-6')}>
          {title && (
            <h2 className={cn(
              'text-2xl font-bold text-foreground mb-2',
              isMobile && 'text-xl'
            )}>
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground text-sm">
              {description}
            </p>
          )}
        </div>
      )}

      <form 
        className={cn(
          'space-y-6 animate-fade-in',
          isMobile && 'space-y-5',
          className
        )}
        {...props}
      >
        {children}
      </form>
    </div>
  );
};