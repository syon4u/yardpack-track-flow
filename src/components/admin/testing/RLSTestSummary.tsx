
import React from 'react';

export const RLSTestSummary: React.FC = () => {
  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
      <h5 className="font-semibold text-sm mb-2">RLS Policy Summary:</h5>
      <ul className="text-xs text-gray-600 space-y-1">
        <li>• Users can only read their own customer record (user_id = auth.uid())</li>
        <li>• Only admins can insert new customer records</li>
        <li>• Only admins can update any customer record</li>
        <li>• Admins can read all customer records</li>
      </ul>
    </div>
  );
};
