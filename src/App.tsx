import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import WarehousePage from "@/pages/WarehousePage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import RouteErrorBoundary from "@/components/error/RouteErrorBoundary";
import { HealthCheckService } from '@/services/healthCheckService';
import { ConfigService } from '@/services/configService';
import { MonitoringService } from '@/services/monitoringService';
import { ProductionConfigService } from '@/services/productionConfigService';
import { DataIntegrityService } from '@/services/dataIntegrityService';
import { EnvironmentValidationService } from '@/services/environmentValidationService.tsx';
import { useDebugQueries } from '@/hooks/useDebugQueries';
import { useJWTDebug } from '@/hooks/useJWTDebug';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

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
      {/* TEMPORARY DEBUG PANEL */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-100 border-b-2 border-red-300 p-4 text-sm">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-bold text-red-800 mb-2">🐛 DEBUG PANEL (Temporary)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <strong>User:</strong>
              <br />
              {user ? (
                <>
                  Email: {user.email}
                  <br />
                  ID: {user.id?.slice(0, 8)}...
                </>
              ) : (
                'Not authenticated'
              )}
            </div>
            <div>
              <strong>Profile:</strong>
              <br />
              {profile ? (
                <>
                  Role: {profile.role}
                  <br />
                  Name: {profile.full_name || 'N/A'}
                </>
              ) : user ? (
                'Loading profile...'
              ) : (
                'No profile (not logged in)'
              )}
            </div>
            <div>
              <strong>JWT Tests:</strong>
              <br />
              <button 
                onClick={() => (window as any).testJWTRefresh?.()}
                className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded mr-1"
              >
                Refresh JWT
              </button>
              <button 
                onClick={() => (window as any).checkJWTExpiry?.()}
                className="mt-1 px-2 py-1 bg-green-500 text-white text-xs rounded"
              >
                Check Expiry
              </button>
            </div>
            <div>
              <strong>Query Tests:</strong>
              <br />
              <button 
                onClick={() => (window as any).testQueryWithRetry?.()}
                className="mt-1 px-2 py-1 bg-purple-500 text-white text-xs rounded mr-1"
              >
                Test Retry
              </button>
              <button 
                onClick={() => (window as any).testForceReauth?.()}
                className="mt-1 px-2 py-1 bg-red-500 text-white text-xs rounded"
              >
                Force Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add top padding to account for debug panel */}
      <div style={{ paddingTop: '140px' }}>
        <HashRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={
              user ? (
                <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700">
                  DEBUG: User is authenticated, would redirect to /dashboard
                  <br />User: {user.email}
                  <br />Profile: {profile?.role || 'Loading...'}
                  {/* <Navigate to="/dashboard" replace /> */}
                </div>
              ) : (
                <AuthPage />
              )
            } />
            
            {/* Protected routes */}
            {user ? (
              <>
                <Route 
                  path="/dashboard" 
                  element={
                    <RouteErrorBoundary>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </RouteErrorBoundary>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    // Show loading if user exists but profile is still loading
                    profile === null ? (
                      <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading admin dashboard...</p>
                        </div>
                      </div>
                    ) : profile.role === 'admin' ? (
                      <RouteErrorBoundary>
                        <Layout><Dashboard /></Layout>
                      </RouteErrorBoundary>
                    ) : (
                      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700">
                        DEBUG: Non-admin user accessing /admin, would redirect to /dashboard
                        <br />User: {user.email}
                        <br />Role: {profile.role}
                        {/* <Navigate to="/dashboard" replace /> */}
                      </div>
                    )
                  } 
                />
                <Route 
                  path="/warehouse" 
                  element={
                    // Show loading if user exists but profile is still loading
                    profile === null ? (
                      <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading warehouse access...</p>
                        </div>
                      </div>
                    ) : profile.role === 'admin' ? (
                      <RouteErrorBoundary>
                        <Layout><WarehousePage /></Layout>
                      </RouteErrorBoundary>
                    ) : (
                      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700">
                        DEBUG: Non-admin user accessing /warehouse, would redirect to /dashboard
                        <br />User: {user.email}
                        <br />Role: {profile.role}
                        {/* <Navigate to="/dashboard" replace /> */}
                      </div>
                    )
                  } 
                />
                {/* Catch-all for authenticated users - redirect to dashboard */}
                <Route path="*" element={
                  <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700">
                    DEBUG: Authenticated user on unknown route, would redirect to /dashboard
                    <br />User: {user.email}
                    <br />Current path: {window.location.hash}
                    {/* <Navigate to="/dashboard" replace /> */}
                  </div>
                } />
              </>
            ) : (
              /* Unauthenticated users get redirected to auth */
              <Route path="*" element={
                <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700">
                  DEBUG: Unauthenticated user, would redirect to /auth
                  <br />Current path: {window.location.hash}
                  {/* <Navigate to="/auth" replace /> */}
                </div>
              } />
            )}
          </Routes>
        </HashRouter>
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Initialize production-ready services
    const initializeProductionServices = async () => {
      try {
        // Validate environment first
        const validation = EnvironmentValidationService.validateEnvironment();
        if (!validation.isValid) {
          console.error('Environment validation failed:', validation.errors);
          return;
        }
        
        // Initialize configuration
        await ConfigService.initializeConfig();
        
        // Start periodic health checks
        HealthCheckService.startPeriodicHealthChecks(5); // Every 5 minutes
        
        // Initialize performance monitoring
        MonitoringService.initializePerformanceMonitoring();
        
        // Set security headers for production
        ProductionConfigService.setSecurityHeaders();
        
        // Optimize bundle performance
        ProductionConfigService.optimizeBundlePerformance();
        
        // Run data integrity check on startup
        setTimeout(async () => {
          try {
            await DataIntegrityService.runFullDataValidation();
          } catch (error) {
            console.warn('Data integrity check failed:', error);
          }
        }, 2000);
        
        console.log('Production services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize production services:', error);
      }
    };

    initializeProductionServices();

    // Cleanup on unmount
    return () => {
      MonitoringService.cleanup();
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <AppContent />
            <Toaster />
            <Sonner />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
