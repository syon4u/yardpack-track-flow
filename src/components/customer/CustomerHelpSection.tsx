
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CustomerHelpSection: React.FC = () => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">Need Help?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Package Status Guide:</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• <strong>Received:</strong> Package arrived at Miami facility</li>
              <li>• <strong>In Transit:</strong> Package is on its way to Jamaica</li>
              <li>• <strong>Arrived:</strong> Package reached Jamaica facility</li>
              <li>• <strong>Ready:</strong> Package is ready for pickup</li>
              <li>• <strong>Picked Up:</strong> Package has been collected</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Important Notes:</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Upload purchase invoices for customs clearance</li>
              <li>• Duty fees are calculated based on item value</li>
              <li>• Contact us for pickup arrangements</li>
              <li>• Track packages using your tracking numbers</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerHelpSection;
