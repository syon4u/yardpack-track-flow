
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomerActionItemsProps {
  pendingReceipts: number;
  readyForPickup: number;
}

const CustomerActionItems: React.FC<CustomerActionItemsProps> = ({
  pendingReceipts,
  readyForPickup
}) => {
  const isMobile = useIsMobile();

  if (pendingReceipts === 0 && readyForPickup === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className={isMobile ? 'pb-2' : ''}>
        <CardTitle className={`flex items-center gap-2 text-orange-800 ${isMobile ? 'text-sm' : ''}`}>
          <AlertCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-2 ${isMobile ? 'space-y-3' : 'space-y-2'}`}>
        {pendingReceipts > 0 && (
          <div className={`flex items-center justify-between ${isMobile ? 'flex-col items-start space-y-1' : ''}`}>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
              {isMobile 
                ? `${pendingReceipts} package${pendingReceipts > 1 ? 's' : ''} need receipts`
                : `You have ${pendingReceipts} package${pendingReceipts > 1 ? 's' : ''} waiting for receipt upload`
              }
            </span>
            <Badge 
              variant="outline" 
              className={`text-orange-600 border-orange-300 ${isMobile ? 'text-xs px-2 py-1' : ''}`}
            >
              Pending
            </Badge>
          </div>
        )}
        {readyForPickup > 0 && (
          <div className={`flex items-center justify-between ${isMobile ? 'flex-col items-start space-y-1' : ''}`}>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
              {isMobile
                ? `${readyForPickup} package${readyForPickup > 1 ? 's' : ''} ready for pickup`
                : `${readyForPickup} package${readyForPickup > 1 ? 's are' : ' is'} ready for pickup in Jamaica`
              }
            </span>
            <Badge className={`bg-green-100 text-green-700 ${isMobile ? 'text-xs px-2 py-1' : ''}`}>
              Ready
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerActionItems;
