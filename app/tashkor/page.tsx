import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconCheck, IconArrowLeft, IconPhone } from "@/components/icons";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/siteContact";

export const metadata: Metadata = {
  title: "درخواست شما ثبت شد | آرایه",
  description: "درخواست شما با موفقیت ثبت شد. کارشناسان آرایه به زودی با شما تماس می‌گیرند.",
  robots: { index: false, follow: false },
};

export default function TashkorPage({
  searchParams,
}: {
  searchParams?: { from?: string };
}) {
  const fromAudit =
    searchParams?.from === "doctors_audit" || searchParams?.from === "doctors_hero";

  return (
    <>
      <Navbar ctaHref="/doctors#audit" ctaLabel="بررسی رایگان مطب" />
      <main className="min-h-[70vh] bg-gradient-to-b from-sky-50/70 via-white to-white py-16 sm:py-24">
        <div className="container-mx container-px">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sky-600 text-white shadow-soft">
              <IconCheck size={32} />
            </div>

            <h1 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">درخواست شما ثبت شد</h1>
            <p className="mt-4 text-base leading-relaxed text-navy-500">
              {fromAudit
                ? "سه ایراد مهم و پیشنهادهای عملی را تا پایان روز کاری در واتساپ می‌فرستیم."
                : "کارشناس آرایه در کمتر از ۲ ساعت کاری با شما تماس می‌گیرد."}
            </p>

            <div className="mt-8 rounded-2xl border border-sky-100 bg-white p-5 shadow-card text-right">
              <p className="text-sm font-medium text-navy-700">قدم بعدی چیست؟</p>
              <ul className="mt-3 space-y-2 text-sm text-navy-500">
                <li className="flex items-start gap-2">
                  <IconCheck size={16} className="mt-0.5 shrink-0 text-sky-600" />
                  <span>
                    {fromAudit
                      ? "گزارش بررسی مطب را در واتساپ دریافت می‌کنید."
                      : "کارشناس ما بر اساس نیازتان پیشنهاد مناسب را آماده می‌کند."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheck size={16} className="mt-0.5 shrink-0 text-sky-600" />
                  <span>می‌توانید همین حالا نمونه سایت مطب را ببینید.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98]"
              >
                مشاهده نمونه سایت مطب
                <IconArrowLeft size={16} />
              </Link>
              <a
                href={SITE_PHONE_TEL}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-6 py-3 text-sm font-bold text-navy-700 transition-colors hover:border-sky-300 hover:text-sky-700"
              >
                <IconPhone size={16} />
                {SITE_PHONE_DISPLAY}
              </a>
            </div>

            <Link
              href="/doctors"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-navy-400 transition-colors hover:text-sky-700"
            >
              بازگشت به صفحه پزشکان
              <IconArrowLeft size={14} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
