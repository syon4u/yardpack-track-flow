import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

const MobileTabNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t px-4 py-2 z-50">
      <TabsList className="grid w-full grid-cols-5 h-14">
        <TabsTrigger value="overview" className="flex-col gap-1 h-full touch-target">
          <div className="text-xs">Overview</div>
        </TabsTrigger>
        <TabsTrigger value="packages" className="flex-col gap-1 h-full touch-target">
          <div className="text-xs">Packages</div>
        </TabsTrigger>
        <TabsTrigger value="invoices" className="flex-col gap-1 h-full touch-target">
          <div className="text-xs">Invoices</div>
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex-col gap-1 h-full touch-target">
          <div className="text-xs">Profile</div>
        </TabsTrigger>
        <TabsTrigger value="help" className="flex-col gap-1 h-full touch-target">
          <div className="text-xs">Help</div>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default MobileTabNavigation;