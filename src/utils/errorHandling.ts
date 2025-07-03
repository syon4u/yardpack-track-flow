import { toast } from '@/hooks/use-toast';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export class DatabaseError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export const handleApiError = (error: unknown, context?: string): ApiError => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
  
  if (error instanceof Error) {
    return error as ApiError;
  }
  
  if (typeof error === 'string') {
    return new Error(error) as ApiError;
  }
  
  if (typeof error === 'object' && error !== null) {
    const obj = error as any;
    const message = obj.message || obj.error || 'Unknown error occurred';
    const apiError = new Error(message) as ApiError;
    apiError.status = obj.status;
    apiError.code = obj.code;
    apiError.details = obj.details;
    return apiError;
  }
  
  return new Error('Unknown error occurred') as ApiError;
};

export const handleDatabaseError = (error: unknown, operation: string): DatabaseError => {
  console.error(`Database Error during ${operation}:`, error);
  
  if (error instanceof Error) {
    if (error.message.includes('violates row-level security')) {
      return new DatabaseError(`Access denied: You don't have permission to ${operation}`, error);
    }
    
    if (error.message.includes('duplicate key')) {
      return new DatabaseError(`Record already exists`, error);
    }
    
    if (error.message.includes('foreign key')) {
      return new DatabaseError(`Related record not found`, error);
    }
    
    return new DatabaseError(`Database error during ${operation}: ${error.message}`, error);
  }
  
  return new DatabaseError(`Unknown database error during ${operation}`, error);
};

export const showErrorToast = (error: unknown, fallbackMessage?: string) => {
  const apiError = handleApiError(error);
  
  toast({
    title: "Error",
    description: apiError.message || fallbackMessage || "Something went wrong",
    variant: "destructive",
  });
};

export const showSuccessToast = (message: string, description?: string) => {
  toast({
    title: message,
    description,
  });
};

// Wrapper for async operations with error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  options: {
    context?: string;
    onError?: (error: ApiError) => void;
    onSuccess?: (result: T) => void;
    showToast?: boolean;
    successMessage?: string;
  } = {}
): Promise<T | null> => {
  const { 
    context, 
    onError, 
    onSuccess, 
    showToast = true, 
    successMessage 
  } = options;
  
  try {
    const result = await operation();
    
    if (onSuccess) {
      onSuccess(result);
    }
    
    if (showToast && successMessage) {
      showSuccessToast(successMessage);
    }
    
    return result;
  } catch (error) {
    const apiError = handleApiError(error, context);
    
    if (onError) {
      onError(apiError);
    }
    
    if (showToast) {
      showErrorToast(apiError);
    }
    
    return null;
  }
};

// Retry wrapper for failed operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = handleApiError(error);
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

export default {
  handleApiError,
  handleDatabaseError,
  showErrorToast,
  showSuccessToast,
  withErrorHandling,
  withRetry
};