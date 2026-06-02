import type { ReactNode } from 'react';

import { displayText } from '../../lib/display';
import { EmptyState } from './EmptyState';

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  accessor: keyof T | ((row: T) => unknown);
  render?: (value: unknown, row: T) => ReactNode;
  className?: string;
};

export type DataTableProps<T> = {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  getRowKey?: (row: T, index: number) => string;
  emptyTitle?: string;
  emptyMessage?: string;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowKey,
  emptyTitle = 'No data',
  emptyMessage = 'There are no records to display.',
}: DataTableProps<T>) {
  if (rows.length === 0) return <EmptyState title={emptyTitle} message={emptyMessage} />;

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-panel">
      <table className="min-w-full divide-y divide-border-subtle text-sm">
        <thead className="bg-bg-elevated text-left text-xs uppercase tracking-wide text-text-secondary">
          <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3 font-semibold">{column.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border-subtle text-text-primary">
          {rows.map((row, rowIndex) => (
            <tr key={getRowKey?.(row, rowIndex) ?? rowIndex} className="hover:bg-bg-elevated/60">
              {columns.map((column) => {
                const value = typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor];
                return <td key={column.key} className={`px-4 py-3 ${column.className ?? ''}`}>{column.render ? column.render(value, row) : displayText(value)}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
