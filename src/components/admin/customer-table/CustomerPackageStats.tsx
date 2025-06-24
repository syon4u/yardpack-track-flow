
import React from 'react';

interface CustomerPackageStatsProps {
  totalPackages: number;
  activePackages: number;
  completedPackages: number;
  isMobile?: boolean;
}

const CustomerPackageStats: React.FC<CustomerPackageStatsProps> = ({ 
  totalPackages, 
  activePackages, 
  completedPackages, 
  isMobile = false 
}) => {
  if (isMobile) {
    return (
      <div>
        <p className="text-gray-600">Packages</p>
        <p className="font-medium">{totalPackages} total</p>
        <p className="text-green-600">{activePackages} active</p>
      </div>
    );
  }

  return (
    <div className="text-sm space-y-1">
      <div>{totalPackages} total packages</div>
      <div className="text-green-600">{activePackages} active</div>
      <div className="text-gray-600">{completedPackages} completed</div>
    </div>
  );
};

export default CustomerPackageStats;
