
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, LogOut, User, Bell, Search, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate, useLocation } from 'react-router-dom';
import TrackingResults from './TrackingResults';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">YardPack</h1>
            </div>
            
            {profile && (
              <div className="flex items-center space-x-4">
                {/* Navigation for admin users */}
                {profile.role === 'admin' && (
                  <div className="flex items-center space-x-2">
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

                {/* Track Package Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Track
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <h4 className="font-medium">Track Package</h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter tracking number"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                        />
                        <Button onClick={handleTrack} size="sm">
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{profile.full_name}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {profile.role}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
