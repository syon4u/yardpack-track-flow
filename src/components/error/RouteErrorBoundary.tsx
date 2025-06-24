
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useLocation } from 'react-router-dom';

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
}

const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ children }) => {
  const location = useLocation();

  const handleError = (error: Error) => {
    console.error(`Route error on ${location.pathname}:`, error);
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default RouteErrorBoundary;
