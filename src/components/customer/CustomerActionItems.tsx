
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface CustomerActionItemsProps {
  pendingInvoices: number;
  readyForPickup: number;
}

const CustomerActionItems: React.FC<CustomerActionItemsProps> = ({
  pendingInvoices,
  readyForPickup
}) => {
  if (pendingInvoices === 0 && readyForPickup === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {pendingInvoices > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm">
              You have {pendingInvoices} package{pendingInvoices > 1 ? 's' : ''} waiting for invoice upload
            </span>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Pending
            </Badge>
          </div>
        )}
        {readyForPickup > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {readyForPickup} package{readyForPickup > 1 ? 's are' : ' is'} ready for pickup in Jamaica
            </span>
            <Badge className="bg-green-100 text-green-700">
              Ready
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerActionItems;
