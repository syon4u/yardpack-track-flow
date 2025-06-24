
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, LogOut, User, Bell, Search, Settings, Menu } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNavigation from './MobileNavigation';
import TrackingResults from './TrackingResults';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showTrackingResults, setShowTrackingResults] = useState(false);

  const handleTrack = () => {
    if (trackingNumber.trim()) {
      setShowTrackingResults(true);
    }
  };

  if (showTrackingResults) {
    return (
      <TrackingResults 
        trackingNumber={trackingNumber} 
        onBack={() => {
          setShowTrackingResults(false);
          setTrackingNumber('');
        }} 
      />
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        {/* Mobile Navigation Sidebar */}
        {isMobile && <MobileNavigation />}

        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14 sm:h-16">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* Mobile Menu Trigger */}
                  {isMobile && (
                    <SidebarTrigger className="p-2">
                      <Menu className="h-5 w-5" />
                    </SidebarTrigger>
                  )}
                  
                  {/* Logo */}
                  <div className="flex items-center space-x-2">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900">YardPack</h1>
                  </div>
                </div>
                
                {profile && (
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Desktop Navigation */}
                    {!isMobile && profile.role === 'admin' && (
                      <div className="hidden md:flex items-center space-x-2">
                        <Button 
                          variant={location.pathname === '/dashboard' ? 'default' : 'ghost'} 
                          size="sm"
                          onClick={() => navigate('/dashboard')}
                        >
                          Dashboard
                        </Button>
                        <Button 
                          variant={location.pathname === '/admin' ? 'default' : 'ghost'} 
                          size="sm"
                          onClick={() => navigate('/admin')}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Admin
                        </Button>
                      </div>
                    )}

                    {/* Track Package - Responsive */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size={isMobile ? "sm" : "sm"} className="px-2 sm:px-3">
                          <Search className="h-4 w-4 mr-0 sm:mr-2" />
                          <span className="hidden sm:inline">Track</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 sm:w-80" side={isMobile ? "bottom" : "bottom"} align="end">
                        <div className="space-y-3">
                          <h4 className="font-medium">Track Package</h4>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter tracking number"
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                              className="flex-1"
                            />
                            <Button onClick={handleTrack} size="sm" className="px-3">
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Notifications */}
                    <Button variant="ghost" size={isMobile ? "sm" : "sm"} className="px-2 sm:px-3">
                      <Bell className="h-4 w-4" />
                    </Button>

                    {/* User Profile - Responsive */}
                    {!isMobile ? (
                      <div className="hidden sm:flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium truncate max-w-24 lg:max-w-none">
                          {profile.full_name}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {profile.role}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <User className="h-4 w-4" />
                      </div>
                    )}

                    {/* Desktop Sign Out */}
                    {!isMobile && (
                      <Button variant="ghost" size="sm" onClick={signOut} className="px-2 sm:px-3">
                        <LogOut className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
