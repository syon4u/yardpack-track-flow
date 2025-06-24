import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import AdminDashboard from "@/components/AdminDashboard";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import WarehousePage from "@/pages/WarehousePage";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import RouteErrorBoundary from "@/components/error/RouteErrorBoundary";

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
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        
        {/* Protected routes */}
        {user ? (
          <>
            <Route 
              path="/dashboard" 
              element={
                <RouteErrorBoundary>
                  <Layout>
                    {profile?.role === 'admin' ? <AdminDashboard /> : <Dashboard />}
                  </Layout>
                </RouteErrorBoundary>
              } 
            />
            <Route 
              path="/admin" 
              element={
                profile?.role === 'admin' ? (
                  <RouteErrorBoundary>
                    <Layout><AdminDashboard /></Layout>
                  </RouteErrorBoundary>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            <Route 
              path="/warehouse" 
              element={
                profile?.role === 'admin' ? (
                  <RouteErrorBoundary>
                    <Layout><WarehousePage /></Layout>
                  </RouteErrorBoundary>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            {/* Catch-all for authenticated users - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
