// Types and Persian labels for admin panel (no mock data)

export type ActivityType =
  | 'new_lead'
  | 'proposal_sent'
  | 'payment_received'
  | 'new_ticket'
  | 'project_stage'
  | 'contract_signed'
  | 'client_added';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  user: string;
}

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  new_lead: 'bg-blue-500',
  proposal_sent: 'bg-violet-500',
  payment_received: 'bg-green-500',
  new_ticket: 'bg-red-500',
  project_stage: 'bg-amber-500',
  contract_signed: 'bg-teal-500',
  client_added: 'bg-indigo-500',
};

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  doctor: 'پزشک',
  clinic: 'کلینیک',
  service_company: 'شرکت خدماتی',
  online_store: 'فروشگاه آنلاین',
  art_brand: 'برند هنری',
  startup: 'استارتاپ',
  b2b: 'کسب‌وکار B2B',
  other: 'سایر',
};

export const CLIENT_STATUS_LABELS: Record<string, string> = {
  lead: 'لید',
  active_client: 'مشتری فعال',
  active_project: 'پروژه فعال',
  active_support: 'پشتیبانی فعال',
  inactive: 'غیرفعال',
  lost: 'از دست رفته',
  active: 'فعال',
  completed: 'تکمیل‌شده',
  paused: 'متوقف',
};

export const CLIENT_STATUS_COLORS: Record<string, string> = {
  lead: 'bg-blue-50 text-blue-700 ring-blue-200',
  active_client: 'bg-green-50 text-green-700 ring-green-200',
  active_project: 'bg-violet-50 text-violet-700 ring-violet-200',
  active_support: 'bg-teal-50 text-teal-700 ring-teal-200',
  inactive: 'bg-slate-50 text-slate-600 ring-slate-200',
  lost: 'bg-red-50 text-red-700 ring-red-200',
  active: 'bg-green-50 text-green-700 ring-green-200',
  completed: 'bg-slate-50 text-slate-600 ring-slate-200',
  paused: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: 'انجام نشده',
  in_progress: 'در حال انجام',
  waiting_client: 'منتظر مشتری',
  needs_review: 'نیاز به بررسی',
  done: 'انجام‌شده',
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  todo: 'bg-slate-50 text-slate-600 ring-slate-200',
  in_progress: 'bg-blue-50 text-blue-700 ring-blue-200',
  waiting_client: 'bg-amber-50 text-amber-700 ring-amber-200',
  needs_review: 'bg-violet-50 text-violet-700 ring-violet-200',
  done: 'bg-green-50 text-green-700 ring-green-200',
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  urgent: 'فوری',
  high: 'بالا',
  medium: 'متوسط',
  low: 'پایین',
};

export const TASK_PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-50 text-red-700 ring-red-200',
  high: 'bg-orange-50 text-orange-700 ring-orange-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  low: 'bg-slate-50 text-slate-600 ring-slate-200',
};

export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  website_design: 'طراحی سایت',
  custom_software: 'توسعه نرم‌افزار اختصاصی',
  maintenance: 'پشتیبانی و نگهداری',
  seo: 'SEO',
  ai_chatbot: 'چت‌بات AI',
  crm_dashboard: 'CRM و داشبورد',
  feature_development: 'توسعه امکانات جدید',
};

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  draft: 'پیش‌نویس',
  sent: 'ارسال‌شده',
  awaiting_signature: 'در انتظار امضا',
  signed: 'امضاشده',
  active: 'فعال',
  completed: 'پایان‌یافته',
  cancelled: 'لغوشده',
};

export const CONTRACT_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-50 text-slate-600 ring-slate-200',
  sent: 'bg-blue-50 text-blue-700 ring-blue-200',
  awaiting_signature: 'bg-amber-50 text-amber-700 ring-amber-200',
  signed: 'bg-teal-50 text-teal-700 ring-teal-200',
  active: 'bg-green-50 text-green-700 ring-green-200',
  completed: 'bg-violet-50 text-violet-700 ring-violet-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
};

export const CONTRACT_PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: 'پرداخت‌نشده',
  partial: 'پرداخت جزئی',
  paid: 'پرداخت‌شده',
  overdue: 'معوقه',
};

export const CONTRACT_PAYMENT_STATUS_COLORS: Record<string, string> = {
  unpaid: 'bg-amber-50 text-amber-700 ring-amber-200',
  partial: 'bg-blue-50 text-blue-700 ring-blue-200',
  paid: 'bg-green-50 text-green-700 ring-green-200',
  overdue: 'bg-red-50 text-red-700 ring-red-200',
};

export const CHANGE_REQUEST_TYPE_LABELS: Record<string, string> = {
  text_change: 'تغییر متن',
  design_change: 'تغییر طراحی',
  add_page: 'افزودن صفحه',
  add_feature: 'افزودن قابلیت',
  bug_fix: 'اصلاح باگ',
  form_change: 'تغییر فرم',
  seo_change: 'تغییر SEO',
  other: 'سایر',
};

export const CHANGE_REQUEST_STATUS_LABELS: Record<string, string> = {
  new: 'جدید',
  reviewing: 'در حال بررسی',
  needs_client_approval: 'نیازمند تایید مشتری',
  approved: 'تاییدشده',
  in_progress: 'در حال انجام',
  done: 'انجام‌شده',
  rejected: 'ردشده',
};

export const CHANGE_REQUEST_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-200',
  reviewing: 'bg-violet-50 text-violet-700 ring-violet-200',
  needs_client_approval: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-teal-50 text-teal-700 ring-teal-200',
  in_progress: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  done: 'bg-green-50 text-green-700 ring-green-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
};

export const PLAN_TYPE_LABELS: Record<string, string> = {
  basic_support: 'پشتیبانی پایه',
  pro_support: 'پشتیبانی حرفه‌ای',
  monthly_seo: 'SEO ماهانه',
  monthly_ai: 'AI ماهانه',
  monthly_crm: 'CRM ماهانه',
  custom: 'اختصاصی',
};

export const PLAN_STATUS_LABELS: Record<string, string> = {
  active: 'فعال',
  pending_payment: 'در انتظار پرداخت',
  expired: 'منقضی‌شده',
  cancelled: 'لغوشده',
};

export const PLAN_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-50 text-green-700 ring-green-200',
  pending_payment: 'bg-amber-50 text-amber-700 ring-amber-200',
  expired: 'bg-red-50 text-red-700 ring-red-200',
  cancelled: 'bg-slate-50 text-slate-600 ring-slate-200',
};

export const MAINTENANCE_PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'پرداخت‌شده',
  pending: 'در انتظار',
  overdue: 'معوقه',
};

export const MAINTENANCE_PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-50 text-green-700 ring-green-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  overdue: 'bg-red-50 text-red-700 ring-red-200',
};

export const CAMPAIGN_CHANNEL_LABELS: Record<string, string> = {
  doctor_sales: 'فروش دستی پزشکان',
  whatsapp: 'واتساپ',
  direct_call: 'تماس مستقیم',
  instagram: 'اینستاگرام',
  google_ads: 'گوگل ادز',
  karlanser: 'کارلنسر',
  ponisha: 'پونیشا',
  referral: 'معرفی',
  seo: 'SEO',
  other: 'سایر',
};

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  active: 'فعال',
  paused: 'متوقف‌شده',
  completed: 'تمام‌شده',
  testing: 'در حال تست',
};

export const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-50 text-green-700 ring-green-200',
  paused: 'bg-amber-50 text-amber-700 ring-amber-200',
  completed: 'bg-slate-50 text-slate-600 ring-slate-200',
  testing: 'bg-blue-50 text-blue-700 ring-blue-200',
};

export const LEAD_SOURCE_KEY_LABELS: Record<string, string> = {
  site_form: 'فرم سایت',
  multistep_form: 'فرم چندمرحله‌ای',
  hero_form: 'فرم هیرو',
  chatbot: 'چت‌بات',
  direct_call: 'تماس مستقیم',
  whatsapp: 'واتساپ',
  instagram: 'اینستاگرام',
  google_ads: 'گوگل ادز',
  karlanser: 'کارلنسر',
  ponisha: 'پونیشا',
  doctor_db: 'دیتابیس پزشکان',
  referral: 'معرفی',
  manual_entry: 'ثبت دستی',
  other: 'سایر',
};

export const DEFAULT_COMPANY_SETTINGS = {
  company: {
    brandName: 'آرایه',
    legalName: 'شرکت هوش آرایه پارس',
    registrationNumber: '',
    nationalId: '',
    address: 'تهران، خیابان کارگر شمالی، خیابان فرشی مقدم (۱۶)، پارک علم و فناوری دانشگاه تهران',
    phone: '۰۹۹۹۱۳۰۰۷۸۸',
    email: 'support@araaye.com',
    website: 'https://araaye.com',
  },
  bank: {
    accountHolder: '',
    accountNumber: '',
    iban: '',
    bankName: '',
  },
  invoice: {
    invoicePrefix: 'INV',
    proformaPrefix: 'PRO',
    defaultPaymentTerms: 'پرداخت ظرف ۷ روز کاری از تاریخ صدور فاکتور',
    defaultDescription: 'بابت خدمات طراحی و توسعه نرم‌افزار',
    defaultTax: 0,
    proformaValidityDays: 14,
  },
  defaults: {
    projectStatuses: ['نیازسنجی', 'منتظر محتوا', 'طراحی UI', 'توسعه', 'تست', 'آماده تحویل', 'تحویل‌شده', 'پشتیبانی', 'متوقف‌شده'],
    taskStatuses: ['انجام نشده', 'در حال انجام', 'منتظر مشتری', 'نیاز به بررسی', 'انجام‌شده'],
    leadStatuses: ['جدید', 'تماس گرفته شد', 'علاقه‌مند', 'پیشنهاد ارسال شد', 'برنده', 'از دست رفته'],
  },
  roles: [
    { role: 'manager', label: 'مدیر', description: 'دسترسی کامل به تمام ماژول‌ها', count: 0 },
    { role: 'sales', label: 'فروش', description: 'لیدها، پیشنهادها و قراردادها', count: 0 },
    { role: 'support', label: 'پشتیبانی', description: 'تیکت‌ها و درخواست‌های تغییر', count: 0 },
    { role: 'developer', label: 'توسعه‌دهنده', description: 'پروژه‌ها و تسک‌ها', count: 0 },
    { role: 'finance', label: 'مالی', description: 'فاکتورها و پرداخت‌ها', count: 0 },
    { role: 'content', label: 'محتوا', description: 'محتوا و سئو', count: 0 },
  ],
};
