import HeroLeadForm from "./home/HeroLeadForm";
import { IconCheck, IconBolt, IconNetwork, IconChart, IconUsers, IconCode, IconGlobe } from "./icons";

const heroBadges = [
  { label: "نرم‌افزار اختصاصی", icon: IconCode },
  { label: "CRM", icon: IconUsers },
  { label: "اتوماسیون AI", icon: IconBolt },
  { label: "وب‌اپلیکیشن", icon: IconGlobe },
  { label: "داشبورد", icon: IconChart },
];

const trustBullets = [
  "طراحی و توسعه اختصاصی",
  "مناسب کسب‌وکارهای در حال رشد",
  "از ایده تا اجرا و پشتیبانی",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl animate-pulse-slow" />
        <div className="absolute top-20 left-1/4 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-10 right-1/3 h-72 w-72 rounded-full bg-brand-300/15 blur-3xl" />
      </div>
      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 grid-pattern opacity-60" />

      <div className="container-mx container-px">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Text — right side in RTL */}
          <div className="flex flex-col items-start text-right">
            {/* Badges */}
            <div className="mb-6 flex flex-wrap gap-2">
              {heroBadges.map((b, i) => {
                const Icon = b.icon;
                return (
                  <span
                    key={b.label}
                    className={`badge border border-navy-100 bg-white/80 text-navy-600 backdrop-blur-sm${i >= 3 ? " hidden sm:inline-flex" : ""}`}
                  >
                    <Icon size={13} className="text-brand-500" />
                    {b.label}
                  </span>
                );
              })}
            </div>

            <h1 className="text-3xl font-extrabold leading-[1.3] tracking-tight text-navy-900 sm:text-4xl lg:text-[2.85rem]">
              <span className="block text-balance">سیستم‌های نرم‌افزاری اختصاصی</span>
              <span className="mt-2 block text-[0.88em] font-bold leading-[1.45] text-navy-500 sm:text-[0.9em]">
                برای{" "}
                <span className="hero-accent">رشد</span>
                <span aria-hidden="true" className="mx-1.5 text-navy-300">·</span>
                <span className="hero-accent">اتوماسیون</span>
                <span aria-hidden="true" className="mx-1.5 text-navy-300">·</span>
                <span className="hero-accent">فروش بهتر</span>
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg">
              <span className="sm:hidden">آرایه برای کسب‌وکارهای در حال رشد، سایت، CRM، داشبورد، چت‌بات هوشمند و ابزارهای اختصاصی می‌سازد؛ از طراحی محصول تا اجرا و پشتیبانی.</span>
              <span className="hidden sm:inline">آرایه برای کسب‌وکارهای در حال رشد، سایت، وب‌اپلیکیشن، پنل مدیریتی، CRM، چت‌بات هوشمند و ابزارهای اختصاصی می‌سازد؛ از طراحی محصول تا توسعه، اجرا و پشتیبانی.</span>
            </p>

            {/* CTAs */}
            <div className="mt-5 sm:mt-8 flex flex-wrap items-center gap-3">
              <a href="#cta" className="btn-primary text-base">
                مشاوره رایگان
              </a>
              <a href="#real-portfolio" className="btn-secondary text-base">
                نمونه‌کارها
              </a>
            </div>

            <HeroLeadForm />

            {/* Trust bullets — desktop only */}
            <ul className="mt-8 hidden sm:flex flex-col gap-2.5">
              {trustBullets.map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-navy-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <IconCheck size={13} strokeWidth={2.5} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            {/* Trust single line — mobile only */}
            <p className="mt-4 flex items-center gap-2 text-sm text-navy-500 sm:hidden">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <IconCheck size={13} strokeWidth={2.5} />
              </span>
              از ایده تا اجرا و پشتیبانی — برای کسب‌وکارهای در حال رشد
            </p>
          </div>

          {/* Dashboard mockup — left side in RTL */}
          <div className="relative animate-fade-up">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      {/* Main dashboard frame */}
      <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-card sm:p-5">
        {/* Window chrome */}
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <span className="mr-auto text-xs font-medium text-navy-300">dashboard.araaye.com</span>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-12 gap-3">
          {/* Revenue chart — large */}
          <div className="col-span-12 rounded-xl border border-navy-50 bg-navy-50/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-navy-400">درآمد این ماه</p>
                <p className="text-lg font-bold text-navy-900">۱۲۴٬۵۰۰٬۰۰۰ ت</p>
              </div>
              <span className="badge bg-green-50 text-green-600">▲ ۱۸٪</span>
            </div>
            {/* Bar chart */}
            <div className="flex items-end gap-1.5 h-16">
              {[40, 55, 35, 70, 50, 85, 60, 90, 65, 75, 95, 80].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-brand-400 to-brand-600"
                  style={{ height: `${h}%`, opacity: 0.4 + (i / 12) * 0.6 }}
                />
              ))}
            </div>
          </div>

          {/* CRM Lead cards */}
          <div className="col-span-6 rounded-xl border border-navy-50 bg-white p-3.5">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <IconUsers size={15} />
              </span>
              <p className="text-xs font-bold text-navy-700">لیدهای جدید</p>
            </div>
            <div className="space-y-2">
              {[
                { name: "شرکت پارس", status: "جدید", color: "bg-brand-50 text-brand-600" },
                { name: "دکتر رضایی", status: "در حال پیگیری", color: "bg-amber-50 text-amber-600" },
                { name: "فروشگاه آرا", status: "تبدیل شد", color: "bg-green-50 text-green-600" },
              ].map((lead) => (
                <div key={lead.name} className="flex items-center justify-between rounded-lg bg-navy-50/50 px-2.5 py-1.5">
                  <span className="text-xs font-medium text-navy-700">{lead.name}</span>
                  <span className={`badge ${lead.color} !px-2 !py-0.5 !text-[10px]`}>{lead.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Chatbot preview */}
          <div className="col-span-6 rounded-xl border border-navy-50 bg-white p-3.5">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <IconNetwork size={15} />
              </span>
              <p className="text-xs font-bold text-navy-700">چت‌بات هوشمند</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-navy-50/60 px-3 py-1.5 text-xs text-navy-600">
                  قیمت طراحی سایت چقدره؟
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-brand-600 px-3 py-1.5 text-xs text-white">
                  بستگی به امکانات داره. یه مشاوره رایگان برات تنظیم کنم.
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-navy-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
                در حال نوشتن...
              </div>
            </div>
          </div>

          {/* Task/project status */}
          <div className="col-span-12 rounded-xl border border-navy-50 bg-white p-3.5">
            <p className="mb-2.5 text-xs font-bold text-navy-700">وضعیت پروژه‌ها</p>
            <div className="space-y-2">
              {[
                { label: "طراحی سایت", pct: 80, color: "bg-green-500" },
                { label: "توسعه CRM", pct: 55, color: "bg-brand-500" },
                { label: "چت‌بات AI", pct: 30, color: "bg-brand-300" },
              ].map((task) => (
                <div key={task.label} className="flex items-center gap-3">
                  <span className="w-20 text-[10px] text-navy-500">{task.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-50">
                    <div className={`h-full rounded-full ${task.color}`} style={{ width: `${task.pct}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-navy-700 w-8 text-left">{task.pct}٪</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge — AI Automation */}
      <div className="absolute -top-3 -left-3 hidden sm:flex animate-float items-center gap-2 rounded-xl border border-navy-100 bg-white px-3 py-2 shadow-card">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 border border-brand-200 text-brand-600">
          <IconBolt size={14} />
        </span>
        <div>
          <p className="text-[10px] text-navy-400">اتوماسیون</p>
          <p className="text-xs font-bold text-navy-900">AI Automation</p>
        </div>
      </div>

      {/* Floating badge — CRM */}
      <div className="absolute -bottom-3 -right-3 hidden sm:flex animate-float items-center gap-2 rounded-xl border border-navy-100 bg-white px-3 py-2 shadow-card" style={{ animationDelay: "2s" }}>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-white">
          <IconUsers size={14} />
        </span>
        <div>
          <p className="text-[10px] text-navy-400">مدیریت مشتری</p>
          <p className="text-xs font-bold text-navy-900">CRM فعال</p>
        </div>
      </div>
    </div>
  );
}
