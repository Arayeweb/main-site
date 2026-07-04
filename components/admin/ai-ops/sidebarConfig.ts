import type { AiOpsModule } from '@/lib/aiAdminAuth';

export interface AiOpsSidebarItem {
  label: string;
  href: string;
  iconName: string;
  module: AiOpsModule;
}

export const AI_OPS_SIDEBAR_GROUPS: { title: string; items: AiOpsSidebarItem[] }[] = [
  {
    title: 'کسب‌وکار',
    items: [
      { label: 'داشبورد', href: '/admin/ai-ops', iconName: 'LayoutDashboard', module: 'overview' },
      { label: 'کاربران', href: '/admin/ai-ops/users', iconName: 'Users', module: 'users' },
      { label: 'اشتراک‌ها و پلن‌ها', href: '/admin/ai-ops/plans', iconName: 'Layers', module: 'plans' },
      { label: 'کردیت‌ها', href: '/admin/ai-ops/credits', iconName: 'Coins', module: 'credits' },
    ],
  },
  {
    title: 'محصول AI',
    items: [
      { label: 'رجیستری مدل‌ها', href: '/admin/ai-ops/models', iconName: 'Cpu', module: 'models' },
      { label: 'ارائه‌دهنده‌های API', href: '/admin/ai-ops/providers', iconName: 'Server', module: 'providers' },
      { label: 'کتابخانه پرامپت', href: '/admin/ai-ops/prompts', iconName: 'BookOpen', module: 'prompts' },
      { label: 'گفتگوها', href: '/admin/ai-ops/conversations', iconName: 'MessagesSquare', module: 'conversations' },
    ],
  },
  {
    title: 'مالی',
    items: [
      { label: 'هزینه API', href: '/admin/ai-ops/costs', iconName: 'TrendingUp', module: 'costs' },
      { label: 'پرداخت‌ها', href: '/admin/ai-ops/payments', iconName: 'CreditCard', module: 'payments' },
      { label: 'کمپین اینفلوئنسر', href: '/admin/ai-ops/campaigns', iconName: 'Megaphone', module: 'payments' },
      { label: 'کدهای تخفیف', href: '/admin/ai-ops/coupons', iconName: 'Ticket', module: 'coupons' },
    ],
  },
  {
    title: 'پشتیبانی و محتوا',
    items: [
      { label: 'تیکت‌ها', href: '/admin/ai-ops/tickets', iconName: 'Headphones', module: 'tickets' },
      { label: 'اعلان‌ها', href: '/admin/ai-ops/notifications', iconName: 'Bell', module: 'notifications' },
      { label: 'محتوا', href: '/admin/ai-ops/content', iconName: 'FileText', module: 'content' },
    ],
  },
  {
    title: 'سیستم',
    items: [
      { label: 'لاگ‌ها', href: '/admin/ai-ops/logs', iconName: 'ScrollText', module: 'logs' },
      { label: 'تنظیمات', href: '/admin/ai-ops/settings', iconName: 'Settings', module: 'settings' },
      { label: 'تیم و نقش‌ها', href: '/admin/ai-ops/team', iconName: 'ShieldCheck', module: 'team' },
      { label: 'امنیت', href: '/admin/ai-ops/security', iconName: 'Lock', module: 'security' },
    ],
  },
];
