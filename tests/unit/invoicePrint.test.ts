import { describe, expect, it } from 'vitest';
import { buildInvoicePrintHtml } from '@/lib/invoicePrint';
import type { ApiInvoice } from '@/lib/adminApi';

const sampleInvoice: ApiInvoice = {
  id: 'inv-1',
  invoice_number: 'PRO-1001',
  kind: 'proforma',
  status: 'sent',
  issue_date: '2026-07-01',
  due_date: '2026-07-15',
  customer_name: 'شرکت نمونه',
  customer_contact: '09121234567',
  customer_address: 'تهران',
  subtotal: 10000000,
  discount_total: 0,
  tax_total: 0,
  grand_total: 10000000,
  currency: 'IRR',
  created_at: '2026-07-01T00:00:00.000Z',
  paid_at: null,
  note: 'پیش‌فاکتور تست',
  terms: 'پرداخت ظرف ۷ روز',
  items: [{ title: 'طراحی سایت', qty: 1, unit_price: 10000000 }],
};

describe('buildInvoicePrintHtml', () => {
  it('renders invoice number and customer in printable HTML', () => {
    const html = buildInvoicePrintHtml(sampleInvoice);
    expect(html).toContain('PRO-1001');
    expect(html).toContain('شرکت نمونه');
    expect(html).toContain('طراحی سایت');
    expect(html).toContain('پیش‌فاکتور');
    expect(html).toContain('dir="rtl"');
  });
});
