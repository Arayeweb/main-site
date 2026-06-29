import Link from "next/link";

const PLANS = [
  {
    id: "free",
    name: "رایگان",
    price: null,
    desc: "شروع کن و ببین چطور کار می‌کند.",
    features: [
      { label: "۵ سؤال با جواب سریع", ok: true },
      { label: "۲ تست همفکری AI", ok: true },
      { label: "دسترسی به نقد و اصلاح", ok: false },
      { label: "تاریخچه گفتگوها", ok: false },
    ],
    cta: "شروع رایگان",
    ctaHref: "/ai/auth",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "۱۴۹,۰۰۰",
    desc: "برای دانشجوها، فریلنسرها و کسب‌وکارهای کوچک.",
    features: [
      { label: "۱۰۰ کردیت ماهانه", ok: true },
      { label: "جواب سریع نامحدود از کردیت", ok: true },
      { label: "همفکری AI کامل", ok: true },
      { label: "تاریخچه گفتگوها", ok: true },
      { label: "نقد و اصلاح پیشرفته", ok: false },
    ],
    cta: "شروع با Pro",
    ctaHref: "/ai/auth",
    featured: true,
    badge: "محبوب‌ترین",
  },
  {
    id: "business",
    name: "Business",
    price: "۳۴۹,۰۰۰",
    desc: "برای کلینیک‌ها، فروشگاه‌ها و کسب‌وکارهای خدماتی.",
    features: [
      { label: "کردیت نامحدود", ok: true },
      { label: "جواب سریع", ok: true },
      { label: "همفکری AI کامل", ok: true },
      { label: "نقد و اصلاح پیشرفته", ok: true },
      { label: "قالب‌های مخصوص کسب‌وکار", ok: true },
      { label: "تحلیل تبلیغات و محتوا", ok: true },
    ],
    cta: "تماس با آرایه",
    ctaHref: "/ai/auth",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Nav */}
      <nav className="ai-nav">
        <div className="ai-container-wide ai-nav-inner">
          <Link href="/ai" className="ai-logo">
            آرایه <span>AI</span>
          </Link>
          <div className="ai-nav-links">
            <Link href="/ai/auth" className="ai-btn ai-btn-primary ai-btn-sm">
              ورود / ثبت‌نام
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="ai-pricing-hero">
        <div className="ai-container">
          <h1>پلن مناسب خودت را انتخاب کن</h1>
          <p>
            از رایگان شروع کن. هر وقت آماده شدی ارتقاء بده.
            <br />
            بدون قرارداد بلندمدت — هر ماه تمدید می‌شود.
          </p>
        </div>
      </section>

      {/* Plans */}
      <div className="ai-container">
        <div className="ai-plans-grid" style={{ marginBottom: 60 }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`ai-plan-card${plan.featured ? " featured" : ""}`}
            >
              {plan.featured && plan.badge && (
                <div className="ai-plan-badge">{plan.badge}</div>
              )}
              <div>
                <div className="ai-plan-name">{plan.name}</div>
                <div className="ai-plan-price" style={{ marginTop: 8 }}>
                  {plan.price ? (
                    <>
                      {plan.price}
                      <span className="per"> تومان/ماه</span>
                    </>
                  ) : (
                    <span className="free-label">رایگان</span>
                  )}
                </div>
                <div className="ai-plan-desc" style={{ marginTop: 8 }}>
                  {plan.desc}
                </div>
              </div>

              <ul className="ai-plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <span className={f.ok ? "check" : "cross"}>
                      {f.ok ? "✓" : "✕"}
                    </span>
                    <span style={{ color: f.ok ? "var(--ai-text)" : "var(--ai-text3)" }}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="ai-plan-cta">
                <Link
                  href={plan.ctaHref}
                  className={`ai-btn ai-btn-block${plan.featured ? " ai-btn-primary" : " ai-btn-ghost"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "var(--ai-text3)",
            paddingBottom: 48,
          }}
        >
          پرداخت در نسخه فعلی فعال نشده — با ثبت‌نام رایگان شروع کن.
          <br />
          برای ارتقاء با پشتیبانی آرایه تماس بگیر.
        </div>
      </div>
    </div>
  );
}
