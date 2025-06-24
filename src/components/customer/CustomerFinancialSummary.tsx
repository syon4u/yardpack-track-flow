
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Package Value</span>
          <span className="font-bold">${totalValue.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Outstanding Balance</span>
          <span className="font-bold text-orange-600">${totalDue.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pending Invoices</span>
          <Badge variant={pendingInvoices > 0 ? "destructive" : "outline"}>
            {pendingInvoices}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerFinancialSummary;
