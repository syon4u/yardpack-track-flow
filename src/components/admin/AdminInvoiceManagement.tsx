import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAllInvoices, useUpdateInvoiceStatus, useDownloadInvoice } from '@/hooks/useInvoices';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, Search, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
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

  const { data: invoices, isPending } = useAllInvoices(statusFilter);
  const updateStatusMutation = useUpdateInvoiceStatus();
  const downloadMutation = useDownloadInvoice();

  // Filter invoices based on search
  const filteredInvoices = invoices?.filter(invoice => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return invoice.file_name.toLowerCase().includes(searchLower) ||
           invoice.packages?.tracking_number?.toLowerCase().includes(searchLower) ||
           invoice.packages?.customers?.full_name?.toLowerCase().includes(searchLower);
  }) || [];

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

  const getStatusBadge = (status: string) => {
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
    if (!invoices) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    
    return {
      total: invoices.length,
      pending: invoices.filter(inv => inv.status === 'pending').length,
      approved: invoices.filter(inv => inv.status === 'approved').length,
      rejected: invoices.filter(inv => inv.status === 'rejected').length,
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

  if (isPending) {
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
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Invoices</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Invoice Management */}
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
                  : 'No invoices have been uploaded yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
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
                            {invoice.packages?.customers?.full_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.packages?.customers?.email || 'No email'}
                          </div>
                        </div>
                      </TableCell>
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
                            onClick={() => handleReviewInvoice(invoice)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Eye className="h-4 w-4" />
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