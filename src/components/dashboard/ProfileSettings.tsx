
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const ProfileSettings: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">{profile?.full_name}</p>
              <p className="text-sm text-gray-500">Full Name</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">{profile?.email}</p>
              <p className="text-sm text-gray-500">Email Address</p>
            </div>
          </div>

          {profile?.phone_number && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{profile.phone_number}</p>
                <p className="text-sm text-gray-500">Phone Number</p>
              </div>
            </div>
          )}

          {profile?.address && (
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{profile.address}</p>
                <p className="text-sm text-gray-500">Address</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Badge variant="outline">{profile?.role}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
