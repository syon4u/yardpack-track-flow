import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilterBadgesProps {
  filters: Record<string, string>;
  onClearAll: () => void;
  excludeKeys?: string[];
}

const FilterBadges: React.FC<FilterBadgesProps> = ({
  filters,
  onClearAll,
  excludeKeys = ['all', ''],
}) => {
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => 
      value && 
      !excludeKeys.includes(value) &&
      key !== 'clearAllFilters' &&
      key !== 'hasActiveFilters'
  );

  if (activeFilters.length === 0) {
    return null;
  }

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Filter', '');
  };

  const formatValue = (value: string) => {
    if (value.length > 20) {
      return value.substring(0, 20) + '...';
    }
    return value.replace(/_/g, ' ');
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {activeFilters.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="text-xs">
          {formatKey(key)}: {formatValue(value)}
        </Badge>
      ))}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onClearAll}
        className="flex items-center gap-1 text-xs"
      >
        <X className="h-3 w-3" />
        Clear All
      </Button>
    </div>
  );
};

export default FilterBadges;