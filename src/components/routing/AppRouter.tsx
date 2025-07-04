import React from 'react';
import { BrowserRouter } from 'react-router-dom';

interface AppRouterProps {
  children: React.ReactNode;
}

/**
 * Smart router wrapper that detects the Lovable preview environment
 * and sets the appropriate basename for BrowserRouter
 */
const AppRouter: React.FC<AppRouterProps> = ({ children }) => {
  // Simplified basename detection to prevent preview issues
  const getBasename = () => {
    try {
      const pathname = window.location.pathname;
      const hostname = window.location.hostname;
      
      console.log('[AppRouter] Current URL:', window.location.href);
      
      // For Lovable preview environment, use empty basename to avoid sub-path mounting
      if (hostname === 'lovable.dev') {
        console.log('[AppRouter] Lovable preview detected, using empty basename');
        return '';
      }
      
      console.log('[AppRouter] Production environment, no basename needed');
      return '';
    } catch (error) {
      console.error('[AppRouter] Error detecting basename:', error);
      return '';
    }
  };

  const basename = getBasename();
  
  return <BrowserRouter basename={basename}>{children}</BrowserRouter>;
};

export default AppRouter;