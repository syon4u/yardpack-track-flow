
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  title?: string;
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  title = "Something went wrong",
  message
}) => {
  const navigate = useNavigate();

  const defaultMessage = message || "We're sorry, but something unexpected happened. Please try again.";
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Add console log to check if this component is rendering
  console.log('ErrorFallback rendering:', { title, message, error: error?.message });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-center">
            {defaultMessage}
          </p>

          {isDevelopment && error && (
            <details className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs">
              <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-200">
                Error Details (Development)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {onRetry && (
              <Button 
                onClick={onRetry} 
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button 
              onClick={() => navigate('/')} 
              className="flex-1"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;
