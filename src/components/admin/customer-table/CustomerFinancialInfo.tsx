
import React from 'react';

interface CustomerFinancialInfoProps {
  totalSpent: number;
  outstandingBalance: number;
  isMobile?: boolean;
}

const CustomerFinancialInfo: React.FC<CustomerFinancialInfoProps> = ({ 
  totalSpent, 
  outstandingBalance, 
  isMobile = false 
}) => {
  if (isMobile) {
    return (
      <div>
        <p className="text-gray-600">Financial</p>
        <p className="font-medium">${totalSpent.toFixed(2)} spent</p>
        {outstandingBalance > 0 && (
          <p className="text-red-600">${outstandingBalance.toFixed(2)} due</p>
        )}
      </div>
    );
  }

  return (
    <div className="text-sm space-y-1">
      <div className="font-medium">${totalSpent.toFixed(2)} spent</div>
      {outstandingBalance > 0 && (
        <div className="text-red-600">${outstandingBalance.toFixed(2)} due</div>
      )}
    </div>
  );
};

export default CustomerFinancialInfo;
