import type { Metadata } from "next";
import Link from "next/link";
import { IconPhone, IconShield, IconSpark } from "../icons";

export const metadata: Metadata = {
  title: "امکانات آرایه AI | چند مدل، فارسی، بدون VPN",
  description:
    "GPT، Claude، Gemini، DeepSeek و Grok — گفتگو، تصویر، ویدیو، موزیک و شخصیت‌های AI با پرداخت تومان و بدون VPN.",
};

export default function AiFeaturesPage() {
  return (
    <main className="ar-container ar-features-page">
      <section className="ar-hero ar-hero--slim">
        <div className="ar-hero-mark">
          <IconSpark size={18} />
          آرایه AI
        </div>
        <h1>
          چند مدل AI، <span className="ar-hl">فارسی</span>، بدون VPN
        </h1>
        <p className="ar-hero-proof">
          پرداخت تومان — دسترسی به بهترین مدل‌های دنیا از یک جا
        </p>
        <div className="ar-features-cta">
          <Link href="/ai" className="ar-btn ar-btn-primary">
            شروع چت
          </Link>
          <Link href="/ai/pricing" className="ar-btn ar-btn-ghost">
            اشتراک‌ها
          </Link>
        </div>
      </section>

      <section className="ar-features-grid">
        <article className="ar-features-card">
          <h2>گفتگو با چند مدل</h2>
          <p>
            GPT، Claude، Gemini، DeepSeek و Grok — یک چت‌باکس، انتخاب مدل بالای پیام،
            مقایسه دو مدل یا نبرد ناشناس برای انتخاب بهترین پاسخ.
          </p>
        </article>
        <article className="ar-features-card">
          <h2>ساخت عکس و ویدیو</h2>
          <p>
            استودیو تصویر و ویدیو با مدل‌های روز — بدون نیاز به ابزار جدا و بدون VPN.
          </p>
        </article>
        <article className="ar-features-card">
          <h2>موزیک و صوت</h2>
          <p>ساخت موزیک و تبدیل گفتار به متن — همه در اکوسیستم آرایه AI.</p>
        </article>
        <article className="ar-features-card">
          <h2>شخصیت‌های AI</h2>
          <p>
            گفتگو با شخصیت‌های شناخته‌شده — از ایده‌پردازی تا مشاوره، با لحن مخصوص هر شخصیت.
          </p>
          <Link href="/ai/personas" className="ar-hero-link">
            مشاهده شخصیت‌ها ←
          </Link>
        </article>
      </section>

      <section className="ar-trust" id="about">
        <div className="ar-trust-grid">
          <div className="ar-trust-card">
            <div className="head">
              <IconSpark size={16} />
              درباره ما
            </div>
            <p>
              آرایه AI محصولی از <a href="/">آرایه</a> است — تیم توسعه نرم‌افزار اختصاصی که
              برای ده‌ها کسب‌وکار ایرانی سایت، CRM و ابزار هوش مصنوعی ساخته است. این محصول با
              همان استاندارد، دسترسی به بهترین مدل‌های دنیا را بدون VPN و دلار ممکن می‌کند.
            </p>
          </div>
          <div className="ar-trust-card">
            <div className="head">
              <IconPhone size={16} />
              پشتیبانی
            </div>
            <p>پاسخ‌گوی سؤال، مشکل پرداخت یا هر ابهامی هستیم:</p>
            <div className="row">
              تلفن:{" "}
              <a href="tel:02128426699" dir="ltr">
                ۰۲۱-۲۸۴۲۶۶۹۹
              </a>
            </div>
            <div className="row">
              ایمیل:{" "}
              <a href="mailto:support@araaye.com" dir="ltr">
                support@araaye.com
              </a>
            </div>
          </div>
          <div className="ar-trust-card">
            <div className="head">
              <IconShield size={16} />
              پرداخت امن
            </div>
            <p>
              پرداخت‌ها از طریق درگاه رسمی زیبال انجام می‌شود و کردیت‌ها بلافاصله به حسابت
              اضافه می‌شوند و منقضی نمی‌شوند. اگر پرداختی ناموفق بود ولی مبلغ کسر شد، طبق
              قوانین شاپرک برمی‌گردد.
            </p>
          </div>
        </div>
      </section>

      <footer className="ar-footer">
        <div className="ar-container">
          محصولی از <Link href="/">آرایه</Link> — پاسخ‌ها توسط مدل‌های هوش مصنوعی تولید
          می‌شوند و ممکن است نادرست باشند.
        </div>
      </footer>
    </main>
  );
}
