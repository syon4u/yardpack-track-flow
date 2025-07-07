import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAllInvoices, useUpdateInvoiceStatus, useDownloadInvoice, useCreateInvoice } from '@/hooks/useInvoices';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, Search, CheckCircle, XCircle, Clock, Eye, Plus, DollarSign, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminInvoiceManagement: React.FC = () => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [createNotes, setCreateNotes] = useState('');

  // Separate queries for shipping invoices and receipts
  const shippingInvoicesQuery = useAllInvoices(statusFilter, 'shipping_invoice');
  const receiptsQuery = useAllInvoices(statusFilter, 'receipt');
  
  const { data: packagesResult } = useOptimizedPackages({});
  const packages = packagesResult?.data || [];
  const updateStatusMutation = useUpdateInvoiceStatus();
  const downloadMutation = useDownloadInvoice();
  const createInvoiceMutation = useCreateInvoice();

  // Filter function for both invoice types
  const filterInvoices = (invoices: any[]) => {
    if (!searchTerm) return invoices;
    
    const searchLower = searchTerm.toLowerCase();
    return invoices?.filter(invoice => 
      invoice.file_name.toLowerCase().includes(searchLower) ||
      invoice.packages?.tracking_number?.toLowerCase().includes(searchLower) ||
      invoice.packages?.customers?.full_name?.toLowerCase().includes(searchLower)
    ) || [];
  };

  const filteredShippingInvoices = filterInvoices(shippingInvoicesQuery.data || []);
  const filteredReceipts = filterInvoices(receiptsQuery.data || []);

  const handleStatusUpdate = async (invoiceId: string, status: string, notes?: string) => {
    try {
      await updateStatusMutation.mutateAsync({ invoiceId, status, notes });
      setShowReviewDialog(false);
      setSelectedInvoice(null);
      setReviewNotes('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleReviewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setReviewNotes(invoice.notes || '');
    setShowReviewDialog(true);
  };

  const handleDownload = async (filePath: string) => {
    await downloadMutation.mutateAsync(filePath);
  };

  const handleCreateInvoice = async () => {
    if (!selectedPackageId || !invoiceNumber || !totalAmount) return;

    try {
      await createInvoiceMutation.mutateAsync({
        packageId: selectedPackageId,
        invoiceNumber,
        totalAmount: parseFloat(totalAmount),
        dueDate: dueDate || undefined,
        notes: createNotes || undefined,
      });
      
      // Reset form
      setShowCreateDialog(false);
      setSelectedPackageId('');
      setInvoiceNumber('');
      setTotalAmount('');
      setDueDate('');
      setCreateNotes('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Get packages that don't have manual invoices yet
  const packagesWithoutInvoices = packages?.filter(pkg => 
    !receiptsQuery.data?.some(inv => inv.package_id === pkg.id && inv.document_type === 'invoice')
  ) || [];

  const getStatusBadge = (status: string, paymentStatus?: string, invoiceType?: string) => {
    // For shipping invoices, use payment status
    if (invoiceType === 'shipping_invoice' && paymentStatus) {
      switch (paymentStatus) {
        case 'paid':
          return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>;
        case 'pending':
          return <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Payment Pending
          </Badge>;
        case 'overdue':
          return <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>;
        default:
          return <Badge variant="outline">{paymentStatus}</Badge>;
      }
    }
    
    // For receipts, use regular status
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      case 'pending':
        return <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatsData = () => {
    const shippingInvoices = shippingInvoicesQuery.data || [];
    const receipts = receiptsQuery.data || [];
    
    return {
      totalShipping: shippingInvoices.length,
      totalReceipts: receipts.length,
      pendingPayments: shippingInvoices.filter(inv => inv.payment_status === 'pending').length,
      pendingReviews: receipts.filter(inv => inv.status === 'pending').length,
    };
  };

  const stats = getStatsData();

  if (profile?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (shippingInvoicesQuery.isPending || receiptsQuery.isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading invoices...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalShipping}</div>
              <div className="text-sm text-muted-foreground">Shipping Invoices</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalReceipts}</div>
              <div className="text-sm text-muted-foreground">Payment Receipts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
              <div className="text-sm text-muted-foreground">Pending Payments</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.pendingReviews}</div>
              <div className="text-sm text-muted-foreground">Pending Reviews</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="shipping" className="w-full">
        <TabsList>
          <TabsTrigger value="shipping">
            <DollarSign className="h-4 w-4 mr-2" />
            Shipping Invoices
          </TabsTrigger>
          <TabsTrigger value="receipts">
            <Receipt className="h-4 w-4 mr-2" />
            Payment Receipts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="shipping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Invoices</CardTitle>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search shipping invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-[250px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredShippingInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No shipping invoices found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShippingInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.packages?.customers?.full_name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{invoice.packages?.customers?.email || 'No email'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.packages?.tracking_number || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{invoice.packages?.description || 'No description'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">${invoice.total_amount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status || 'pending', invoice.payment_status || undefined, 'shipping_invoice')}</TableCell>
                        <TableCell>{invoice.payment_due_date ? format(new Date(invoice.payment_due_date), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(invoice.file_path)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Receipts</CardTitle>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search receipts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-[250px]"
                  />
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Invoice</DialogTitle>
                      <DialogDescription>Create an invoice for a customer package.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="package-select">Package</Label>
                        <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a package" />
                          </SelectTrigger>
                          <SelectContent>
                            {packagesWithoutInvoices.map((pkg) => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.tracking_number} - {pkg.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="invoice-number">Invoice Number</Label>
                        <Input
                          id="invoice-number"
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          placeholder="INV-2025-001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="total-amount">Total Amount ($)</Label>
                        <Input
                          id="total-amount"
                          type="number"
                          step="0.01"
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleCreateInvoice}
                        disabled={createInvoiceMutation.isPending || !selectedPackageId || !invoiceNumber || !totalAmount}
                      >
                        Create Invoice
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {filteredReceipts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No receipts found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{receipt.packages?.customers?.full_name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{receipt.packages?.customers?.email || 'No email'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{receipt.packages?.tracking_number || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{receipt.packages?.description || 'No description'}</div>
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
                        <TableCell>{getStatusBadge(receipt.status || 'pending')}</TableCell>
                        <TableCell>{format(new Date(receipt.uploaded_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(receipt.file_path)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleReviewInvoice(receipt)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Invoice</DialogTitle>
            <DialogDescription>
              Review and approve or reject this invoice.
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Invoice Details</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedInvoice.file_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Package: {selectedInvoice.packages?.tracking_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  Customer: {selectedInvoice.packages?.customers?.full_name}
                </p>
              </div>
              <div>
                <Label htmlFor="review-notes">Review Notes</Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate(selectedInvoice?.id, 'rejected', reviewNotes)}
              disabled={updateStatusMutation.isPending}
              className="w-full sm:w-auto"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleStatusUpdate(selectedInvoice?.id, 'approved', reviewNotes)}
              disabled={updateStatusMutation.isPending}
              className="w-full sm:w-auto"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvoiceManagement;