'use client';

import { EmptyState } from './EmptyState';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  minWidth?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyTitle,
  minWidth = '800px',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth }} dir="rtl">
        <thead>
          <tr className="bg-slate-50/60 border-b border-slate-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-right px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={`hover:bg-slate-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 ${col.className ?? ''}`}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
