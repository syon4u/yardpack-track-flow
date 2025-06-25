
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  componentName: string;
}

const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({ 
  children, 
  componentName 
}) => {
  const handleError = (error: Error) => {
    console.error(`Component error in ${componentName}:`, error);
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default ComponentErrorBoundary;
