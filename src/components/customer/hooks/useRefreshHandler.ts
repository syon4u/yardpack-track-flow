import { useState, useCallback } from 'react';

export const useRefreshHandler = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      // Add success haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }
    }, 1000);
  }, []);

  return {
    isRefreshing,
    handleRefresh
  };
};