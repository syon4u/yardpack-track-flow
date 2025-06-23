
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Eye, Package as PackageIcon } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Package = Database['public']['Tables']['packages']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null;
  invoices: Database['public']['Tables']['invoices']['Row'][];
};

interface PackageTableProps {
  packages: Package[];
  userRole: string;
  onStatusUpdate?: (packageId: string, status: Package['status']) => void;
  onUploadInvoice?: (packageId: string) => void;
  onViewInvoice?: (packageId: string) => void;
}

const getStatusColor = (status: Package['status']) => {
  switch (status) {
    case 'received':
      return 'bg-blue-100 text-blue-800';
    case 'in_transit':
      return 'bg-yellow-100 text-yellow-800';
    case 'arrived':
      return 'bg-purple-100 text-purple-800';
    case 'ready_for_pickup':
      return 'bg-green-100 text-green-800';
    case 'picked_up':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: Package['status']) => {
  switch (status) {
    case 'received':
      return 'Received';
    case 'in_transit':
      return 'In Transit';
    case 'arrived':
      return 'Arrived';
    case 'ready_for_pickup':
      return 'Ready for Pickup';
    case 'picked_up':
      return 'Picked Up';
    default:
      return 'Unknown';
  }
};

const PackageTable: React.FC<PackageTableProps> = ({
  packages,
  userRole,
  onUploadInvoice,
  onViewInvoice,
}) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tracking Number</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Received</TableHead>
            <TableHead>Total Due</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <PackageIcon className="h-4 w-4 text-gray-500" />
                  {pkg.tracking_number}
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">{pkg.description}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(pkg.status)}>
                  {getStatusLabel(pkg.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {pkg.date_received ? new Date(pkg.date_received).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                {pkg.total_due ? `$${pkg.total_due.toFixed(2)}` : 'N/A'}
              </TableCell>
              <TableCell>
                {pkg.invoices && pkg.invoices.length > 0 ? (
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Uploaded
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {userRole === 'customer' && (
                    <>
                      {(!pkg.invoices || pkg.invoices.length === 0) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUploadInvoice?.(pkg.id)}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                      {pkg.invoices && pkg.invoices.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewInvoice?.(pkg.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PackageTable;
