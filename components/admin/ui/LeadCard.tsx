'use client';

import { Phone } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { ActionMenu } from './ActionMenu';
import { CRM_STATUS_COLORS, CRM_STATUS_LABELS } from '@/lib/adminMappers';

export interface LeadCardData {
  id: string;
  name: string;
  phone: string;
  sourceLabel: string;
  need: string;
  status: string;
  budget: string;
  createdAt: string;
}

interface LeadCardProps {
  lead: LeadCardData;
  onOpen: () => void;
  actions?: { label: string; onClick: () => void; variant?: 'default' | 'danger' }[];
}

export function LeadCard({ lead, onOpen, actions }: LeadCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer text-right"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-sm truncate">{lead.name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Phone className="w-3 h-3 shrink-0" />
            <span dir="ltr" className="tabular-nums truncate">{lead.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusBadge
            label={CRM_STATUS_LABELS[lead.status] ?? lead.status}
            colorClass={CRM_STATUS_COLORS[lead.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
          />
          {actions && actions.length > 0 && <ActionMenu actions={actions} />}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-xs text-slate-500">
        <p>
          <span className="text-slate-400">منبع: </span>
          {lead.sourceLabel}
        </p>
        <p>
          <span className="text-slate-400">نیاز: </span>
          {lead.need}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="tabular-nums">{lead.createdAt}</span>
        {lead.budget !== '—' && <span className="text-slate-600 tabular-nums">{lead.budget}</span>}
      </div>
    </div>
  );
}
