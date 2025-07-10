import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Settings2, Eye, EyeOff } from 'lucide-react';

export interface TableColumn {
  id: string;
  label: string;
  visible: boolean;
  required?: boolean; // Some columns might be required and can't be hidden
}

interface TableColumnSelectorProps {
  columns: TableColumn[];
  onColumnChange: (columns: TableColumn[]) => void;
  className?: string;
}

const TableColumnSelector: React.FC<TableColumnSelectorProps> = ({
  columns,
  onColumnChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColumnToggle = (columnId: string) => {
    const updatedColumns = columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    onColumnChange(updatedColumns);
  };

  const showAllColumns = () => {
    const updatedColumns = columns.map(col => ({ ...col, visible: true }));
    onColumnChange(updatedColumns);
  };

  const hideAllOptionalColumns = () => {
    const updatedColumns = columns.map(col => 
      col.required ? col : { ...col, visible: false }
    );
    onColumnChange(updatedColumns);
  };

  const visibleCount = columns.filter(col => col.visible).length;
  const totalCount = columns.length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${className}`}
        >
          <Settings2 className="h-4 w-4" />
          Columns ({visibleCount}/{totalCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-background border border-border">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Table Columns</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={showAllColumns}
              className="h-auto p-1 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={hideAllOptionalColumns}
              className="h-auto p-1 text-xs"
            >
              <EyeOff className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-60 overflow-y-auto">
          {columns.map((column) => (
            <DropdownMenuItem
              key={column.id}
              className="flex items-center space-x-2 cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                if (!column.required) {
                  handleColumnToggle(column.id);
                }
              }}
            >
              <Checkbox
                checked={column.visible}
                disabled={column.required}
                onChange={() => !column.required && handleColumnToggle(column.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className={`text-sm flex-1 ${column.required ? 'text-muted-foreground' : ''}`}>
                {column.label}
                {column.required && (
                  <span className="text-xs text-muted-foreground ml-1">(required)</span>
                )}
              </span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableColumnSelector;