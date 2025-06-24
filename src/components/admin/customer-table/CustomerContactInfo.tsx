
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface CustomerContactInfoProps {
  email: string | null;
  phone: string | null;
  address: string | null;
  isMobile?: boolean;
}

const CustomerContactInfo: React.FC<CustomerContactInfoProps> = ({ 
  email, 
  phone, 
  address, 
  isMobile = false 
}) => {
  const textSize = isMobile ? 'text-xs' : 'text-sm';
  const iconSize = isMobile ? 'h-3 w-3' : 'h-3 w-3';
  const addressLimit = isMobile ? 40 : 30;

  return (
    <div className={isMobile ? 'space-y-1' : 'space-y-1'}>
      {email && (
        <div className={`${textSize} flex items-center ${isMobile ? 'text-gray-600' : ''}`}>
          <Mail className={`${iconSize} mr-${isMobile ? '2' : '1'} flex-shrink-0`} />
          <span className="truncate">{email}</span>
        </div>
      )}
      {phone && (
        <div className={`${textSize} flex items-center ${isMobile ? 'text-gray-600' : ''}`}>
          <Phone className={`${iconSize} mr-${isMobile ? '2' : '1'} flex-shrink-0`} />
          <span>{phone}</span>
        </div>
      )}
      {address && (
        <div className={`${textSize} flex items-center ${isMobile ? 'text-gray-600' : ''}`}>
          <MapPin className={`${iconSize} mr-${isMobile ? '2' : '1'} flex-shrink-0`} />
          <span className="truncate">
            {address.length > addressLimit ? `${address.substring(0, addressLimit)}...` : address}
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomerContactInfo;
