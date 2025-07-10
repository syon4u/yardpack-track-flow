
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import CustomerTypeIcon from './CustomerTypeIcon';
import CustomerContactInfo from './CustomerContactInfo';
import CustomerPackageStats from './CustomerPackageStats';
import CustomerFinancialInfo from './CustomerFinancialInfo';
import CustomerActions from './CustomerActions';
import EditCustomerDialog from '../EditCustomerDialog';
import TableColumnSelector from '@/components/ui/table-column-selector';
import { useTableColumns } from '@/hooks/useTableColumns';
import { CustomerWithStats } from '@/types/customer';

interface CustomerDesktopTableProps {
  customers: CustomerWithStats[];
}

const CustomerDesktopTable: React.FC<CustomerDesktopTableProps> = ({ customers }) => {
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithStats | null>(null);

  const defaultColumns = [
    { id: 'customer', label: 'Customer', visible: true, required: true },
    { id: 'type', label: 'Type', visible: true },
    { id: 'contact', label: 'Contact', visible: true },
    { id: 'packageStats', label: 'Package Stats', visible: true },
    { id: 'financial', label: 'Financial', visible: true },
    { id: 'lastActivity', label: 'Last Activity', visible: true },
    { id: 'actions', label: 'Actions', visible: true, required: true },
  ];

  const { columns, updateColumns, isColumnVisible } = useTableColumns({
    defaultColumns,
    storageKey: 'customer-table-columns',
  });

  const handleEditCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setEditingCustomer(customer);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Customer Directory
          <TableColumnSelector 
            columns={columns} 
            onColumnChange={updateColumns}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {isColumnVisible('customer') && <TableHead>Customer</TableHead>}
                {isColumnVisible('type') && <TableHead>Type</TableHead>}
                {isColumnVisible('contact') && <TableHead>Contact</TableHead>}
                {isColumnVisible('packageStats') && <TableHead>Package Stats</TableHead>}
                {isColumnVisible('financial') && <TableHead>Financial</TableHead>}
                {isColumnVisible('lastActivity') && <TableHead>Last Activity</TableHead>}
                {isColumnVisible('actions') && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers?.map((customer) => (
                <TableRow key={customer.id}>
                  {isColumnVisible('customer') && (
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.full_name}</div>
                        <div className="text-sm text-gray-600">
                          {customer.customer_number}
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {isColumnVisible('type') && (
                    <TableCell>
                      <CustomerTypeIcon type={customer.customer_type} />
                    </TableCell>
                  )}
                  {isColumnVisible('contact') && (
                    <TableCell>
                      <CustomerContactInfo
                        email={customer.email}
                        phone={customer.phone_number}
                        address={customer.address}
                        isMobile={false}
                      />
                    </TableCell>
                  )}
                  {isColumnVisible('packageStats') && (
                    <TableCell>
                      <CustomerPackageStats
                        totalPackages={customer.total_packages}
                        activePackages={customer.active_packages}
                        completedPackages={customer.completed_packages}
                        isMobile={false}
                      />
                    </TableCell>
                  )}
                  {isColumnVisible('financial') && (
                    <TableCell>
                      <CustomerFinancialInfo
                        totalSpent={customer.total_spent}
                        outstandingBalance={customer.outstanding_balance}
                        isMobile={false}
                      />
                    </TableCell>
                  )}
                  {isColumnVisible('lastActivity') && (
                    <TableCell>
                      <div className="text-sm flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {customer.last_activity 
                          ? new Date(customer.last_activity).toLocaleDateString()
                          : new Date(customer.created_at).toLocaleDateString()
                        }
                      </div>
                    </TableCell>
                  )}
                  {isColumnVisible('actions') && (
                    <TableCell>
                      <CustomerActions 
                        customerId={customer.id}
                        customerEmail={customer.email}
                        customerName={customer.full_name}
                        hasEmail={!!customer.email} 
                        isMobile={false}
                        onEdit={handleEditCustomer}
                      />
                    </TableCell>
                  )}
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>

         <EditCustomerDialog
           customer={editingCustomer}
           isOpen={!!editingCustomer}
           onClose={() => setEditingCustomer(null)}
         />
       </CardContent>
     </Card>
   );
};

export default CustomerDesktopTable;
