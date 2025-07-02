import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, 
  Settings, 
  Users, 
  BarChart3, 
  Home, 
  Scan,
  FileText,
  User,
  HelpCircle,
  LogOut,
  UserCog,
  Bell
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AppSidebar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setOpen } = useSidebar();

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const customerNavItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'My Packages', url: '/dashboard?tab=packages', icon: Package },
    { title: 'Invoices', url: '/dashboard?tab=invoices', icon: FileText },
    { title: 'Profile', url: '/dashboard?tab=profile', icon: User },
  ];

  const adminNavItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Packages', url: '/dashboard?tab=packages', icon: Package },
    { title: 'Customers', url: '/dashboard?tab=customers', icon: Users },
    { title: 'System Users', url: '/dashboard?tab=users', icon: UserCog },
    { title: 'Notifications', url: '/dashboard?tab=notifications', icon: Bell },
    { title: 'Analytics', url: '/dashboard?tab=analytics', icon: BarChart3 },
    { title: 'Scanner', url: '/warehouse', icon: Scan },
    { title: 'Settings', url: '/dashboard?tab=settings', icon: Settings },
  ];

  const navItems = profile?.role === 'admin' ? adminNavItems : customerNavItems;

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">YardPack</h1>
            <p className="text-xs text-gray-500">Package Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.url)}
                    isActive={isActive(item.url.split('?')[0])}
                    className="w-full justify-start px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start px-3 py-2.5 text-sm font-medium rounded-lg transition-colors">
                  <HelpCircle className="h-4 w-4 mr-3" />
                  <span>Help & Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t space-y-3">
        {profile && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-gray-200 rounded-full">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile.full_name}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {profile.role}
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
