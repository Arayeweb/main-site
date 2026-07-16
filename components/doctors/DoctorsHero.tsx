import type { ReactNode } from "react";
import PourdastClinicHomePreview from "@/components/home/previews/PourdastClinicHomePreview";
import { BrowserChrome, PhoneFrame } from "@/components/showcase/ShowcaseFrames";
import {
  DOCTORS_LAUNCH_NOTE,
  DOCTORS_PRODUCT_PRICE_TOMAN,
  formatToman,
} from "@/lib/doctorsData";

function HeroMockup() {
  return (
    <div className="relative mx-auto max-w-md lg:max-w-none">
      <div className="hidden sm:block">
        <BrowserChrome url="aliehpourdast.com">
          <PourdastClinicHomePreview />
        </BrowserChrome>
      </div>
      <div className="mt-0 sm:absolute sm:-bottom-6 sm:left-0 sm:mt-0 sm:w-[42%]">
        <PhoneFrame>
          <div className="aspect-[9/16] overflow-hidden">
            <PourdastClinicHomePreview />
          </div>
        </PhoneFrame>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-navy-400 sm:mt-14">
        نمونه خروجی — سایت مطب
      </p>
    </div>
  );
}

type DoctorsHeroProps = {
  badge?: string;
  title?: string;
  subtitle?: string;
  priceNote?: string;
  mockup?: ReactNode;
};

export default function DoctorsHero({
  badge = "طراحی سایت ویژه پزشکان و کلینیک‌ها",
  title = "سایت اختصاصی مطب شما؛ آماده معرفی خدمات و دریافت درخواست نوبت",
  subtitle = "نسخه اول در ۲ روز کاری، همراه با صفحات خدمات، پنل انتشار مقاله، اتصال به واتساپ یا سامانه نوبت و زیرساخت فنی سئو. مالکیت دامنه و سایت کاملاً برای شماست.",
  priceNote,
  mockup,
}: DoctorsHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-navy-100/80 bg-gradient-to-b from-sky-50/80 via-white to-white pb-12 pt-8 sm:pb-16 sm:pt-12">
      <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 h-64 w-64 rounded-full bg-cyan-200/25 blur-3xl" />

      <div className="container-mx container-px relative">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="text-right">
            <span className="badge mb-5 bg-sky-50 text-sky-700 ring-1 ring-sky-100">{badge}</span>

            <h1 className="text-balance text-3xl font-extrabold leading-[1.35] text-navy-900 sm:text-4xl lg:text-[2.65rem]">
              {title}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg">{subtitle}</p>

            <p className="mt-5 text-lg font-extrabold text-sky-700 sm:text-xl">
              پکیج مطب تک‌پزشک: {formatToman(DOCTORS_PRODUCT_PRICE_TOMAN)} تومان — پرداخت مرحله‌ای
            </p>
            {priceNote ? (
              <p className="mt-2 text-[13px] text-navy-400">{priceNote}</p>
            ) : (
              <p className="mt-2 text-[13px] text-navy-400">{DOCTORS_LAUNCH_NOTE}</p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#samples"
                className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98]"
              >
                نمونه تخصصم را ببینم
              </a>
              <a
                href="#package"
                className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-3 text-sm font-bold text-navy-700 transition-all hover:bg-navy-50 active:scale-[0.98]"
              >
                جزئیات پکیج
              </a>
            </div>

            <p className="mt-6 text-[12px] leading-relaxed text-navy-400">
              شرکت هوش آرایه پارس — مستقر در پارک علم و فناوری دانشگاه تهران
            </p>
          </div>

          <div className="lg:ps-2">{mockup ?? <HeroMockup />}</div>
        </div>
      </div>
    </section>
  );
}
