import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

const DesktopTabNavigation: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-5 mb-6">
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="packages">My Packages</TabsTrigger>
      <TabsTrigger value="invoices">Invoices</TabsTrigger>
      <TabsTrigger value="profile">Profile</TabsTrigger>
      <TabsTrigger value="help">Help</TabsTrigger>
    </TabsList>
  );
};

export default DesktopTabNavigation;