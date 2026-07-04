'use client';

import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface DetailTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function DetailTabs({ tabs, activeTab, onTabChange }: DetailTabsProps) {
  return (
    <div className="border-b border-slate-200 overflow-x-auto">
      <div className="flex gap-0 min-w-max" dir="rtl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="mr-1.5 text-xs text-slate-400">({tab.count})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
