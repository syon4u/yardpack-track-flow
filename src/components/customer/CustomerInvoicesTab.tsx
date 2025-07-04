import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useInvoices, useUploadInvoice, useDownloadInvoice, useDeleteInvoice } from '@/hooks/useInvoices';
import { usePackages } from '@/hooks/usePackages';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Upload, Download, Trash2, Search, Plus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

const CustomerInvoicesTab: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  const { data: invoices, isPending: invoicesLoading } = useInvoices();
  const { data: packages } = usePackages({});
  const uploadMutation = useUploadInvoice();
  const downloadMutation = useDownloadInvoice();
  const deleteMutation = useDeleteInvoice();

  // Filter invoices based on search and status
  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = !searchTerm || 
      invoice.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.packages?.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Get packages without invoices for upload dialog
  const packagesWithoutInvoices = packages?.filter(pkg => 
    !invoices?.some(inv => inv.package_id === pkg.id)
  ) || [];

  const handleFileUpload = async (file: File) => {
    if (!selectedPackageId) return;
    
    try {
      await uploadMutation.mutateAsync({ packageId: selectedPackageId, file });
      setShowUploadDialog(false);
      setSelectedPackageId('');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDownload = async (filePath: string) => {
    await downloadMutation.mutateAsync(filePath);
  };

  const handleDelete = async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      await deleteMutation.mutateAsync(invoiceId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (invoicesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Management
          </CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Management
          </CardTitle>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[250px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Invoice</DialogTitle>
                  <DialogDescription>
                    Select a package and upload the corresponding invoice/receipt.
                  </DialogDescription>
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
                    <Label htmlFor="file-upload">Upload File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      disabled={!selectedPackageId || uploadMutation.isPending}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Upload your first invoice to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    {!isMobile && <TableHead>File Name</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
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
                      {!isMobile && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="truncate max-w-[200px]" title={invoice.file_name}>
                              {invoice.file_name}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        {getStatusBadge(invoice.status || 'pending')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.uploaded_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(invoice.file_path)}
                            disabled={downloadMutation.isPending}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invoice.id)}
                            disabled={deleteMutation.isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {invoices?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Invoices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {invoices?.filter(inv => inv.status === 'pending').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {invoices?.filter(inv => inv.status === 'approved').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {invoices?.filter(inv => inv.status === 'rejected').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerInvoicesTab;