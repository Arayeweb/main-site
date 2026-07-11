import SeoHeroMockup from "./SeoHeroMockup";
import SeoHeroSearch from "./SeoHeroSearch";

export default function SeoHero() {
  return (
    <section className="seo-hero">
      <div className="container-mx container-px">
        <div className="seo-hero-stack">
          <div className="seo-hero-copy is-centered">
            <span className="seo-hero-badge">آرایه SEO</span>

            <h1>
              <span className="seo-hero-title-line">وقتی مشتری در گوگل جست‌وجو می‌کند،</span>
              <span className="seo-hero-title-line">
                <span className="seo-hero-highlight">شما را پیدا کند</span>
              </span>
            </h1>

            <p className="seo-hero-sub">
              نام کسب‌وکار یا آدرس سایت را وارد کنید تا مشخص شود حضور شما در گوگل از
              کجا نیاز به بهبود دارد.
            </p>

            <SeoHeroSearch />
          </div>

          <SeoHeroMockup />
        </div>
      </div>
    </section>
  );
}
