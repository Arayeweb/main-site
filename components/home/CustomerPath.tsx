const cards = [
  {
    key: "website",
    number: "۱",
    product: "وب‌سایت",
    title: "اعتماد در همان نگاه اول",
    description:
      "مخاطب باید در چند ثانیه بفهمد چه کمکی می‌کنید، چرا قابل اعتمادید و قدم بعدی چیست.",
    cta: "مشاهده خدمات وب‌سایت",
    href: "/website-design",
  },
  {
    key: "seo",
    number: "۲",
    product: "سئو و گوگل",
    title: "حضور درست در لحظه نیاز",
    description:
      "برای جست‌وجوهایی دیده شوید که پشت آن‌ها یک نیاز واقعی و احتمال تبدیل‌شدن به مشتری وجود دارد.",
    cta: "مشاهده خدمات سئو",
    href: "/seo",
  },
  {
    key: "adready",
    number: "۳",
    product: "صفحه فروش",
    title: "تبدیل بازدید به یک اقدام مشخص",
    description:
      "پیام، پیشنهاد و فرم درخواست را در یک صفحه متمرکز می‌کنیم تا بازدید بدون نتیجه رها نشود.",
    cta: "مشاهده AdReady",
    href: "/adready",
  },
] as const;

function WebsiteMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-navy-50 bg-navy-50/60 px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
        <span className="mr-auto truncate text-[9px] text-navy-400">clinic-arya.com</span>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-navy-900">کلینیک آریا</span>
          <span className="rounded bg-navy-900 px-1.5 py-0.5 text-[8px] font-bold text-white">
            تماس
          </span>
        </div>
        <div className="h-10 rounded-lg bg-navy-100/80" />
        <div className="grid grid-cols-3 gap-1.5">
          {["خدمات", "درباره", "تماس"].map((label) => (
            <div
              key={label}
              className="rounded-md border border-navy-50 bg-navy-50/50 px-1 py-2 text-center text-[8px] font-medium text-navy-500"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SeoMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-navy-100 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5 rounded-full border border-navy-100 bg-navy-50/50 px-2 py-1 text-[9px] text-navy-400">
        <span className="font-serif text-navy-300">G</span>
        <span>کلینیک زیبایی تهران</span>
      </div>
      <p className="text-[11px] font-bold text-[#1a0dab]">خدمات کلینیک آریا</p>
      <p className="mt-0.5 text-[9px] text-emerald-700">clinic-arya.com</p>
      <p className="mt-1 text-[9px] leading-relaxed text-navy-500">
        مشاهده خدمات و درخواست وقت مشاوره
      </p>
    </div>
  );
}

function AdReadyMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-navy-50 bg-navy-50/50 px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
        <span className="mr-auto truncate text-[9px] text-navy-400">
          araaye.com/campaign/...
        </span>
      </div>
      <div className="bg-gradient-to-b from-brand-50/70 to-white px-3 py-3 text-center">
        <p className="text-[8px] font-semibold text-brand-600">کمپین تبلیغاتی</p>
        <p className="mt-1 text-[11px] font-extrabold leading-snug text-navy-900">
          خدمات کلینیک آریا
        </p>
        <p className="mt-0.5 text-[8px] text-navy-500">درخواست وقت مشاوره</p>
        <div className="mx-auto mt-2.5 max-w-[140px] space-y-1">
          <div className="rounded border border-navy-100 bg-white px-2 py-1 text-right text-[8px] text-navy-400">
            نام
          </div>
          <div className="rounded border border-navy-100 bg-white px-2 py-1 text-right text-[8px] text-navy-400">
            موبایل
          </div>
          <div className="rounded bg-navy-900 py-1 text-[8px] font-bold text-white">
            ثبت درخواست
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 text-[8px] font-semibold text-navy-500">
          <span>تماس</span>
          <span className="text-navy-200">·</span>
          <span className="text-emerald-600">واتساپ</span>
        </div>
      </div>
    </div>
  );
}

const MOCKUPS = {
  website: WebsiteMockup,
  seo: SeoMockup,
  adready: AdReadyMockup,
} as const;

export default function CustomerPath() {
  return (
    <section id="solutions" className="bg-navy-50/50 py-14 sm:py-16">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
            از اولین جست‌وجو تا تبدیل‌شدن به مشتری
          </h2>
          <p className="mt-3 text-base leading-relaxed text-navy-500 sm:text-[1.05rem]">
            یک مسیر پیوسته می‌سازیم: مخاطب شما را پیدا می‌کند، به انتخابش مطمئن می‌شود و
            بی‌دردسر درخواستش را ثبت می‌کند.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {cards.map((card) => {
            const Mockup = MOCKUPS[card.key];
            return (
              <article
                key={card.key}
                className="group flex flex-col rounded-2xl border border-navy-100/80 bg-white p-5 shadow-[0_1px_3px_rgba(16,42,67,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_8px_24px_rgba(16,42,67,0.08)] sm:p-6"
              >
                <div className="mb-4">
                  <Mockup />
                </div>
                <p className="text-[11px] font-bold tracking-wide text-navy-400">
                  <span className="text-brand-600">{card.number}.</span> {card.product}
                </p>
                <h3 className="mt-1.5 text-lg font-extrabold leading-snug text-navy-900">
                  {card.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">
                  {card.description}
                </p>
                <a
                  href={card.href}
                  className="mt-4 inline-flex w-fit items-center text-sm font-bold text-brand-600 transition-colors group-hover:text-brand-700"
                >
                  {card.cta}
                  <span aria-hidden="true" className="mr-1.5 transition-transform group-hover:-translate-x-0.5">
                    ←
                  </span>
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
