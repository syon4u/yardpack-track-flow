import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  MapPin, 
  Edit, 
  Save, 
  Settings, 
  MessageSquare,
  Package,
  TrendingUp,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomerCommunicationPreferences from './CustomerCommunicationPreferences';
import { useToast } from '@/hooks/use-toast';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface EnhancedCustomerProfileTabProps {
  profile: Profile | null;
  totalPackages: number;
  totalValue: number;
  totalDue: number;
  pickedUpPackages: number;
}

const EnhancedCustomerProfileTab: React.FC<EnhancedCustomerProfileTabProps> = ({
  profile,
  totalPackages,
  totalValue,
  totalDue,
  pickedUpPackages
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
    address: profile?.address || '',
  });

  const handleSave = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({
      full_name: profile?.full_name || '',
      phone_number: profile?.phone_number || '',
      address: profile?.address || '',
    });
    setIsEditing(false);
  };

  const getAccountLevel = () => {
    if (totalPackages >= 50) return { level: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
    if (totalPackages >= 20) return { level: 'Silver', color: 'bg-gray-100 text-gray-800' };
    return { level: 'Bronze', color: 'bg-orange-100 text-orange-800' };
  };

  const accountLevel = getAccountLevel();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile?.full_name || 'Customer'}</h2>
                <p className="text-muted-foreground">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={accountLevel.color}>
                    {accountLevel.level} Member
                  </Badge>
                  <Badge variant="outline">
                    {profile?.role || 'Customer'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <TabsTrigger value="personal" className={isMobile ? 'text-xs' : ''}>
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="stats" className={isMobile ? 'text-xs' : ''}>
            Account Stats
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="communication">
                Communication
              </TabsTrigger>
              <TabsTrigger value="settings">
                Settings
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.full_name}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-muted/50 rounded-md">
                      {profile?.full_name || 'Not provided'}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Email Address</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-md flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {profile?.email || 'Not provided'}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.phone_number}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, phone_number: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-muted/50 rounded-md flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {profile?.phone_number || 'Not provided'}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-md flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Delivery Address</Label>
                {isEditing ? (
                  <Input
                    value={editedProfile.address}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, address: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 p-3 bg-muted/50 rounded-md flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    {profile?.address || 'Not provided'}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Statistics */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Account Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-blue-600">{totalPackages}</div>
                  <div className="text-sm text-muted-foreground">Total Packages</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-8 h-8 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-500 font-bold">$</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">${totalDue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Amount Due</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-8 h-8 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-500 font-bold">✓</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{pickedUpPackages}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="font-medium mb-4">Account Achievements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600">🏆</span>
                    </div>
                    <div>
                      <p className="font-medium">Loyal Customer</p>
                      <p className="text-sm text-muted-foreground">Member for over 6 months</p>
                    </div>
                  </div>
                  
                  {totalPackages >= 10 && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Frequent Shipper</p>
                        <p className="text-sm text-muted-foreground">10+ packages shipped</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Preferences */}
        {!isMobile && (
          <TabsContent value="communication">
            <CustomerCommunicationPreferences />
          </TabsContent>
        )}

        {/* Settings */}
        {!isMobile && (
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Additional account settings and preferences will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Mobile Communication Preferences */}
      {isMobile && (
        <CustomerCommunicationPreferences />
      )}
    </div>
  );
};

export default EnhancedCustomerProfileTab;