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
  // Detect Lovable preview environment and extract basename
  const getBasename = () => {
    const pathname = window.location.pathname;
    
    // Debug logging
    console.log('[AppRouter] Current URL:', window.location.href);
    console.log('[AppRouter] Pathname:', pathname);
    
    // Check if we're in Lovable preview (contains /projects/ path)
    if (pathname.includes('/projects/')) {
      const match = pathname.match(/^(\/projects\/[^\/]+\/[^\/]+)/);
      const basename = match ? match[1] : '';
      console.log('[AppRouter] Lovable preview detected, basename:', basename);
      return basename;
    }
    
    console.log('[AppRouter] Production environment, no basename needed');
    return '';
  };

  const basename = getBasename();
  
  return <BrowserRouter basename={basename}>{children}</BrowserRouter>;
};

export default AppRouter;