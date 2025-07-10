import { useState, useEffect } from 'react';
import { TableColumn } from '@/components/ui/table-column-selector';

interface UseTableColumnsProps {
  defaultColumns: TableColumn[];
  storageKey: string; // For localStorage persistence
}

export const useTableColumns = ({ defaultColumns, storageKey }: UseTableColumnsProps) => {
  const [columns, setColumns] = useState<TableColumn[]>(defaultColumns);

  // Load saved column preferences from localStorage
  useEffect(() => {
    const savedColumns = localStorage.getItem(storageKey);
    if (savedColumns) {
      try {
        const parsed = JSON.parse(savedColumns) as TableColumn[];
        // Merge with default columns to handle new columns that might have been added
        const mergedColumns = defaultColumns.map(defaultCol => {
          const savedCol = parsed.find(col => col.id === defaultCol.id);
          return savedCol ? { ...defaultCol, visible: savedCol.visible } : defaultCol;
        });
        setColumns(mergedColumns);
      } catch (error) {
        console.error('Error parsing saved column preferences:', error);
        setColumns(defaultColumns);
      }
    }
  }, [defaultColumns, storageKey]);

  // Save column preferences to localStorage
  const updateColumns = (newColumns: TableColumn[]) => {
    setColumns(newColumns);
    localStorage.setItem(storageKey, JSON.stringify(newColumns));
  };

  // Helper function to check if a column is visible
  const isColumnVisible = (columnId: string): boolean => {
    const column = columns.find(col => col.id === columnId);
    return column?.visible ?? false;
  };

  // Get visible columns only
  const visibleColumns = columns.filter(col => col.visible);

  return {
    columns,
    updateColumns,
    isColumnVisible,
    visibleColumns,
  };
};