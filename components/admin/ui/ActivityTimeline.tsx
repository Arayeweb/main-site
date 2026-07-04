'use client';

import { Activity, ACTIVITY_COLORS } from '@/lib/adminTypes';
import { cn } from '@/lib/utils';
import { Bell, FileText, CreditCard, AlertCircle, Layers, FileCheck, UserPlus } from 'lucide-react';

const ACTIVITY_ICONS: Record<Activity['type'], React.ElementType> = {
  new_lead: UserPlus,
  proposal_sent: FileText,
  payment_received: CreditCard,
  new_ticket: AlertCircle,
  project_stage: Layers,
  contract_signed: FileCheck,
  client_added: Bell,
};

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="flex flex-col gap-0">
      {activities.map((activity, idx) => {
        const Icon = ACTIVITY_ICONS[activity.type];
        const colorClass = ACTIVITY_COLORS[activity.type];
        return (
          <div key={activity.id} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div className={cn('p-1.5 rounded-full shrink-0 z-10', colorClass)}>
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              {idx < activities.length - 1 && (
                <div className="w-px flex-1 bg-slate-100 mt-1 mb-1 min-h-[20px]" />
              )}
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{activity.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{activity.description}</p>
              <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
