import { companyMetrics } from "@/lib/homeData";
import { IconLayers, IconShield, IconUsers } from "@/components/icons";
import RevealSection from "./RevealSection";

const trustPoints = [
  {
    icon: IconLayers,
    title: "نمونه‌کار واقعی، نه فقط ادعا",
    text: "دوجین‌ها سایت و پنل مدیریتی واقعی برای کسب‌وکارهای مختلف ساخته‌ایم — این دموها فقط یک نمونه از همان کیفیت هستند.",
  },
  {
    icon: IconUsers,
    title: "یک تیم، از طراحی تا اجرا",
    text: "همان تیمی که طراحی می‌کند، کد می‌زند و بعد از تحویل هم پاسخگوی شماست؛ بدون واسطه و بدون فریلنسرهای پراکنده.",
  },
  {
    icon: IconShield,
    title: "پشتیبانی واقعی بعد از تحویل",
    text: "بعد از تحویل سایت رهایتان نمی‌کنیم؛ هر پکیج دوره‌ی پشتیبانی رایگان مشخصی دارد.",
  },
];

// Social proof for the *agency itself* — the demo testimonials belong to a
// fictional doctor, so a skeptical prospect still needs evidence that Araaye
// (not the imaginary patient) is credible before trusting the sales pitch.
export default function WhyAraayeSection() {
  return (
    <section className="section-py border-t border-navy-100 bg-navy-50/40">
      <div className="container-mx container-px">
        <RevealSection>
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge mb-4 bg-brand-50 text-brand-600">چرا آرایه؟</span>
            <h2 className="section-title">این فقط یک دموی خوش‌رنگ نیست</h2>
            <p className="section-subtitle">
              پشت این نمونه‌سایت‌ها یک تیم واقعی طراحی و توسعه است که سال‌هاست برای کسب‌وکارهای مختلف سایت و سیستم می‌سازد.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3 sm:gap-6">
            {companyMetrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-navy-100 bg-white px-3 py-5 text-center shadow-soft"
              >
                <div className="text-xl font-extrabold text-brand-600 sm:text-2xl">{m.value}</div>
                <div className="mt-1 text-[11px] leading-tight text-navy-500 sm:text-xs">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {trustPoints.map((t) => (
              <div key={t.title} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <t.icon size={20} />
                </span>
                <h3 className="text-sm font-extrabold text-navy-900">{t.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">{t.text}</p>
              </div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
