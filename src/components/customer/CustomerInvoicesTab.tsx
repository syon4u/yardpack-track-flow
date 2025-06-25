
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const CustomerInvoicesTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoice Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Invoice management features will be available here.</p>
          <p className="text-sm">Upload and manage your purchase invoices for customs clearance.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInvoicesTab;
