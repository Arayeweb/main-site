import type { ApiContract } from '@/lib/adminApi';
import { DEFAULT_COMPANY_SETTINGS } from '@/lib/adminTypes';
import { formatFaDate } from '@/lib/adminMappers';
import { formatCurrency } from '@/lib/utils';
import { CONTRACT_TYPE_LABELS, CONTRACT_STATUS_LABELS } from '@/lib/adminTypes';

function esc(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildContractPrintHtml(contract: ApiContract): string {
  const deliverables = Array.isArray(contract.deliverables) ? contract.deliverables : [];
  const deliverablesHtml = deliverables.length
    ? `<ul>${deliverables.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`
    : '<p>—</p>';

  return `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"/>` +
    `<title>قرارداد ${esc(contract.contract_number)}</title>` +
    `<style>` +
    `@font-face{font-family:'Vazirmatn';src:url('/assets/fonts/Vazirmatn-Regular.woff2') format('woff2');font-weight:400}` +
    `body{font-family:'Vazirmatn',Tahoma,sans-serif;font-size:13px;color:#1a1a1a;padding:32px 36px;direction:rtl}` +
    `h1{font-size:20px;margin-bottom:8px;color:#0E1A2B}` +
    `.meta{font-size:12px;color:#555;margin-bottom:20px}` +
    `.section{margin-bottom:20px;padding:16px;background:#f6f8fa;border-radius:8px}` +
    `.section h2{font-size:12px;color:#2E7D6B;margin-bottom:8px}` +
    `</style></head><body>` +
    `<div style="border-bottom:2.5px solid #2E7D6B;padding-bottom:16px;margin-bottom:24px">` +
    `<img src="/assets/logo-icon.svg" width="40" height="40" alt="logo" />` +
    `<h1>قرارداد ${esc(contract.contract_number)}</h1>` +
    `<div class="meta">` +
    `<div><b>مشتری:</b> ${esc(contract.client_name)}</div>` +
    `<div><b>نوع:</b> ${esc(CONTRACT_TYPE_LABELS[contract.contract_type] ?? contract.contract_type)}</div>` +
    `<div><b>مبلغ:</b> ${esc(formatCurrency(Number(contract.amount) || 0))}</div>` +
    `<div><b>وضعیت:</b> ${esc(CONTRACT_STATUS_LABELS[contract.signature_status] ?? contract.signature_status)}</div>` +
    `<div><b>شروع:</b> ${esc(formatFaDate(contract.start_date))} · <b>پایان:</b> ${esc(formatFaDate(contract.end_date))}</div>` +
    `</div></div>` +
    `<div class="section"><h2>شرح کار</h2><p>${esc(contract.scope_of_work || '—')}</p></div>` +
    `<div class="section"><h2>تحویل‌دادنی‌ها</h2>${deliverablesHtml}</div>` +
    `<div class="section"><h2>شرایط پرداخت</h2><p>${esc(contract.payment_terms || DEFAULT_COMPANY_SETTINGS.invoice.defaultPaymentTerms)}</p></div>` +
    (contract.support_terms ? `<div class="section"><h2>شرایط پشتیبانی</h2><p>${esc(contract.support_terms)}</p></div>` : '') +
    (contract.notes ? `<div class="section"><h2>یادداشت</h2><p>${esc(contract.notes)}</p></div>` : '') +
    `</body></html>`;
}

export function printContract(contract: ApiContract): void {
  try {
    const html = buildContractPrintHtml(contract);
    const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!win) {
      alert('پنجره چاپ باز نشد. لطفاً popup blocker را غیرفعال کنید.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.onload = () => win.print();
  } catch {
    alert('خطا در ساخت فایل PDF قرارداد');
  }
}
