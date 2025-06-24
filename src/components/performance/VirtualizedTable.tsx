
import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  width: number;
  render: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemHeight?: number;
  height?: number;
  className?: string;
  onItemClick?: (item: T, index: number) => void;
}

interface RowProps<T> {
  index: number;
  style: React.CSSProperties;
  data: {
    items: T[];
    columns: Column<T>[];
    onItemClick?: (item: T, index: number) => void;
  };
}

function Row<T>({ index, style, data }: RowProps<T>) {
  const { items, columns, onItemClick } = data;
  const item = items[index];

  const handleClick = useCallback(() => {
    if (onItemClick && item) {
      onItemClick(item, index);
    }
  }, [onItemClick, item, index]);

  if (!item) return null;

  return (
    <div style={style}>
      <TableRow 
        className={cn(
          "flex w-full cursor-pointer transition-colors hover:bg-muted/50",
          onItemClick && "hover:bg-accent"
        )}
        onClick={handleClick}
      >
        {columns.map((column, columnIndex) => (
          <TableCell
            key={`${index}-${column.key}`}
            className={cn(
              "flex-shrink-0 border-r border-border p-2 text-sm",
              column.className
            )}
            style={{ width: column.width }}
          >
            {column.render(item, index)}
          </TableCell>
        ))}
      </TableRow>
    </div>
  );
}

export function VirtualizedTable<T>({
  data,
  columns,
  itemHeight = 60,
  height = 400,
  className,
  onItemClick,
}: VirtualizedTableProps<T>) {
  const totalWidth = useMemo(() => 
    columns.reduce((sum, col) => sum + col.width, 0), 
    [columns]
  );

  const itemData = useMemo(() => ({
    items: data,
    columns,
    onItemClick,
  }), [data, columns, onItemClick]);

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Header */}
      <div style={{ width: totalWidth }}>
        <Table>
          <TableHeader>
            <TableRow className="flex w-full bg-muted/50">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "flex-shrink-0 border-r border-border p-2 font-medium",
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Virtualized Body */}
      <div style={{ height, width: totalWidth }}>
        <List
          height={height}
          itemCount={data.length}
          itemSize={itemHeight}
          itemData={itemData}
          width={totalWidth}
        >
          {Row}
        </List>
      </div>
    </div>
  );
}
