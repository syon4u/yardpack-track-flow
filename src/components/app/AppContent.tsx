
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EnvironmentValidationService } from '@/services/environmentValidationService.tsx';
import { useDebugQueries } from '@/hooks/useDebugQueries';
import { useJWTDebug } from '@/hooks/useJWTDebug';
import DebugPanel from '@/components/debug/DebugPanel';
import AppRoutes from '@/components/routing/AppRoutes';

const AppContent: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  
  // Add debug hooks
  useDebugQueries();
  useJWTDebug();

  // Debug logging
  console.log('🔍 AppContent render - Auth state:', { 
    user: user?.email || 'no user', 
    profile: profile?.role || 'no profile', 
    isLoading 
  });

  // Validate environment on component mount
  useEffect(() => {
    EnvironmentValidationService.logValidationResults();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // Check for environment configuration errors
  const { hasErrors, component: ErrorComponent } = EnvironmentValidationService.getValidationComponent();
  
  if (hasErrors && ErrorComponent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorComponent />
      </div>
    );
  }

  return (
    <div>
      <DebugPanel />
      
      {/* Add top padding to account for debug panel */}
      <div style={{ paddingTop: '140px' }}>
        <AppRoutes />
      </div>
    </div>
  );
};

export default AppContent;
