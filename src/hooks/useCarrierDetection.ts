import { useState, useCallback } from 'react';

export interface CarrierInfo {
  carrier: string;
  confidence: 'high' | 'medium' | 'low';
  trackingUrl?: string;
  supportedFeatures: string[];
}

export const useCarrierDetection = () => {
  const [detectedCarrier, setDetectedCarrier] = useState<CarrierInfo | null>(null);

  const detectCarrier = useCallback((trackingNumber: string): CarrierInfo => {
    const cleaned = trackingNumber.replace(/\s/g, '').toUpperCase();
    
    // USPS patterns - Most comprehensive
    if (
      /^(94|93|92|95)\d{20}$/.test(cleaned) || // Priority Mail Express, Priority Mail, First-Class
      /^[A-Z]{2}\d{9}US$/.test(cleaned) ||     // International format
      /^(70|14|23|03)\d{14}$/.test(cleaned) || // Certified Mail, etc.
      /^420\d{27}$/.test(cleaned) ||           // Priority Mail Express International
      /^(91|82)\d{20}$/.test(cleaned)         // Additional formats
    ) {
      return {
        carrier: 'USPS',
        confidence: 'high',
        trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
        supportedFeatures: ['tracking', 'delivery_confirmation', 'status_updates']
      };
    }
    
    // FedEx patterns
    if (
      /^\d{12,14}$/.test(cleaned) ||           // Standard FedEx
      /^\d{20}$/.test(cleaned) ||              // FedEx Express
      /^61\d{8}$/.test(cleaned) ||             // FedEx SmartPost
      /^96\d{20}$/.test(cleaned) ||            // FedEx Ground
      /^[0-9]{4}[\s]?[0-9]{4}[\s]?[0-9]{4}$/.test(trackingNumber) // Human readable format
    ) {
      return {
        carrier: 'FedEx',
        confidence: 'high',
        trackingUrl: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
        supportedFeatures: ['tracking'] // Limited - would need API
      };
    }
    
    // UPS patterns
    if (
      /^1Z[A-Z0-9]{16}$/.test(cleaned) ||      // Standard UPS
      /^\d{9}$/.test(cleaned) ||               // UPS InfoNotice
      /^T\d{10}$/.test(cleaned)                // UPS Mail Innovations
    ) {
      return {
        carrier: 'UPS',
        confidence: 'high',
        trackingUrl: `https://www.ups.com/track?tracknum=${trackingNumber}`,
        supportedFeatures: ['tracking'] // Limited - would need API
      };
    }
    
    // DHL patterns
    if (
      /^\d{10,11}$/.test(cleaned) ||           // DHL Express
      /^[A-Z]{3}\d{7}$/.test(cleaned) ||       // DHL Global Mail
      /^\d{4}[\s]?\d{4}[\s]?\d{4}[\s]?\d{4}$/.test(trackingNumber) // DHL eCommerce
    ) {
      return {
        carrier: 'DHL',
        confidence: 'medium',
        trackingUrl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
        supportedFeatures: ['tracking'] // Limited - would need API
      };
    }
    
    // Amazon patterns
    if (
      /^TBA\d{12}$/.test(cleaned) ||           // Amazon Logistics
      /^[A-Z]{2}\d{11}[A-Z]{2}$/.test(cleaned) // Amazon Global
    ) {
      return {
        carrier: 'Amazon',
        confidence: 'medium',
        trackingUrl: `https://track.amazon.com/tracking/${trackingNumber}`,
        supportedFeatures: ['tracking'] // Limited
      };
    }

    // Unknown carrier
    return {
      carrier: 'Unknown',
      confidence: 'low',
      supportedFeatures: []
    };
  }, []);

  const setCarrier = useCallback((carrierInfo: CarrierInfo) => {
    setDetectedCarrier(carrierInfo);
  }, []);

  const clearDetection = useCallback(() => {
    setDetectedCarrier(null);
  }, []);

  const getSupportedCarriers = useCallback(() => {
    return [
      {
        name: 'USPS',
        fullName: 'United States Postal Service',
        apiIntegrated: true,
        features: ['tracking', 'delivery_confirmation', 'status_updates', 'notifications']
      },
      {
        name: 'FedEx',
        fullName: 'Federal Express',
        apiIntegrated: false,
        features: ['tracking', 'basic_status']
      },
      {
        name: 'UPS',
        fullName: 'United Parcel Service',
        apiIntegrated: false,
        features: ['tracking', 'basic_status']
      },
      {
        name: 'DHL',
        fullName: 'DHL Express',
        apiIntegrated: false,
        features: ['tracking', 'basic_status']
      },
      {
        name: 'Amazon',
        fullName: 'Amazon Logistics',
        apiIntegrated: false,
        features: ['tracking']
      }
    ];
  }, []);

  return {
    detectCarrier,
    detectedCarrier,
    setCarrier,
    clearDetection,
    getSupportedCarriers
  };
};

export default useCarrierDetection;