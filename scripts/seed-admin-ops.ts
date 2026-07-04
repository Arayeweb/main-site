/**
 * داده‌های نمونه برای ماژول‌های عملیاتی پنل ادمین
 *
 * استفاده:
 *   npx tsx scripts/seed-admin-ops.ts
 *
 * پیش‌نیاز: اجرای supabase/migrations/20250702_admin_ops.sql
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

import { getSupabaseAdmin } from '../lib/supabase';

const CLIENTS = [
  {
    name: 'سارا احمدی',
    client_type: 'clinic',
    phone: '09351234567',
    email: 'sara@arian.ir',
    address: 'خیابان ولیعصر، پلاک ۱۲۳',
    city: 'تهران',
    website: 'arian-clinic.ir',
    instagram: '@arian_clinic',
    lead_source: 'whatsapp',
    sales_owner: 'علی رضایی',
    project_owner: 'امیر رضایی',
    status: 'active_project',
    internal_note: 'مشتری حساس به زمان‌بندی. پیگیری هفتگی لازم است.',
    total_revenue: 32000000,
  },
  {
    name: 'بهروز صادقی',
    client_type: 'online_store',
    phone: '09131234567',
    email: 'behrooz@sadeghi.ir',
    city: 'اصفهان',
    website: 'sadeghi-home.ir',
    lead_source: 'karlanser',
    sales_owner: 'علی رضایی',
    project_owner: 'امیر رضایی',
    status: 'active_project',
    total_revenue: 56000000,
  },
  {
    name: 'دکتر رضا کاظمی',
    client_type: 'doctor',
    phone: '09121234567',
    email: 'dr.kazemi@clinic.ir',
    city: 'شیراز',
    lead_source: 'doctor_db',
    sales_owner: 'علی رضایی',
    project_owner: 'مریم نوری',
    status: 'active_support',
    total_revenue: 43200000,
  },
];

async function main() {
  const supabase = getSupabaseAdmin();

  const { count } = await supabase.from('crm_clients').select('*', { count: 'exact', head: true });
  if ((count ?? 0) > 0) {
    console.log('crm_clients already has data — skipping seed.');
    return;
  }

  const { data: insertedClients, error: clientErr } = await supabase
    .from('crm_clients')
    .insert(CLIENTS)
    .select('id, name');

  if (clientErr) {
    console.error('clients:', clientErr.message);
    process.exit(1);
  }

  const byName = Object.fromEntries((insertedClients ?? []).map((c) => [c.name, c.id]));
  const saraId = byName['سارا احمدی'];
  const behroozId = byName['بهروز صادقی'];
  const kazemiId = byName['دکتر رضا کاظمی'];

  const { error: taskErr } = await supabase.from('crm_tasks').insert([
    {
      title: 'طراحی صفحه اصلی کلینیک',
      description: 'طراحی UI صفحه اصلی با تاکید بر خدمات زیبایی و نوبت‌دهی آنلاین.',
      client_id: saraId,
      client_name: 'سارا احمدی',
      project_name: 'سایت کلینیک زیبایی آرین',
      assigned_to: 'نگار حیدری',
      priority: 'high',
      status: 'in_progress',
      due_date: '2025-07-15',
      checklist: [
        { id: 'c1', label: 'وایرفریم', done: true },
        { id: 'c2', label: 'طراحی دسکتاپ', done: true },
        { id: 'c3', label: 'طراحی موبایل', done: false },
      ],
    },
    {
      title: 'پیاده‌سازی درگاه پرداخت',
      client_id: behroozId,
      client_name: 'بهروز صادقی',
      project_name: 'سایت فروشگاهی لوازم خانگی',
      assigned_to: 'امیر رضایی',
      priority: 'urgent',
      status: 'waiting_client',
      due_date: '2025-07-20',
    },
  ]);
  if (taskErr) console.error('tasks:', taskErr.message);

  const { error: contractErr } = await supabase.from('crm_contracts').insert([
    {
      contract_number: 'CNT-1403-001',
      client_id: saraId,
      client_name: 'سارا احمدی',
      contract_type: 'website_design',
      amount: 32000000,
      start_date: '2025-05-22',
      end_date: '2025-08-06',
      signature_status: 'active',
      payment_status: 'partial',
      scope_of_work: 'طراحی و توسعه سایت کلینیک زیبایی با ۸ صفحه، پنل مدیریت و سئو پایه.',
      deliverables: ['طراحی UI/UX', 'توسعه فرانت‌اند', 'پنل مدیریت', 'سئو پایه', 'آموزش'],
      payment_terms: '۵۰٪ پیش‌پرداخت، ۳۰٪ میان‌پرداخت، ۲۰٪ تحویل نهایی',
      support_terms: '۳ ماه پشتیبانی رایگان پس از تحویل',
    },
    {
      contract_number: 'CNT-1403-002',
      client_id: behroozId,
      client_name: 'بهروز صادقی',
      contract_type: 'website_design',
      amount: 56000000,
      start_date: '2025-05-06',
      end_date: '2025-07-21',
      signature_status: 'active',
      payment_status: 'partial',
      scope_of_work: 'سایت فروشگاهی با درگاه پرداخت و پنل مدیریت محصولات.',
      deliverables: ['طراحی فروشگاه', 'درگاه پرداخت', 'پنل محصولات', 'آموزش'],
      payment_terms: '۴۰٪ پیش‌پرداخت، ۴۰٪ میان‌پرداخت، ۲۰٪ تحویل',
    },
    {
      contract_number: 'CNT-1403-005',
      client_id: kazemiId,
      client_name: 'دکتر رضا کاظمی',
      contract_type: 'maintenance',
      amount: 3600000,
      start_date: '2025-03-21',
      end_date: '2026-03-20',
      signature_status: 'active',
      payment_status: 'paid',
      scope_of_work: 'پشتیبانی ماهانه سایت پزشکی.',
      deliverables: ['پشتیبانی فنی', 'بروزرسانی امنیتی', 'پشتیبان تلفنی'],
      payment_terms: 'پرداخت ماهانه',
      support_terms: 'پاسخگویی حداکثر ۲۴ ساعت',
    },
  ]);
  if (contractErr) console.error('contracts:', contractErr.message);

  const { error: crErr } = await supabase.from('crm_change_requests').insert([
    {
      title: 'تغییر رنگ هدر سایت',
      client_id: saraId,
      client_name: 'سارا احمدی',
      project_name: 'سایت کلینیک زیبایی آرین',
      request_type: 'design_change',
      status: 'in_progress',
      assigned_to: 'نگار حیدری',
      included_in_contract: true,
      estimated_time: '۲ ساعت',
      customer_approval: 'approved',
    },
    {
      title: 'افزودن صفحه گالری قبل/بعد',
      description: 'صفحه گالری با فیلتر خدمات و مقایسه قبل/بعد',
      client_id: saraId,
      client_name: 'سارا احمدی',
      project_name: 'سایت کلینیک زیبایی آرین',
      request_type: 'add_page',
      status: 'needs_client_approval',
      cost: 2500000,
      estimated_cost: 2500000,
      is_paid: true,
      estimated_time: '۳ روز',
      customer_approval: 'pending',
    },
    {
      title: 'افزودن فیلتر محصولات',
      client_id: behroozId,
      client_name: 'بهروز صادقی',
      project_name: 'سایت فروشگاهی لوازم خانگی',
      request_type: 'add_feature',
      status: 'reviewing',
      cost: 4500000,
      estimated_cost: 4500000,
      is_paid: true,
      assigned_to: 'امیر رضایی',
      estimated_time: '۵ روز',
      customer_approval: 'pending',
    },
  ]);
  if (crErr) console.error('change_requests:', crErr.message);

  const { error: maintErr } = await supabase.from('crm_maintenance_plans').insert([
    {
      client_id: kazemiId,
      client_name: 'دکتر رضا کاظمی',
      plan_type: 'pro_support',
      monthly_fee: 3000000,
      start_date: '2025-03-21',
      renewal_date: '2025-07-21',
      payment_status: 'paid',
      support_status: 'active',
      included_services: ['پشتیبانی فنی', 'بروزرسانی امنیتی', 'پشتیبان تلفنی'],
      upsell_opportunities: ['SEO ماهانه', 'چت‌بات AI'],
    },
    {
      client_id: saraId,
      client_name: 'سارا احمدی',
      plan_type: 'basic_support',
      monthly_fee: 1500000,
      start_date: '2025-08-06',
      renewal_date: '2025-09-06',
      payment_status: 'pending',
      support_status: 'pending_payment',
      included_services: ['رفع باگ', 'بروزرسانی جزئی'],
    },
  ]);
  if (maintErr) console.error('maintenance:', maintErr.message);

  console.log('✓ Admin ops seed complete:', insertedClients?.length, 'clients');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
