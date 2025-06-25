
import React from 'react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  // Authentication disabled - allow all access
  return <>{children}</>;
};

export default ProtectedAdminRoute;
