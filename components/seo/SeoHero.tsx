import SeoHeroMockup from "./SeoHeroMockup";
import SeoHeroAuditForm from "./SeoHeroAuditForm";

export default function SeoHero() {
  return (
    <section className="seo-hero">
      <div className="container-mx container-px">
        <div className="seo-hero-stack">
          <div className="seo-hero-copy is-centered">
            <span className="seo-hero-badge">خدمات SEO آرایه</span>

            <h1>
              <span className="seo-hero-title-line">از جست‌وجوی گوگل</span>
              <span className="seo-hero-title-line">
                <span className="seo-hero-highlight">به تماس و مشتری برسید</span>
              </span>
            </h1>

            <p className="seo-hero-sub">
              وقتی مشتری خدمات شما را جست‌وجو می‌کند، شما را پیدا کند و بداند قدم بعدی
              چیست. از تحقیق کلمات کلیدی و سئوی فنی تا ساخت صفحات خدمات، محتوای هدفمند،
              اعتبار دامنه و سئوی محلی را در یک برنامه شفاف و قابل‌اندازه‌گیری اجرا
              می‌کنیم.
            </p>

            <div className="seo-hero-ctas">
              <a href="#audit-form" className="seo-btn-primary seo-btn-lg">
                دریافت بررسی اولیه
              </a>
              <a href="#packages" className="seo-btn-secondary seo-btn-lg">
                مشاهده خدمات و قیمت‌ها
              </a>
            </div>

            <SeoHeroAuditForm />
          </div>

          <SeoHeroMockup />
        </div>
      </div>
    </section>
  );
}
