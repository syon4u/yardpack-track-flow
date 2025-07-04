
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
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
import AppRouter from "@/components/routing/AppRouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const AppContent: React.FC = () => {
  console.log('[AppContent] Auth disabled, rendering all routes...');

  return (
    <AppRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* All routes now accessible without authentication */}
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
            <RouteErrorBoundary>
              <Layout><Dashboard /></Layout>
            </RouteErrorBoundary>
          } 
        />
        <Route 
          path="/warehouse" 
          element={
            <RouteErrorBoundary>
              <Layout><WarehousePage /></Layout>
            </RouteErrorBoundary>
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
        {/* 404 page for unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppRouter>
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
