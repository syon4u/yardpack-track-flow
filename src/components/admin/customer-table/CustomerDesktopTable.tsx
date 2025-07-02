
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
import { CustomerWithStats } from '@/types/customer';

interface CustomerDesktopTableProps {
  customers: CustomerWithStats[];
}

const CustomerDesktopTable: React.FC<CustomerDesktopTableProps> = ({ customers }) => {
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithStats | null>(null);

  const handleEditCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setEditingCustomer(customer);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Package Stats</TableHead>
                <TableHead>Financial</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers?.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.full_name}</div>
                      <div className="text-sm text-gray-600">
                        {customer.customer_number}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CustomerTypeIcon type={customer.customer_type} />
                  </TableCell>
                  <TableCell>
                    <CustomerContactInfo
                      email={customer.email}
                      phone={customer.phone_number}
                      address={customer.address}
                      isMobile={false}
                    />
                  </TableCell>
                  <TableCell>
                    <CustomerPackageStats
                      totalPackages={customer.total_packages}
                      activePackages={customer.active_packages}
                      completedPackages={customer.completed_packages}
                      isMobile={false}
                    />
                  </TableCell>
                  <TableCell>
                    <CustomerFinancialInfo
                      totalSpent={customer.total_spent}
                      outstandingBalance={customer.outstanding_balance}
                      isMobile={false}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {customer.last_activity 
                        ? new Date(customer.last_activity).toLocaleDateString()
                        : new Date(customer.created_at).toLocaleDateString()
                      }
                    </div>
                  </TableCell>
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
