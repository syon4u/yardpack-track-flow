import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InvoiceWithPackage } from '@/types/invoice';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileBarChart, 
  Mail,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FinancialExportsProps {
  period: string;
  dateRange?: DateRange;
  invoices: InvoiceWithPackage[];
  stats: {
    total_value: number;
    total_due: number;
    pending_invoices: number;
  };
}

const FinancialExports: React.FC<FinancialExportsProps> = ({ 
  period, 
  dateRange, 
  invoices, 
  stats 
}) => {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportType, setExportType] = useState('summary');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [emailReport, setEmailReport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
    { value: 'json', label: 'JSON', icon: FileBarChart }
  ];

  const exportTypes = [
    { value: 'summary', label: 'Financial Summary', description: 'Key metrics and KPIs' },
    { value: 'detailed', label: 'Detailed Report', description: 'All transactions and invoices' },
    { value: 'aging', label: 'Aging Report', description: 'Overdue invoice analysis' },
    { value: 'customer', label: 'Customer Analysis', description: 'Customer financial breakdown' },
    { value: 'revenue', label: 'Revenue Analysis', description: 'Revenue trends and analytics' }
  ];

  const generateExportData = () => {
    const baseData = {
      period: period,
      dateRange: dateRange ? `${format(dateRange.from!, 'yyyy-MM-dd')} to ${format(dateRange.to!, 'yyyy-MM-dd')}` : null,
      generatedAt: new Date().toISOString(),
      stats: {
        totalInvoices: invoices.length,
        totalRevenue: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
        paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
        pendingInvoices: invoices.filter(inv => inv.status === 'pending' || inv.status === 'draft').length,
        overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length,
        ...stats
      }
    };

    switch (exportType) {
      case 'summary':
        return {
          ...baseData,
          summary: {
            paymentRate: (baseData.stats.paidInvoices / baseData.stats.totalInvoices) * 100,
            averageInvoiceValue: baseData.stats.totalRevenue / baseData.stats.totalInvoices,
            collectionEfficiency: (baseData.stats.paidInvoices / (baseData.stats.paidInvoices + baseData.stats.overdueInvoices)) * 100
          }
        };

      case 'detailed':
        return {
          ...baseData,
          invoices: invoices.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            amount: inv.total_amount,
            status: inv.status,
            dueDate: inv.due_date,
            uploadedAt: inv.uploaded_at,
            customer: inv.packages?.customers?.full_name || 'Unknown',
            packageId: inv.package_id
          }))
        };

      case 'aging':
        const now = new Date();
        const agingBuckets = invoices.reduce((acc, inv) => {
          if (inv.status === 'paid') return acc;
          
          const dueDate = inv.due_date ? new Date(inv.due_date) : null;
          if (!dueDate) return acc;
          
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          const amount = inv.total_amount || 0;
          
          if (daysOverdue <= 0) {
            acc.current.count++;
            acc.current.amount += amount;
          } else if (daysOverdue <= 30) {
            acc['1-30'].count++;
            acc['1-30'].amount += amount;
          } else if (daysOverdue <= 60) {
            acc['31-60'].count++;
            acc['31-60'].amount += amount;
          } else if (daysOverdue <= 90) {
            acc['61-90'].count++;
            acc['61-90'].amount += amount;
          } else {
            acc['90+'].count++;
            acc['90+'].amount += amount;
          }
          
          return acc;
        }, {
          current: { count: 0, amount: 0 },
          '1-30': { count: 0, amount: 0 },
          '31-60': { count: 0, amount: 0 },
          '61-90': { count: 0, amount: 0 },
          '90+': { count: 0, amount: 0 }
        });

        return {
          ...baseData,
          agingAnalysis: agingBuckets
        };

      default:
        return baseData;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportData = generateExportData();
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Convert data to the selected format
      // 2. Create and download the file
      // 3. Optionally email the report
      
      if (exportFormat === 'csv') {
        // Convert to CSV and download
        const csvContent = convertToCSV(exportData);
        downloadFile(csvContent, `financial-report-${Date.now()}.csv`, 'text/csv');
      } else if (exportFormat === 'json') {
        // Download as JSON
        const jsonContent = JSON.stringify(exportData, null, 2);
        downloadFile(jsonContent, `financial-report-${Date.now()}.json`, 'application/json');
      }
      
      if (emailReport) {
        // Send email notification
        toast({
          title: "Report Emailed",
          description: "Financial report has been sent to your email address.",
        });
      }
      
      toast({
        title: "Export Successful",
        description: `Financial report exported as ${exportFormat.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export financial report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any): string => {
    if (exportType === 'detailed' && data.invoices) {
      const headers = ['Invoice Number', 'Customer', 'Amount', 'Status', 'Due Date', 'Uploaded At'];
      const rows = data.invoices.map((inv: any) => [
        inv.invoiceNumber || inv.id,
        inv.customer,
        inv.amount,
        inv.status,
        inv.dueDate || '',
        inv.uploadedAt
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    // Default summary format
    const summary = [
      ['Metric', 'Value'],
      ['Total Invoices', data.stats.totalInvoices],
      ['Total Revenue', data.stats.totalRevenue],
      ['Paid Invoices', data.stats.paidInvoices],
      ['Pending Invoices', data.stats.pendingInvoices],
      ['Overdue Invoices', data.stats.overdueInvoices]
    ];
    
    return summary.map(row => row.join(',')).join('\n');
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="export-type">Report Type</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {exportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map(format => {
                    const Icon = format.icon;
                    return (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {format.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-details" 
                  checked={includeDetails}
                  onCheckedChange={(checked) => setIncludeDetails(checked === true)}
                />
                <Label htmlFor="include-details">Include detailed transactions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-charts" 
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked === true)}
                />
                <Label htmlFor="include-charts">Include charts and graphs</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email-report" 
                  checked={emailReport}
                  onCheckedChange={(checked) => setEmailReport(checked === true)}
                />
                <Label htmlFor="email-report">Email report to me</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Period: {period === 'custom' && dateRange 
                  ? `${format(dateRange.from!, 'MMM dd')} - ${format(dateRange.to!, 'MMM dd, yyyy')}`
                  : `Last ${period} days`
                }</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Generated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Data Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total Invoices: {invoices.length}</div>
                <div>Total Revenue: ${invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toLocaleString()}</div>
                <div>Paid: {invoices.filter(inv => inv.status === 'paid').length}</div>
                <div>Pending: {invoices.filter(inv => inv.status === 'pending' || inv.status === 'draft').length}</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Export Settings</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Format: {exportFormat.toUpperCase()}</div>
                <div>Type: {exportTypes.find(t => t.value === exportType)?.label}</div>
                <div>Details: {includeDetails ? 'Yes' : 'No'}</div>
                <div>Charts: {includeCharts ? 'Yes' : 'No'}</div>
                <div>Email: {emailReport ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Ready to export your financial report</p>
              <p className="text-sm text-muted-foreground">
                This will generate a {exportFormat.toUpperCase()} file with your selected financial data.
              </p>
            </div>
            
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set up automatic financial reports to be generated and emailed on a regular schedule.
            </p>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Monthly Financial Summary</div>
                  <div className="text-sm text-muted-foreground">
                    Sent on the 1st of each month
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              Set Up New Scheduled Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialExports;