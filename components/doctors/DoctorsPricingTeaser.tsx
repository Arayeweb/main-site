import { doctorStartingPriceToman, formatToman } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";

export default function DoctorsPricingTeaser() {
  return (
    <section id="pricing" className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="حدود سرمایه‌گذاری"
          badgeClassName="bg-sky-50 text-sky-700"
          title="اول بررسی؛ بعد محدوده قیمت"
          subtitle="پکیج آماده برای همه یکسان نیست. مبلغ نهایی بعد از گزارش رایگان و مشخص شدن نیاز واقعی اعلام می‌شود."
        />

        <div className="mx-auto max-w-xl rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-soft">
          <p className="text-sm text-navy-500">شروع کار برای مطب تک‌پزشک از حدود</p>
          <p className="mt-2 text-3xl font-extrabold text-sky-600">
            {formatToman(doctorStartingPriceToman)}
            <span className="mr-1 text-sm font-medium text-navy-400">تومان</span>
          </p>
          <p className="mx-auto mt-4 max-w-sm text-[13px] leading-relaxed text-navy-500">
            کلینیک چندپزشکه و پروژه‌های ترکیبی (سایت + سئو) محدوده جداگانه‌ای دارند و بر اساس
            گزارش اولیه برآورد می‌شوند.
          </p>
          <a
            href="#audit"
            className="mt-6 inline-flex rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98]"
          >
            اول گزارش رایگان بگیرم
          </a>
        </div>
      </div>
    </section>
  );
}
