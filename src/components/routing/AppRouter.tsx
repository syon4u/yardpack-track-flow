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
    const hostname = window.location.hostname;
    
    // Debug logging
    console.log('[AppRouter] Current URL:', window.location.href);
    console.log('[AppRouter] Hostname:', hostname);
    console.log('[AppRouter] Pathname:', pathname);
    
    // Check if we're in Lovable preview environment
    if (hostname === 'lovable.dev' && pathname.includes('/projects/')) {
      // Match pattern: /projects/[project-id] (no additional segment required)
      const match = pathname.match(/^(\/projects\/[^\/]+)/);
      if (match) {
        const basename = match[1];
        console.log('[AppRouter] Lovable preview detected, basename:', basename);
        return basename;
      } else {
        console.warn('[AppRouter] Failed to extract basename from Lovable URL:', pathname);
        return '';
      }
    }
    
    console.log('[AppRouter] Production environment, no basename needed');
    return '';
  };

  const basename = getBasename();
  
  return <BrowserRouter basename={basename}>{children}</BrowserRouter>;
};

export default AppRouter;