import { useState } from 'react';

export function useTrackingDialog() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showTrackingResults, setShowTrackingResults] = useState(false);

  const handleTrack = () => {
    if (trackingNumber.trim()) {
      setShowTrackingResults(true);
    }
  };

  const handleBack = () => {
    setShowTrackingResults(false);
    setTrackingNumber('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrack();
    }
  };

  return {
    trackingNumber,
    setTrackingNumber,
    showTrackingResults,
    handleTrack,
    handleBack,
    handleKeyPress,
  };
}