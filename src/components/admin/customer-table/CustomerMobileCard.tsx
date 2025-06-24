
import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import CustomerTypeBadge from './CustomerTypeBadge';
import CustomerContactInfo from './CustomerContactInfo';
import CustomerPackageStats from './CustomerPackageStats';
import CustomerFinancialInfo from './CustomerFinancialInfo';
import CustomerActions from './CustomerActions';

interface CustomerWithStats {
  id: string;
  customer_number: string;
  customer_type: 'registered' | 'guest' | 'package_only';
  full_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  created_at: string;
  total_packages: number;
  active_packages: number;
  completed_packages: number;
  total_spent: number;
  outstanding_balance: number;
  last_activity: string | null;
}

interface CustomerMobileCardProps {
  customer: CustomerWithStats;
}

const CustomerMobileCard: React.FC<CustomerMobileCardProps> = ({ customer }) => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-sm">{customer.full_name}</h4>
            <p className="text-xs text-gray-600">
              {customer.customer_number}
            </p>
          </div>
          <CustomerTypeBadge type={customer.customer_type} />
        </div>

        {/* Contact Info */}
        <CustomerContactInfo
          email={customer.email}
          phone={customer.phone_number}
          address={customer.address}
          isMobile={true}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <CustomerPackageStats
            totalPackages={customer.total_packages}
            activePackages={customer.active_packages}
            completedPackages={customer.completed_packages}
            isMobile={true}
          />
          <CustomerFinancialInfo
            totalSpent={customer.total_spent}
            outstandingBalance={customer.outstanding_balance}
            isMobile={true}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs flex items-center text-gray-600">
            <Calendar className="h-3 w-3 mr-1" />
            {customer.last_activity 
              ? new Date(customer.last_activity).toLocaleDateString()
              : new Date(customer.created_at).toLocaleDateString()
            }
          </div>
          <CustomerActions hasEmail={!!customer.email} isMobile={true} />
        </div>
      </div>
    </Card>
  );
};

export default CustomerMobileCard;
