
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import WarehousePage from '@/pages/WarehousePage';
import RouteErrorBoundary from '@/components/error/RouteErrorBoundary';

const AppRoutes: React.FC = () => {
  const { user, profile } = useAuth();

  return (
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
  );
};

export default AppRoutes;
