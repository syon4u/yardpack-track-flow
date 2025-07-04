import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { detectRouterEnvironment, getProductionBasename } from '@/utils/routerEnvironment';

interface AppRouterProps {
  children: React.ReactNode;
}

/**
 * Smart router wrapper that selects the appropriate router based on environment
 * - Uses HashRouter for Lovable preview (avoids subdirectory conflicts)
 * - Uses BrowserRouter for production (clean URLs)
 */
const AppRouter: React.FC<AppRouterProps> = ({ children }) => {
  const environment = detectRouterEnvironment();
  
  if (environment === 'preview') {
    // Use HashRouter for Lovable preview - completely avoids path conflicts
    if (process.env.NODE_ENV === 'development') {
      console.log('[AppRouter] Using HashRouter for Lovable preview environment');
    }
    return <HashRouter>{children}</HashRouter>;
  }
  
  // Use BrowserRouter for production with clean URLs
  const basename = getProductionBasename();
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AppRouter] Using BrowserRouter for production environment${basename ? ` with basename: ${basename}` : ''}`);
  }
  
  return <BrowserRouter basename={basename}>{children}</BrowserRouter>;
};

export default AppRouter;