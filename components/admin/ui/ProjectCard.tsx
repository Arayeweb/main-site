'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { API_PROJECT_STATUS_COLORS, API_PROJECT_STATUS_LABELS } from '@/lib/adminMappers';

export interface ProjectCardData {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  owner: string;
  deadline: string;
}

interface ProjectCardProps {
  project: ProjectCardData;
  href?: string;
}

export function ProjectCard({ project, href }: ProjectCardProps) {
  const content = (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{project.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{project.client}</p>
        </div>
        <StatusBadge
          label={API_PROJECT_STATUS_LABELS[project.status] ?? project.status}
          colorClass={API_PROJECT_STATUS_COLORS[project.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
        />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full', project.progress === 100 ? 'bg-green-500' : 'bg-blue-500')}
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 tabular-nums">{project.progress}٪</span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{project.owner}</span>
        <span className="tabular-nums">{project.deadline}</span>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', value === 100 ? 'bg-green-500' : 'bg-blue-500')}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 tabular-nums w-8">{value}٪</span>
    </div>
  );
}
