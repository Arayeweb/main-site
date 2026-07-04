'use client';

import { StatusBadge } from './StatusBadge';

interface PriorityBadgeProps {
  label: string;
  colorClass: string;
}

export function PriorityBadge({ label, colorClass }: PriorityBadgeProps) {
  return <StatusBadge label={label} colorClass={colorClass} />;
}

interface PaymentStatusBadgeProps {
  label: string;
  colorClass: string;
}

export function PaymentStatusBadge({ label, colorClass }: PaymentStatusBadgeProps) {
  return <StatusBadge label={label} colorClass={colorClass} />;
}

interface DocumentStatusBadgeProps {
  label: string;
  colorClass: string;
}

export function DocumentStatusBadge({ label, colorClass }: DocumentStatusBadgeProps) {
  return <StatusBadge label={label} colorClass={colorClass} />;
}
