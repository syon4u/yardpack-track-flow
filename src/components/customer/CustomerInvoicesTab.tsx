import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInvoices, useDownloadInvoice, useUploadInvoice } from '@/hooks/useInvoices';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, Upload, Receipt, DollarSign, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CustomerInvoicesTab: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPackageId, setUploadPackageId] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Separate queries for shipping invoices and receipts
  const { data: shippingInvoices, isPending: shippingLoading } = useInvoices(undefined, 'shipping_invoice');
  const { data: receipts, isPending: receiptsLoading } = useInvoices(undefined, 'receipt');
  
  const downloadMutation = useDownloadInvoice();
  const uploadMutation = useUploadInvoice();

  const handleDownload = async (filePath: string) => {
    await downloadMutation.mutateAsync(filePath);
  };

  const handleUploadReceipt = async () => {
    if (!selectedFile || !uploadPackageId) return;

    try {
      await uploadMutation.mutateAsync({
        packageId: uploadPackageId,
        file: selectedFile,
      });
      setShowUploadDialog(false);
      setSelectedFile(null);
      setUploadPackageId('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getStatusBadge = (status: string, paymentStatus?: string) => {
    if (paymentStatus === 'paid') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>;
    }
    
    switch (status) {
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const ShippingInvoicesTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Shipping Invoices
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Invoices for shipping charges, customs duties, and handling fees
        </p>
      </CardHeader>
      <CardContent>
        {shippingLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading invoices...</p>
          </div>
        ) : shippingInvoices && shippingInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shippingInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {invoice.packages?.tracking_number || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.packages?.description || 'No description'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {invoice.invoice_number || 'Auto-Generated'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${invoice.total_amount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      {invoice.payment_due_date ? 
                        format(new Date(invoice.payment_due_date), 'MMM dd, yyyy') : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status || 'pending', invoice.payment_status || undefined)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(invoice.file_path)}
                        disabled={downloadMutation.isPending}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No shipping invoices</p>
            <p className="text-sm">Invoices will appear here when your packages are in transit.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ReceiptsTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment Receipts
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload receipts for payments you've made
            </p>
          </div>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Receipt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Payment Receipt</DialogTitle>
                <DialogDescription>
                  Upload a receipt for a payment you've made.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="package-id">Package ID</Label>
                  <Input
                    id="package-id"
                    value={uploadPackageId}
                    onChange={(e) => setUploadPackageId(e.target.value)}
                    placeholder="Enter package ID"
                  />
                </div>
                <div>
                  <Label htmlFor="receipt-file">Receipt File</Label>
                  <Input
                    id="receipt-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button
                  onClick={handleUploadReceipt}
                  disabled={uploadMutation.isPending || !selectedFile || !uploadPackageId}
                  className="w-full"
                >
                  Upload Receipt
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {receiptsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading receipts...</p>
          </div>
        ) : receipts && receipts.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {receipt.packages?.tracking_number || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {receipt.packages?.description || 'No description'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="truncate max-w-[200px]" title={receipt.file_name}>
                          {receipt.file_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(receipt.uploaded_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(receipt.status || 'pending')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(receipt.file_path)}
                        disabled={downloadMutation.isPending}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No receipts uploaded</p>
            <p className="text-sm">Upload receipts for payments you've made to track your transactions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-destructive">Please log in to view your invoices.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="shipping" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shipping">Shipping Invoices</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
          </TabsList>
          <TabsContent value="shipping" className="mt-6">
            <ShippingInvoicesTable />
          </TabsContent>
          <TabsContent value="receipts" className="mt-6">
            <ReceiptsTable />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="shipping" className="w-full">
        <TabsList>
          <TabsTrigger value="shipping">Shipping Invoices</TabsTrigger>
          <TabsTrigger value="receipts">Payment Receipts</TabsTrigger>
        </TabsList>
        <TabsContent value="shipping" className="mt-6">
          <ShippingInvoicesTable />
        </TabsContent>
        <TabsContent value="receipts" className="mt-6">
          <ReceiptsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerInvoicesTab;