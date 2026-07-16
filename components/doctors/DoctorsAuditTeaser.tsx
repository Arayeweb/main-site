import Link from "next/link";
import { IconArrowLeft } from "@/components/icons";

export default function DoctorsAuditTeaser() {
  return (
    <section className="section-py border-t border-navy-100/80">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-xl rounded-2xl border border-navy-100 bg-white px-6 py-8 text-center shadow-soft">
          <p className="text-sm text-navy-500">از قبل سایت دارید ولی نتیجه نمی‌گیرید؟</p>
          <Link
            href="/doctors/audit"
            className="mt-3 inline-flex items-center gap-1.5 text-base font-extrabold text-sky-700 transition-colors hover:text-sky-800"
          >
            درخواست بررسی مسیر نوبت
            <IconArrowLeft size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
