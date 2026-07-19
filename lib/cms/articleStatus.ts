import type { CmsArticleStatus } from './types';

type Transition = { from: CmsArticleStatus; to: CmsArticleStatus; cap: string };

const TRANSITIONS: Transition[] = [
  { from: 'DRAFT', to: 'IN_REVIEW', cap: 'cms.submit_review' },
  { from: 'IN_REVIEW', to: 'APPROVED', cap: 'cms.approve' },
  { from: 'IN_REVIEW', to: 'DRAFT', cap: 'cms.approve' },
  { from: 'APPROVED', to: 'PUBLISHED', cap: 'cms.publish' },
  { from: 'APPROVED', to: 'SCHEDULED', cap: 'cms.schedule' },
  { from: 'SCHEDULED', to: 'PUBLISHED', cap: 'cms.publish' },
  { from: 'PUBLISHED', to: 'ARCHIVED', cap: 'cms.archive' },
  { from: 'DRAFT', to: 'ARCHIVED', cap: 'cms.archive' },
  { from: 'APPROVED', to: 'ARCHIVED', cap: 'cms.archive' },
  { from: 'IN_REVIEW', to: 'ARCHIVED', cap: 'cms.archive' },
  { from: 'SCHEDULED', to: 'ARCHIVED', cap: 'cms.archive' },
  { from: 'ARCHIVED', to: 'DRAFT', cap: 'cms.edit_all' },
];

export function canTransition(
  from: CmsArticleStatus,
  to: CmsArticleStatus,
  hasCap: (cap: string) => boolean
): boolean {
  if (from === to) return true;
  const rule = TRANSITIONS.find((t) => t.from === from && t.to === to);
  if (!rule) return false;
  return hasCap(rule.cap);
}

export const STATUS_LABELS: Record<CmsArticleStatus, string> = {
  DRAFT: 'پیش‌نویس',
  IN_REVIEW: 'در بررسی',
  APPROVED: 'تأییدشده',
  SCHEDULED: 'زمان‌بندی‌شده',
  PUBLISHED: 'منتشرشده',
  ARCHIVED: 'بایگانی',
};
