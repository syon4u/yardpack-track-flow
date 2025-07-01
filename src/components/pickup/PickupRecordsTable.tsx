
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { usePackagePickupRecords } from '@/hooks/usePickupVerification';

interface PickupRecordsTableProps {
  packageId: string;
  onViewDetails?: (recordId: string) => void;
}

const PickupRecordsTable: React.FC<PickupRecordsTableProps> = ({
  packageId,
  onViewDetails,
}) => {
  const { data: pickupRecords, isLoading } = usePackagePickupRecords(packageId);

  if (isLoading) {
    return <div className="text-center py-4">Loading pickup records...</div>;
  }

  if (!pickupRecords || pickupRecords.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pickup records found for this package.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pickup History</h3>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Pickup Person</TableHead>
              <TableHead>Verification Method</TableHead>
              <TableHead>Authorized By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pickupRecords.map((record: any) => (
              <TableRow key={record.id}>
                <TableCell>
                  {format(new Date(record.pickup_timestamp), 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{record.pickup_person_name}</div>
                    {record.pickup_person_phone && (
                      <div className="text-sm text-gray-500">{record.pickup_person_phone}</div>
                    )}
                    <div className="text-xs text-gray-400 capitalize">
                      {record.pickup_person_relationship?.replace('_', ' ')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {record.verification_method?.name?.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {record.authorized_staff?.full_name || 'Unknown Staff'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge 
                      variant={record.verification_successful ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {record.verification_successful ? 'Verified' : 'Failed'}
                    </Badge>
                    {record.package_condition !== 'good' && (
                      <Badge variant="outline" className="text-xs">
                        {record.package_condition}
                      </Badge>
                    )}
                    {!record.customer_satisfied && (
                      <Badge variant="destructive" className="text-xs">
                        Unsatisfied
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails?.(record.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {record.verification_data && (
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PickupRecordsTable;
