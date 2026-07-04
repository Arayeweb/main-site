'use client';

import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { CLIENT_TYPE_LABELS, CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS } from '@/lib/adminTypes';
import { formatCurrency } from '@/lib/utils';

export interface ClientCardData {
  id: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  status: string;
  activeProjects: number;
  totalRevenue: number;
  lastContact: string;
}

interface ClientCardProps {
  client: ClientCardData;
  href?: string;
  showRevenue?: boolean;
}

export function ClientCard({ client, href, showRevenue = false }: ClientCardProps) {
  const content = (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{CLIENT_TYPE_LABELS[client.type] ?? client.type}</p>
        </div>
        <StatusBadge
          label={CLIENT_STATUS_LABELS[client.status] ?? client.status}
          colorClass={CLIENT_STATUS_COLORS[client.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Phone className="w-3 h-3" />
          <span dir="ltr">{client.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Mail className="w-3 h-3" />
          <span dir="ltr">{client.email}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400">آخرین ارتباط: <span className="text-slate-600">{client.lastContact}</span></span>
        {client.activeProjects > 0 && (
          <span className="bg-blue-50 text-blue-600 ring-1 ring-blue-200 px-2 py-0.5 rounded-full font-medium">
            {client.activeProjects} پروژه
          </span>
        )}
      </div>

      {showRevenue && client.totalRevenue > 0 && (
        <p className="mt-2 text-xs font-medium text-slate-700">{formatCurrency(client.totalRevenue)}</p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
