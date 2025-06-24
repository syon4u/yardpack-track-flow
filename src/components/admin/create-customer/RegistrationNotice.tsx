
import React from 'react';

interface RegistrationNoticeProps {
  customerType: string;
  isMobile: boolean;
}

const RegistrationNotice: React.FC<RegistrationNoticeProps> = ({ customerType, isMobile }) => {
  if (customerType !== 'registered') return null;

  return (
    <div className={`text-sm text-gray-600 bg-blue-50 p-3 rounded ${isMobile ? 'text-xs' : ''}`}>
      <p><strong>Note:</strong> The customer will receive a confirmation email and will need to verify their email address before they can log in.</p>
    </div>
  );
};

export default RegistrationNotice;
