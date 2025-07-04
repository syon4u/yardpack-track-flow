import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchFilterProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default SearchFilter;