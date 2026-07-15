import Link from "next/link";
import {
  COMPANY_ADDRESS_FULL,
  COMPANY_DISPLAY_NAME,
  COMPANY_EMAIL,
  COMPANY_LEGAL_NAME,
  COMPANY_MAPS_URL,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL,
  COMPANY_SAME_AS,
} from "@/lib/companyIdentity";

export default function HomeCompanyIdentity() {
  return (
    <section id="company" className="border-t border-navy-100 bg-navy-50/40 py-14 sm:py-16">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
            اطلاعات تماس {COMPANY_DISPLAY_NAME}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-navy-500 sm:text-base">
            نام حقوقی مجموعه {COMPANY_LEGAL_NAME} است. برای مشاوره یا هماهنگی پروژه از راه‌های
            زیر با ما در ارتباط باشید.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-right sm:grid-cols-2">
          <a
            href={COMPANY_PHONE_TEL}
            className="rounded-[16px] border border-navy-100 bg-white px-5 py-4 transition hover:border-teal-200"
          >
            <p className="text-xs font-bold text-navy-400">تلفن</p>
            <p className="mt-1 text-base font-extrabold text-navy-900" dir="ltr">
              {COMPANY_PHONE_DISPLAY}
            </p>
          </a>
          <a
            href={`mailto:${COMPANY_EMAIL}`}
            className="rounded-[16px] border border-navy-100 bg-white px-5 py-4 transition hover:border-teal-200"
          >
            <p className="text-xs font-bold text-navy-400">ایمیل</p>
            <p className="mt-1 text-base font-extrabold text-navy-900" dir="ltr">
              {COMPANY_EMAIL}
            </p>
          </a>
          <a
            href={COMPANY_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[16px] border border-navy-100 bg-white px-5 py-4 transition hover:border-teal-200 sm:col-span-2"
          >
            <p className="text-xs font-bold text-navy-400">آدرس شرکت</p>
            <p className="mt-1 text-sm font-bold leading-relaxed text-navy-900">
              {COMPANY_ADDRESS_FULL}
            </p>
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <a
            href={COMPANY_SAME_AS[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-navy-600 hover:text-navy-900"
          >
            LinkedIn
          </a>
          <a
            href={COMPANY_SAME_AS[1]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-navy-600 hover:text-navy-900"
          >
            Instagram
          </a>
          <Link href="/about" className="font-bold text-teal-800 hover:text-teal-950">
            درباره آرایه
          </Link>
          <Link href="/contact" className="font-bold text-teal-800 hover:text-teal-950">
            صفحه تماس
          </Link>
        </div>
      </div>
    </section>
  );
}
