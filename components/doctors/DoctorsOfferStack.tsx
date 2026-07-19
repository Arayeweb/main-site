import SectionHeader from "@/components/home/SectionHeader";
import { IconCheck } from "@/components/icons";
import {
  DOCTORS_PRODUCT_PRICE_TOMAN,
  doctorOfferStack,
  doctorProductPackageExcluded,
  formatToman,
} from "@/lib/doctorsData";

export default function DoctorsOfferStack() {
  return (
    <section id="package" className="section-py scroll-mt-24">
      <div className="container-mx container-px">
        <SectionHeader
          badge="پیشنهاد اصلی"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="فقط سایت تحویل نمی‌گیرید؛ مسیر جذب بیمار می‌گیرید"
          subtitle="تبدیل بازدیدکننده گوگل به تماس، واتساپ یا درخواست نوبت — با مالکیت کامل برای پزشک."
        />

        <div className="mx-auto max-w-3xl rounded-3xl border border-cyan-100 bg-gradient-to-b from-cyan-50/60 to-white p-6 shadow-soft sm:p-8">
          <ul className="space-y-3">
            {doctorOfferStack.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-navy-800 sm:text-[15px]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-white">
                  <IconCheck size={12} />
                </span>
                <span className="font-semibold">{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 rounded-2xl bg-navy-900 px-5 py-4 text-center text-base font-extrabold text-white sm:text-lg">
            همه این موارد با قیمت {formatToman(DOCTORS_PRODUCT_PRICE_TOMAN)} تومان
          </p>

          <div className="mt-5 rounded-2xl border border-navy-100 bg-white px-4 py-4">
            <p className="text-[12px] font-bold text-navy-500">خارج از پکیج (نیازمند برآورد)</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {doctorProductPackageExcluded.map((item) => (
                <li
                  key={item}
                  className="rounded-lg bg-navy-50 px-2.5 py-1 text-[11px] font-medium text-navy-600"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <a
            href="#quote-form"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-6 py-3.5 text-sm font-extrabold text-white transition-all hover:bg-cyan-800 active:scale-[0.98]"
          >
            شروع ساخت سایت مطب
          </a>
        </div>
      </div>
    </section>
  );
}
