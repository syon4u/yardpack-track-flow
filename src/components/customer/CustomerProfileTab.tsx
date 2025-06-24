
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface CustomerProfileTabProps {
  profile: Profile | null;
  totalPackages: number;
  totalValue: number;
  totalDue: number;
  pickedUpPackages: number;
}

const CustomerProfileTab: React.FC<CustomerProfileTabProps> = ({
  profile,
  totalPackages,
  totalValue,
  totalDue,
  pickedUpPackages
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <div className="mt-1 p-2 bg-gray-50 rounded border">
              {profile?.full_name || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 p-2 bg-gray-50 rounded border">
              {profile?.email || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <div className="mt-1 p-2 bg-gray-50 rounded border">
              {profile?.phone_number || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <div className="mt-1 p-2 bg-gray-50 rounded border">
              <Badge variant="outline">{profile?.role || 'Customer'}</Badge>
            </div>
          </div>
        </div>
        
        {profile?.address && (
          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <div className="mt-1 p-2 bg-gray-50 rounded border flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
              {profile.address}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-2">Account Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalPackages}</div>
              <div className="text-xs text-gray-600">Total Packages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
              <div className="text-xs text-gray-600">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${totalDue.toFixed(2)}</div>
              <div className="text-xs text-gray-600">Amount Due</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{pickedUpPackages}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerProfileTab;
