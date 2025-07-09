
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type Package = {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  status: Database['public']['Enums']['package_status'];
  package_value: number | null;
  created_at: string;
  invoices: any[];
};

interface CustomerRecentActivityProps {
  packages: Package[] | undefined;
}

const CustomerRecentActivity: React.FC<CustomerRecentActivityProps> = ({ packages }) => {
  const navigate = useNavigate();

  const handlePackageClick = (packageId: string, trackingNumber: string) => {
    navigate(`/dashboard?tab=packages&search=${trackingNumber}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'arrived': return 'bg-purple-100 text-purple-800';
      case 'ready_for_pickup': return 'bg-green-100 text-green-800';
      case 'picked_up': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Package Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages?.slice(0, 5).map((pkg) => (
              <TableRow 
                key={pkg.id}
                className="cursor-pointer transition-colors duration-200 hover:bg-muted/50 interactive-hover"
                onClick={() => handlePackageClick(pkg.id, pkg.tracking_number)}
                role="button"
                tabIndex={0}
                aria-label={`View details for package ${pkg.tracking_number}`}
                onKeyDown={(e) => e.key === 'Enter' && handlePackageClick(pkg.id, pkg.tracking_number)}
              >
                <TableCell className="font-medium">{pkg.tracking_number}</TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate">{pkg.description}</div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(pkg.status)}>
                    {formatStatus(pkg.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(pkg.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  {pkg.package_value ? `$${pkg.package_value.toFixed(2)}` : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {packages && packages.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No packages found. Your packages will appear here once they're registered.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerRecentActivity;
