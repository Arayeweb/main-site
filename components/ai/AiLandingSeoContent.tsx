import Link from "next/link";

const FAQ = [
  {
    q: "هوش مصنوعی آرایه چیست؟",
    a: "پلتفرم فارسی آرایه برای دسترسی هم‌زمان به ChatGPT، Claude، Gemini، Grok و DeepSeek — بدون VPN و با پرداخت تومانی.",
  },
  {
    q: "آرایه یا ارایه؟",
    a: "نام برند ما «آرایه» است، اما بعضی کاربران آن را به‌صورت «ارایه» هم جست‌وجو می‌کنند. هر دو به همین پلتفرم اشاره دارند.",
  },
  {
    q: "آیا می‌توانم مدل‌ها را مقایسه کنم؟",
    a: "بله. در حالت مقایسه یک سؤال را به چند مدل می‌دهید و پاسخ‌ها را کنار هم می‌بینید. صفحه مقایسه هوش مصنوعی راهنمای انتخاب مدل را هم دارد.",
  },
  {
    q: "آیا بدون VPN کار می‌کند؟",
    a: "بله. هوش مصنوعی آرایه از ایران بدون VPN در دسترس است و پرداخت با تومان انجام می‌شود.",
  },
] as const;

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

/** محتوای قابل‌خزش زیر اپ /ai — برند، FAQ و لینک‌های کلاستر سئو */
export default function AiLandingSeoContent() {
  return (
    <section className="ar-seo-landing" aria-labelledby="ar-seo-landing-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <details className="ar-seo-landing-details">
        <summary className="ar-seo-landing-summary">بیشتر درباره هوش مصنوعی آرایه</summary>
        <div className="ar-seo-landing-body">
          <h2 id="ar-seo-landing-title">هوش مصنوعی آرایه (Araaye / ارایه)</h2>
          <p>
            در آرایه می‌توانی پاسخ مدل‌های مختلف هوش مصنوعی را مقایسه کنی. اگر «هوش مصنوعی
            ارایه» یا «Araaye AI» را جست‌وجو کرده‌ای، این همان پلتفرم آرایه است.
          </p>
          <p>
            با <strong>هوش مصنوعی آرایه</strong> از ChatGPT، Claude، Gemini، Grok و DeepSeek
            هم‌زمان استفاده کنید، پاسخ‌ها را کنار هم ببینید و بدون VPN و با پرداخت تومانی شروع
            کنید.
          </p>
          <p>
            برای انتخاب بهترین مدل،{" "}
            <Link href="/ai/compare">مقایسه هوش مصنوعی</Link> را ببینید یا از{" "}
            <Link href="/ai/pricing">قیمت‌گذاری آرایه AI</Link> پلن مناسب را انتخاب کنید.
          </p>
          <dl className="ar-seo-landing-faq">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
          <p className="ar-seo-landing-links">
            <Link href="/ai/compare">مقایسه هوش مصنوعی</Link>
            {" · "}
            <Link href="/ai/features">امکانات آرایه AI</Link>
            {" · "}
            <Link href="/ai/pricing">خرید کردیت</Link>
          </p>
        </div>
      </details>
    </section>
  );
}
