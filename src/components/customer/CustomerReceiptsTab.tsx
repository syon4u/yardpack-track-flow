
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

const CustomerReceiptsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Receipt Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Upload your purchase receipts for customs clearance.</p>
          <p className="text-sm">Receipts help us process your packages through customs more efficiently.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerReceiptsTab;
