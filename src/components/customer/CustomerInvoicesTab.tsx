
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import InvoiceSecurityTest from '../admin/InvoiceSecurityTest';

const CustomerInvoicesTab: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
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
            <p>Invoice management features are integrated into the package management system.</p>
            <p className="text-sm">Upload and manage your purchase invoices directly from your package cards.</p>
          </div>
        </CardContent>
      </Card>

      {profile?.role === 'admin' && (
        <InvoiceSecurityTest />
      )}
    </div>
  );
};

export default CustomerInvoicesTab;
