'use client';

import { useMemo, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Printer } from 'lucide-react';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { fetchCompanySettings, fetchInvoiceById } from '@/lib/adminApi';
import { buildInvoicePrintHtml, companyFromSettings, downloadInvoiceAsHtml } from '@/lib/invoicePrint';

interface InvoicePrintViewProps {
  id: string;
  backHref: string;
  panelLabel: string;
}

export function InvoicePrintView({ id, backHref, panelLabel }: InvoicePrintViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { data, loading, error } = useAdminFetch(() => fetchInvoiceById(id), [id]);
  const { data: settingsData } = useAdminFetch(() => fetchCompanySettings(), []);

  const invoice = data?.invoice ?? null;
  const company = settingsData?.settings ? companyFromSettings(settingsData.settings) : undefined;

  const html = useMemo(() => {
    if (!invoice) return '';
    return buildInvoicePrintHtml(invoice, company);
  }, [invoice, company]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;
  if (!invoice) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>فاکتور یافت نشد</p>
        <Link href={backHref} className="text-blue-600 text-sm mt-2 inline-block">
          بازگشت
        </Link>
      </div>
    );
  }

  function handlePrint() {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.focus();
    frame.contentWindow.print();
  }

  function handleDownload() {
    downloadInvoiceAsHtml(invoice!, company);
  }

  return (
    <div className="flex flex-col gap-4 min-h-[80vh]" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3">
        <div>
          <p className="text-xs text-slate-400">{panelLabel} · پیش‌نمایش فاکتور</p>
          <h1 className="text-lg font-bold text-slate-900">{invoice.invoice_number}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            <Printer className="w-4 h-4" />
            چاپ / ذخیره PDF
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            دانلود HTML
          </button>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 px-3 py-2"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        </div>
      </div>

      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex-1">
        <iframe
          ref={iframeRef}
          title={`فاکتور ${invoice.invoice_number}`}
          srcDoc={html}
          className="w-full min-h-[900px] bg-white rounded-lg border border-slate-200 shadow-sm"
        />
      </div>
    </div>
  );
}
