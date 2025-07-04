
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomerFinancialSummaryProps {
  totalValue: number;
  totalDue: number;
  pendingInvoices: number;
}

const CustomerFinancialSummary: React.FC<CustomerFinancialSummaryProps> = ({
  totalValue,
  totalDue,
  pendingInvoices
}) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader className={isMobile ? 'pb-3' : ''}>
        <CardTitle className={isMobile ? 'text-base' : ''}>Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className={`space-y-3 ${isMobile ? 'space-y-4' : 'space-y-4'}`}>
        <div className="flex items-center justify-between">
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Package Value' : 'Total Package Value'}
          </span>
          <span className={`font-bold ${isMobile ? 'text-sm' : ''}`}>${totalValue.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Outstanding' : 'Outstanding Balance'}
          </span>
          <span className={`font-bold text-orange-600 ${isMobile ? 'text-sm' : ''}`}>${totalDue.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isMobile ? 'Pending' : 'Pending Invoices'}
          </span>
          <Badge 
            variant={pendingInvoices > 0 ? "destructive" : "outline"}
            className={isMobile ? 'text-xs px-2 py-1' : ''}
          >
            {pendingInvoices}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerFinancialSummary;
