import { DEFAULT_COMPANY_SETTINGS } from '@/lib/adminTypes';
import type { ApiInvoice } from '@/lib/adminApi';

export const INVOICE_KIND_LABELS: Record<string, string> = {
  invoice: 'فاکتور',
  proforma: 'پیش‌فاکتور',
};

export const INVOICE_STATUS_PRINT_LABELS: Record<string, string> = {
  draft: 'پیش‌نویس',
  sent: 'ارسال‌شده',
  paid: 'پرداخت‌شده',
  cancelled: 'لغو شده',
};

export interface InvoicePrintCompany {
  brandName: string;
  legalName: string;
  website: string;
  address?: string;
  phone?: string;
  email?: string;
}

function esc(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toFa(value: string): string {
  return value.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return toFa(new Date(iso).toLocaleDateString('fa-IR'));
  } catch {
    return '—';
  }
}

function fmtMoney(amount: number | null | undefined, currency = 'IRR'): string {
  const n = Number(amount) || 0;
  const formatted = toFa(new Intl.NumberFormat('fa-IR').format(n));
  return currency === 'IRR' ? `${formatted} تومان` : `${formatted} ${currency}`;
}

function rowTotal(item: { qty?: number; unit_price?: number; discount?: number; tax?: number }): number {
  const base = (Number(item.qty) || 0) * (Number(item.unit_price) || 0);
  const disc = Math.round(base * ((Number(item.discount) || 0) / 100));
  const afterDisc = base - disc;
  const tax = Math.round(afterDisc * ((Number(item.tax) || 0) / 100));
  return afterDisc + tax;
}

export function buildInvoicePrintHtml(
  inv: ApiInvoice,
  company: InvoicePrintCompany = {
    brandName: DEFAULT_COMPANY_SETTINGS.company.brandName,
    legalName: DEFAULT_COMPANY_SETTINGS.company.legalName,
    website: DEFAULT_COMPANY_SETTINGS.company.website,
    address: DEFAULT_COMPANY_SETTINGS.company.address,
    phone: DEFAULT_COMPANY_SETTINGS.company.phone,
    email: DEFAULT_COMPANY_SETTINGS.company.email,
  }
): string {
  const cur = inv.currency || 'IRR';
  const items = Array.isArray(inv.items) ? inv.items : [];
  const kindLabel = INVOICE_KIND_LABELS[inv.kind] || 'سند';
  const statusLabel = INVOICE_STATUS_PRINT_LABELS[inv.status] || inv.status;

  const itemsHtml = items
    .map((it, i) => {
      const total = rowTotal(it);
      const discount = Number(it.discount) || 0;
      const tax = Number(it.tax) || 0;
      return (
        '<tr>' +
        `<td>${toFa(String(i + 1))}</td>` +
        `<td>${esc(it.title)}</td>` +
        `<td>${toFa(String(Number(it.qty) || 1))}</td>` +
        `<td>${fmtMoney(it.unit_price, cur)}</td>` +
        `<td>${discount ? `${toFa(String(discount))}٪` : '—'}</td>` +
        `<td>${tax ? `${toFa(String(tax))}٪` : '—'}</td>` +
        `<td>${fmtMoney(total, cur)}</td>` +
        '</tr>'
      );
    })
    .join('');

  const issuerLines = [
    company.legalName || company.brandName,
    company.website,
    company.phone,
    company.email,
    company.address,
  ].filter(Boolean);

  return `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"/>` +
    `<title>${esc(kindLabel)} ${esc(inv.invoice_number)}</title>` +
    `<style>` +
    `@font-face{font-family:'Vazirmatn';src:url('/assets/fonts/Vazirmatn-Regular.woff2') format('woff2');font-weight:400}` +
    `@font-face{font-family:'Vazirmatn';src:url('/assets/fonts/Vazirmatn-Bold.woff2') format('woff2');font-weight:700}` +
    `@font-face{font-family:'Vazirmatn';src:url('/assets/fonts/Vazirmatn-ExtraBold.woff2') format('woff2');font-weight:800}` +
    `*{box-sizing:border-box;margin:0;padding:0}` +
    `body{font-family:'Vazirmatn',Tahoma,sans-serif;font-size:13px;color:#1a1a1a;background:#fff;padding:32px 36px;direction:rtl}` +
    `.inv-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2.5px solid #2E7D6B;padding-bottom:18px;margin-bottom:24px}` +
    `.inv-brand{display:flex;flex-direction:column;align-items:flex-start;font-size:16px;font-weight:800;color:#1a1a1a;letter-spacing:.01em}` +
    `.inv-brand small{display:block;font-size:11px;font-weight:400;color:#888;margin-top:2px}` +
    `.inv-meta{text-align:left}` +
    `.inv-meta h1{font-size:18px;font-weight:800;color:#0E1A2B;margin-bottom:8px}` +
    `.inv-meta-row{font-size:12px;color:#555;margin-bottom:4px}` +
    `.inv-meta-row b{color:#1a1a1a}` +
    `.inv-parties{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;padding:16px 18px;background:#f6f8fa;border-radius:8px}` +
    `.inv-party-label{font-size:10px;font-weight:800;color:#2E7D6B;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}` +
    `.inv-party-name{font-size:15px;font-weight:700;margin-bottom:4px}` +
    `.inv-party-sub{font-size:12px;color:#666}` +
    `table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12.5px}` +
    `thead tr{background:#0E1A2B;color:#fff}` +
    `thead th{padding:9px 10px;text-align:right;font-weight:700;white-space:nowrap}` +
    `tbody tr:nth-child(even){background:#f6f8fa}` +
    `tbody td{padding:8px 10px;border-bottom:1px solid #e2e8ee}` +
    `.totals-section{display:flex;flex-direction:column;align-items:flex-end;gap:5px;margin-bottom:24px}` +
    `.totals-row{display:flex;gap:32px;font-size:13px}` +
    `.totals-row span:first-child{color:#666;min-width:110px;text-align:right}` +
    `.totals-row span:last-child{font-weight:700;min-width:120px;text-align:left;font-variant-numeric:tabular-nums}` +
    `.totals-grand{font-size:15px;font-weight:800;color:#2E7D6B;border-top:2px solid #2E7D6B;padding-top:8px;margin-top:4px}` +
    `.inv-footer{border-top:1px solid #e2e8ee;padding-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px}` +
    `.inv-footer-label{font-size:10px;font-weight:800;color:#2E7D6B;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}` +
    `.inv-footer-val{font-size:12px;color:#444;line-height:1.7;white-space:pre-wrap}` +
    `.inv-sig{border:1px dashed #ccc;border-radius:6px;height:60px;margin-top:10px;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:11px}` +
    `.status-badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;background:#e8f5f2;color:#2E7D6B;margin-right:8px}` +
    `@media print{body{padding:20px 24px}}` +
    `</style></head><body>` +
    `<div class="inv-header">` +
      `<div class="inv-brand">` +
        `<img src="/assets/logo-icon.svg" width="48" height="48" alt="logo" style="display:block;margin-bottom:6px" />` +
        `${esc(company.brandName)}<small>${esc(company.website)}</small>` +
      `</div>` +
      `<div class="inv-meta">` +
        `<h1>${esc(kindLabel)} <span class="status-badge">${esc(statusLabel)}</span></h1>` +
        `<div class="inv-meta-row"><b>شماره سند:</b> ${esc(inv.invoice_number)}</div>` +
        `<div class="inv-meta-row"><b>تاریخ صدور:</b> ${fmtDate(inv.issue_date)}</div>` +
        (inv.due_date ? `<div class="inv-meta-row"><b>تاریخ سررسید:</b> ${fmtDate(inv.due_date)}</div>` : '') +
      `</div>` +
    `</div>` +
    `<div class="inv-parties">` +
      `<div><div class="inv-party-label">صادرکننده</div>` +
        issuerLines.map((line, idx) =>
          idx === 0
            ? `<div class="inv-party-name">${esc(line)}</div>`
            : `<div class="inv-party-sub">${esc(line)}</div>`
        ).join('') +
      `</div>` +
      `<div><div class="inv-party-label">مشتری</div>` +
        `<div class="inv-party-name">${esc(inv.customer_name)}</div>` +
        (inv.customer_contact ? `<div class="inv-party-sub">${esc(inv.customer_contact)}</div>` : '') +
        (inv.customer_address ? `<div class="inv-party-sub">${esc(inv.customer_address)}</div>` : '') +
      `</div>` +
    `</div>` +
    `<table><thead><tr>` +
      `<th>#</th><th>شرح خدمت / کالا</th><th>تعداد</th><th>قیمت واحد</th><th>تخفیف</th><th>مالیات</th><th>جمع ردیف</th>` +
    `</tr></thead><tbody>${itemsHtml || '<tr><td colspan="7" style="text-align:center;color:#888">ردیفی ثبت نشده</td></tr>'}</tbody></table>` +
    `<div class="totals-section">` +
      `<div class="totals-row"><span>جمع کل:</span><span>${fmtMoney(inv.subtotal, cur)}</span></div>` +
      `<div class="totals-row"><span>تخفیف:</span><span>${fmtMoney(inv.discount_total, cur)}</span></div>` +
      `<div class="totals-row"><span>مالیات:</span><span>${fmtMoney(inv.tax_total, cur)}</span></div>` +
      `<div class="totals-row totals-grand"><span>مبلغ قابل پرداخت:</span><span>${fmtMoney(inv.grand_total, cur)}</span></div>` +
    `</div>` +
    `<div class="inv-footer">` +
      `<div><div class="inv-footer-label">توضیحات</div><div class="inv-footer-val">${esc(inv.note || '—')}</div></div>` +
      `<div><div class="inv-footer-label">شرایط و مقررات</div><div class="inv-footer-val">${esc(inv.terms || DEFAULT_COMPANY_SETTINGS.invoice.defaultPaymentTerms)}</div>` +
        `<div class="inv-sig">امضا و مهر</div></div>` +
    `</div>` +
    `</body></html>`;
}

export function invoicePrintHref(basePath: string, invoiceId: string): string {
  return `${basePath.replace(/\/$/, '')}/${invoiceId}/print`;
}

export function downloadInvoiceAsHtml(inv: ApiInvoice, company?: InvoicePrintCompany): void {
  const html = buildInvoicePrintHtml(inv, company);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${inv.invoice_number || 'invoice'}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** @deprecated Use invoice print page route instead of popup */
export function printInvoice(inv: ApiInvoice, company?: InvoicePrintCompany): void {
  downloadInvoiceAsHtml(inv, company);
}

export function companyFromSettings(settings: Record<string, unknown> | undefined): InvoicePrintCompany {
  const company = (settings?.company as Record<string, string> | undefined) ?? DEFAULT_COMPANY_SETTINGS.company;
  return {
    brandName: company.brandName || DEFAULT_COMPANY_SETTINGS.company.brandName,
    legalName: company.legalName || DEFAULT_COMPANY_SETTINGS.company.legalName,
    website: company.website || DEFAULT_COMPANY_SETTINGS.company.website,
    address: company.address,
    phone: company.phone,
    email: company.email,
  };
}

export async function printInvoiceById(
  invoiceId: string,
  invoice?: ApiInvoice,
  printBasePath?: string
): Promise<boolean> {
  if (printBasePath && typeof window !== 'undefined') {
    window.location.assign(invoicePrintHref(printBasePath, invoiceId));
    return true;
  }

  const { fetchInvoiceById, fetchCompanySettings } = await import('@/lib/adminApi');
  const invoiceRes = invoice
    ? { ok: true as const, data: { invoice } }
    : await fetchInvoiceById(invoiceId);
  if (!invoiceRes.ok || !invoiceRes.data.invoice) return false;

  const settingsRes = await fetchCompanySettings();
  const company = settingsRes.ok ? companyFromSettings(settingsRes.data.settings) : undefined;
  downloadInvoiceAsHtml(invoiceRes.data.invoice, company);
  return true;
}
