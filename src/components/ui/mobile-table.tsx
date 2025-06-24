
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileTableProps {
  data: any[];
  columns: {
    key: string;
    header: string;
    render?: (value: any, item: any) => React.ReactNode;
    mobile?: boolean; // Show on mobile
    desktop?: boolean; // Show on desktop
  }[];
  onRowClick?: (item: any) => void;
}

const MobileTable: React.FC<MobileTableProps> = ({ data, columns, onRowClick }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <Card 
            key={index} 
            className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            onClick={() => onRowClick?.(item)}
          >
            <CardContent className="p-4">
              {columns
                .filter(col => col.mobile !== false)
                .map((column) => {
                  const value = item[column.key];
                  const displayValue = column.render ? column.render(value, item) : value;
                  
                  return (
                    <div key={column.key} className="flex justify-between items-center py-1">
                      <span className="text-sm font-medium text-gray-600">
                        {column.header}:
                      </span>
                      <span className="text-sm text-right">
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop table
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            {columns
              .filter(col => col.desktop !== false)
              .map((column) => (
                <th key={column.key} className="border border-gray-200 px-4 py-2 text-left font-medium">
                  {column.header}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={index} 
              className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns
                .filter(col => col.desktop !== false)
                .map((column) => {
                  const value = item[column.key];
                  const displayValue = column.render ? column.render(value, item) : value;
                  
                  return (
                    <td key={column.key} className="border border-gray-200 px-4 py-2">
                      {displayValue}
                    </td>
                  );
                })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MobileTable;
