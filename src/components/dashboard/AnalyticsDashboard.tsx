
import React from 'react';
import AdminAnalytics from '../AdminAnalytics';

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">View detailed reports and insights</p>
      </div>
      <AdminAnalytics />
    </div>
  );
};

export default AnalyticsDashboard;
