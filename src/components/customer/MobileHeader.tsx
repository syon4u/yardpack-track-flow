import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Search } from 'lucide-react';

interface MobileHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ isRefreshing, onRefresh }) => {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="touch-target"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="touch-target">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="touch-target">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;