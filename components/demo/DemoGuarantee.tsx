import { IconShield } from "@/components/icons";

// Adapted from components/seo/SeoGuarantee.tsx but with copy matching the
// demo tool's own package names (پایه/رشد/پریمیوم) instead of the SEO
// vertical's package names, so the promise shown here is never misleading.
export default function DemoGuarantee() {
  return (
    <section className="pb-16 sm:pb-20">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-2xl rounded-3xl border-2 border-teal-200 bg-gradient-to-b from-teal-50 to-cyan-50/60 p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-glow">
            <IconShield size={26} />
          </div>
          <h2 className="text-lg font-extrabold text-teal-700 sm:text-xl">ضمانت ۱۰۰٪ بازگشت وجه</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-600">
            اگر تا ۷ روز از شروع همکاری از کیفیت کار راضی نبودید، کل مبلغ برمی‌گردد — بدون سؤال.
            پکیج پریمیوم هم ۶ ماه ضمانت پشتیبانی و بروزرسانی رایگان دارد.
          </p>
        </div>
      </div>
    </section>
  );
}
