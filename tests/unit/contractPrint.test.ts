import { describe, expect, it } from 'vitest';
import { buildContractPrintHtml } from '@/lib/contractPrint';
import type { ApiContract } from '@/lib/adminApi';

const sample: ApiContract = {
  id: 'c-1',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  contract_number: 'CNT-1403-001',
  client_id: null,
  client_name: 'شرکت نمونه',
  contract_type: 'website_design',
  amount: 50000000,
  start_date: '2026-01-01',
  end_date: '2026-06-01',
  signature_status: 'draft',
  payment_status: 'unpaid',
  scope_of_work: 'طراحی سایت',
  deliverables: ['صفحه اصلی'],
  payment_terms: '۵۰٪ پیش‌پرداخت',
  support_terms: null,
  project_id: null,
  notes: null,
};

describe('buildContractPrintHtml', () => {
  it('includes contract number and client', () => {
    const html = buildContractPrintHtml(sample);
    expect(html).toContain('CNT-1403-001');
    expect(html).toContain('شرکت نمونه');
    expect(html).toContain('dir="rtl"');
  });
});
