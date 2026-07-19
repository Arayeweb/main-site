import type { AdminRole } from '@/lib/auth';

export type CmsCapability =
  | 'cms.read'
  | 'cms.create'
  | 'cms.edit_own'
  | 'cms.edit_all'
  | 'cms.submit_review'
  | 'cms.approve'
  | 'cms.publish'
  | 'cms.schedule'
  | 'cms.archive'
  | 'cms.manage_categories'
  | 'cms.manage_authors'
  | 'cms.manage_media'
  | 'cms.restore_revision'
  | 'cms.view_audit_log'
  | 'cms.ai_use'
  | 'cms.ai_settings';

const ADMIN_CAPS: CmsCapability[] = [
  'cms.read',
  'cms.create',
  'cms.edit_own',
  'cms.edit_all',
  'cms.submit_review',
  'cms.approve',
  'cms.publish',
  'cms.schedule',
  'cms.archive',
  'cms.manage_categories',
  'cms.manage_authors',
  'cms.manage_media',
  'cms.restore_revision',
  'cms.view_audit_log',
  'cms.ai_use',
  'cms.ai_settings',
];

const SALES_CAPS: CmsCapability[] = ['cms.read'];

const ROLE_CAPS: Partial<Record<AdminRole, CmsCapability[]>> = {
  admin: ADMIN_CAPS,
  sales: SALES_CAPS,
};

export function hasCmsCapability(role: AdminRole, cap: CmsCapability): boolean {
  const caps = ROLE_CAPS[role] ?? [];
  return caps.includes(cap);
}

export function requireCmsCapability(role: AdminRole, cap: CmsCapability): boolean {
  return hasCmsCapability(role, cap);
}

export function canEditArticle(
  role: AdminRole,
  userId: string,
  article: { created_by: string | null; status: string }
): boolean {
  if (hasCmsCapability(role, 'cms.edit_all')) return true;
  if (!hasCmsCapability(role, 'cms.edit_own')) return false;
  return article.created_by === userId;
}
