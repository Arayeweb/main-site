import Link from "next/link";

export default function AILandingPage() {
  return (
    <div className="ai-landing">
      {/* Nav */}
      <nav className="ai-nav">
        <div className="ai-container-wide ai-nav-inner">
          <div className="ai-logo">
            آرایه <span>AI</span>
          </div>
          <div className="ai-nav-links">
            <Link href="/ai/pricing" className="ai-btn ai-btn-ghost ai-btn-sm">
              قیمت‌گذاری
            </Link>
            <Link href="/ai/auth" className="ai-btn ai-btn-primary ai-btn-sm">
              ورود / ثبت‌نام
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="ai-hero">
        <div className="ai-container">
          <div className="ai-hero-inner">
            <div className="ai-hero-eyebrow">✦ اتاق فکر هوشمند آرایه</div>
            <h1>
              یک سؤال بپرس؛
              <br />
              <em>چند هوش مصنوعی با هم فکر کنند.</em>
            </h1>
            <p className="ai-hero-sub">
              Araaye AI جواب چند مدل و چند نقش مختلف را بررسی می‌کند،
              اختلاف‌نظرها را نشان می‌دهد و در آخر یک جمع‌بندی قابل استفاده
              می‌دهد.
            </p>
            <div className="ai-hero-cta">
              <Link href="/ai/auth" className="ai-btn ai-btn-accent ai-btn-lg">
                شروع رایگان
              </Link>
              <a href="#demo" className="ai-btn ai-btn-ghost ai-btn-lg">
                دیدن نمونه جواب
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="ai-demo-section" id="demo">
        <div className="ai-container">
          <h2>ببین چطور کار می‌کند</h2>
          <div className="ai-demo-card">
            <div className="ai-demo-header">
              <span className="ai-demo-dot" />
              سؤال نمونه
            </div>
            <div className="ai-demo-body">
              <div className="ai-demo-q">
                برای تبلیغ کلینیک زیبایی، گوگل ادز بهتره یا اینستاگرام؟
              </div>

              <div className="ai-demo-modes">
                {/* Quick */}
                <div>
                  <div className="ai-demo-mode-label">⚡ جواب سریع</div>
                  <div className="ai-demo-answer">
                    گوگل ادز برای جذب مشتری آماده خرید بهتر است — کسی که
                    «کلینیک زیبایی» سرچ می‌کند اغلب قصد رزرو دارد. اینستاگرام
                    برای آگاهی‌سازی و اعتمادسازی بلندمدت مناسب‌تر است.
                  </div>
                </div>

                {/* Brainstorm snippets */}
                <div>
                  <div className="ai-demo-mode-label">
                    🧠 همفکری — دیدگاه‌های مختلف
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <div className="ai-demo-answer">
                      <strong style={{ color: "#3B82F6" }}>
                        تحلیل‌گر منطقی:
                      </strong>{" "}
                      گوگل ادز نرخ تبدیل بالاتری برای خدمات محلی دارد؛ جستجوی
                      فعال نشان‌دهنده نیاز آماده است.
                    </div>
                    <div className="ai-demo-answer">
                      <strong style={{ color: "#8B5CF6" }}>
                        مشاور اجرایی:
                      </strong>{" "}
                      قبل از هر تبلیغی، لندینگ پیج و فرم رزرو آنلاین آماده کن.
                      بدون آن هر دو پلتفرم بودجه‌ات را هدر می‌دهند.
                    </div>
                    <div className="ai-demo-answer">
                      <strong style={{ color: "#F59E0B" }}>منتقد ریسک:</strong>{" "}
                      هزینه هر کلیک گوگل در حوزه کلینیک زیاد است؛ بدون
                      بهینه‌سازی صفحه فرود، CPA بالا می‌رود.
                    </div>
                  </div>
                </div>

                {/* Synthesis */}
                <div>
                  <div className="ai-demo-mode-label">✦ جمع‌بندی نهایی</div>
                  <div className="ai-demo-answer synthesis">
                    <strong>قدم بعدی پیشنهادی:</strong> ابتدا لندینگ پیج و فرم
                    رزرو آنلاین را آماده کن. بعد با بودجه کم ۷-۱۰ روز گوگل ادز
                    تست کن. نتایج را اندازه بگیر. سپس از اینستاگرام برای
                    ریتارگتینگ بازدیدکنندگان استفاده کن.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="ai-features-section">
        <div className="ai-container">
          <h2>سه حالت پاسخ، برای هر نیازی</h2>
          <div className="ai-features-grid">
            <div className="ai-feature-card">
              <div className="ai-feature-icon">⚡</div>
              <h3>جواب سریع</h3>
              <p>
                یک AI، یک جواب مستقیم. برای سؤال‌های روزمره، تولید متن،
                ایده‌گرفتن و خلاصه‌سازی.
              </p>
              <span className="ai-feature-tag">۱ کردیت</span>
            </div>
            <div className="ai-feature-card">
              <div className="ai-feature-icon">🧠</div>
              <h3>همفکری AI</h3>
              <p>
                چند دیدگاه مختلف، یک جمع‌بندی بهتر. مناسب تصمیم‌گیری،
                کسب‌وکار، ایده‌پردازی و مقایسه.
              </p>
              <span className="ai-feature-tag">۲ کردیت</span>
            </div>
            <div className="ai-feature-card">
              <div className="ai-feature-icon">🔬</div>
              <h3>نقد و اصلاح</h3>
              <p>
                اول جواب می‌گیری، بعد AIها همان جواب را نقد و بهتر می‌کنند.
                برای تصمیم‌های مهم و متن‌های حساس.
              </p>
              <span className="ai-feature-tag">۳ کردیت — پلن Business</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ai-cta-section">
        <div className="ai-container">
          <div className="ai-cta-box">
            <h2>همین الان شروع کن</h2>
            <p>
              ۵ سؤال رایگان — بدون نیاز به کارت بانکی
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link href="/ai/auth" className="ai-btn ai-btn-accent ai-btn-lg">
                شروع رایگان
              </Link>
              <Link
                href="/ai/pricing"
                className="ai-btn ai-btn-ghost ai-btn-lg"
              >
                مقایسه پلن‌ها
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ai-footer">
        <div className="ai-container">
          © ۱۴۰۴ آرایه | araaye.com/ai
        </div>
      </footer>
    </div>
  );
}
