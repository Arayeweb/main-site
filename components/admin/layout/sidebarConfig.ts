export type PanelType = 'manager' | 'sales' | 'support';

export interface SidebarItem {
  label: string;
  href: string;
  iconName: string;
}

export const managerSidebarItems: SidebarItem[] = [
  { label: 'داشبورد', href: '/admin/manager', iconName: 'LayoutDashboard' },
  { label: 'مشتریان', href: '/admin/manager/clients', iconName: 'Users' },
  { label: 'پروژه‌ها', href: '/admin/manager/projects', iconName: 'FolderOpen' },
  { label: 'تسک‌ها', href: '/admin/manager/tasks', iconName: 'CheckSquare' },
  { label: 'قراردادها', href: '/admin/manager/contracts', iconName: 'FileCheck' },
  { label: 'پیشنهادها', href: '/admin/manager/proposals', iconName: 'FileText' },
  { label: 'فاکتورها', href: '/admin/manager/invoices', iconName: 'CreditCard' },
  { label: 'کمپین‌ها', href: '/admin/manager/campaigns', iconName: 'Megaphone' },
  { label: 'آمار و بازاریابی', href: '/admin/manager/analytics', iconName: 'LineChart' },
  { label: 'Growth KPI', href: '/admin/manager/growth', iconName: 'Target' },
  { label: 'منابع لید', href: '/admin/manager/lead-sources', iconName: 'Link2' },
  { label: 'درخواست تغییرات', href: '/admin/manager/change-requests', iconName: 'GitPullRequest' },
  { label: 'پلن‌های پشتیبانی', href: '/admin/manager/maintenance', iconName: 'Wrench' },
  { label: 'پرداخت‌ها', href: '/admin/manager/payments', iconName: 'CreditCard' },
  { label: 'تیم', href: '/admin/manager/team', iconName: 'UserCheck' },
  { label: 'تنظیمات', href: '/admin/manager/settings', iconName: 'Settings' },
];

export const salesSidebarItems: SidebarItem[] = [
  { label: 'داشبورد فروش', href: '/admin/sales', iconName: 'BarChart2' },
  { label: 'لیدها', href: '/admin/sales/leads', iconName: 'UserPlus' },
  { label: 'پایپ‌لاین', href: '/admin/sales/pipeline', iconName: 'Kanban' },
  { label: 'پیگیری‌های امروز', href: '/admin/sales/followups', iconName: 'Bell' },
  { label: 'مشتریان', href: '/admin/sales/clients', iconName: 'Users' },
  { label: 'پیشنهاد قیمت‌ها', href: '/admin/sales/proposals', iconName: 'FileText' },
  { label: 'فاکتورها', href: '/admin/sales/invoices', iconName: 'CreditCard' },
  { label: 'قراردادها', href: '/admin/sales/contracts', iconName: 'FileCheck' },
  { label: 'سایت فوری', href: '/admin/sales/fastweb', iconName: 'Zap' },
  { label: 'بریف سایت', href: '/admin/sales/website-briefs', iconName: 'FileText' },
  { label: 'کارت ویزیت', href: '/admin/sales/bizcard-leads', iconName: 'CreditCard' },
  { label: 'فروش محتوا', href: '/admin/sales/content-sales', iconName: 'ShoppingBag' },
  { label: 'فریلنس', href: '/admin/sales/freelance', iconName: 'Briefcase' },
  { label: 'لیدهای AdReady', href: '/admin/sales/adready-leads', iconName: 'Target' },
  { label: 'کمپین‌ها', href: '/admin/sales/campaigns', iconName: 'Megaphone' },
  { label: 'منابع لید', href: '/admin/sales/lead-sources', iconName: 'Link2' },
];

export const supportSidebarItems: SidebarItem[] = [
  { label: 'داشبورد پشتیبانی', href: '/admin/support', iconName: 'HeadphonesIcon' },
  { label: 'تیکت‌ها', href: '/admin/support/tickets', iconName: 'Ticket' },
  { label: 'مشتریان', href: '/admin/support/clients', iconName: 'Users' },
  { label: 'پروژه‌ها', href: '/admin/support/projects', iconName: 'FolderOpen' },
  { label: 'درخواست تغییرات', href: '/admin/support/change-requests', iconName: 'GitPullRequest' },
  { label: 'پلن‌های پشتیبانی', href: '/admin/support/maintenance', iconName: 'Wrench' },
];

export const PANEL_LABELS: Record<PanelType, string> = {
  manager: 'مدیریت',
  sales: 'فروش',
  support: 'پشتیبانی',
};

export function getSidebarItems(panel: PanelType): SidebarItem[] {
  if (panel === 'manager') return managerSidebarItems;
  if (panel === 'sales') return salesSidebarItems;
  return supportSidebarItems;
}
