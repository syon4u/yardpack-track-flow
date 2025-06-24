
import React from 'react';
import CustomerTypeBadge from './CustomerTypeBadge';

interface CustomerTypeIconProps {
  type: 'registered' | 'guest' | 'package_only';
}

const CustomerTypeIcon: React.FC<CustomerTypeIconProps> = ({ type }) => {
  return <CustomerTypeBadge type={type} />;
};

export default CustomerTypeIcon;
