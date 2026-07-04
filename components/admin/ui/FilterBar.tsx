'use client';

import { SearchInput } from './SearchInput';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    label?: string;
  }[];
  count?: number;
  countLabel?: string;
  actions?: React.ReactNode;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'جستجو...',
  filters = [],
  count,
  countLabel = 'مورد',
  actions,
}: FilterBarProps) {
  return (
    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-56">
          <SearchInput value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
        </div>
        {filters.map((filter, i) => (
          <select
            key={i}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            dir="rtl"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}
        {actions}
      </div>
      {count !== undefined && (
        <span className="text-xs text-slate-500">{count} {countLabel}</span>
      )}
    </div>
  );
}
