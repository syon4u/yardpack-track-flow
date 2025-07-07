
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import WarehousePage from "@/pages/WarehousePage";
import PackageDetailPage from "@/pages/PackageDetailPage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import RouteErrorBoundary from "@/components/error/RouteErrorBoundary";
import { config, validateConfig } from "@/config/environment";
import { initializeSecurity } from "@/utils/security";

// Initialize security measures
initializeSecurity();

// Validate configuration on startup
if (!validateConfig()) {
  console.error('❌ Invalid application configuration detected');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.limits.cacheTime,
      gcTime: config.limits.cacheTime * 2,
      retry: config.isProduction ? 3 : 1,
    },
    mutations: {
      retry: config.isProduction ? 2 : 0,
    },
  },
});

const AppContent: React.FC = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to={profile?.role === 'warehouse' ? "/warehouse" : "/dashboard"} replace /> : <AuthPage />} />
        
        {/* Protected routes */}
        {user ? (
          <>
            <Route 
              path="/dashboard" 
              element={
                profile?.role === 'warehouse' ? (
                  <Navigate to="/warehouse" replace />
                ) : (
                  <RouteErrorBoundary>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </RouteErrorBoundary>
                )
              } 
            />
            <Route 
              path="/admin" 
              element={
                profile?.role === 'admin' ? (
                  <RouteErrorBoundary>
                    <Layout><Dashboard /></Layout>
                  </RouteErrorBoundary>
                ) : (
                  <Navigate to={profile?.role === 'warehouse' ? "/warehouse" : "/dashboard"} replace />
                )
              } 
            />
            <Route 
              path="/warehouse" 
              element={
                (profile?.role === 'admin' || profile?.role === 'warehouse') ? (
                  <RouteErrorBoundary>
                    <Layout><WarehousePage /></Layout>
                  </RouteErrorBoundary>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            <Route 
              path="/package/:id" 
              element={
                <RouteErrorBoundary>
                  <Layout>
                    <PackageDetailPage />
                  </Layout>
                </RouteErrorBoundary>
              } 
            />
            {/* Catch-all for authenticated users - redirect based on role */}
            <Route path="*" element={<Navigate to={profile?.role === 'warehouse' ? "/warehouse" : "/dashboard"} replace />} />
          </>
        ) : (
          /* Unauthenticated users get redirected to auth */
          <Route path="*" element={<Navigate to="/auth" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Log application startup
    console.log(`🚀 ${config.app.name} v${config.app.version} starting in ${config.environment} mode`);
    
    // Performance monitoring
    if (config.features.enablePerformanceMonitoring) {
      performance.mark('app-start');
    }
    
    return () => {
      if (config.features.enablePerformanceMonitoring) {
        performance.mark('app-end');
        performance.measure('app-lifetime', 'app-start', 'app-end');
      }
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
