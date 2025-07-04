
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTrackingDialog } from '@/hooks/useTrackingDialog';
import AppSidebar from './navigation/AppSidebar';
import TrackingResults from './TrackingResults';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const {
    trackingNumber,
    setTrackingNumber,
    showTrackingResults,
    handleTrack,
    handleBack,
    handleKeyPress,
  } = useTrackingDialog();

  if (showTrackingResults) {
    return (
      <TrackingResults 
        trackingNumber={trackingNumber} 
        onBack={handleBack}
      />
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar />

        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14 sm:h-16">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger />
                  <div className="hidden sm:block">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Welcome back, {profile?.full_name?.split(' ')[0]}
                    </h2>
                  </div>
                </div>
                
                {profile && (
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Track Package */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                          <Search className="h-4 w-4 mr-0 sm:mr-2" />
                          <span className="hidden sm:inline">Track</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 sm:w-80" side="bottom" align="end">
                        <div className="space-y-3">
                          <h4 className="font-medium">Track Package</h4>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter tracking number"
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              onKeyPress={handleKeyPress}
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
                    <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
