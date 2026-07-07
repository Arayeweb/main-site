"use client";

import Reveal from "./Reveal";

const USE_CASES = [
  {
    title: "تولید محتوا",
    prompt: "۳ ایده ریلز برای معرفی محصول آرایشی",
    output: "ایده ۱: قبل/بعد · ایده ۲: آموزش ۱۵ ثانیه‌ای · ایده ۳: نظر مشتری",
  },
  {
    title: "کدنویسی",
    prompt: "این تابع چرا undefined برمی‌گرداند؟",
    output: "return زودتر از assign اجرا شده — await یا شرط را بررسی کن.",
  },
  {
    title: "درس و تحقیق",
    prompt: "فوتوسنتز را ساده توضیح بده",
    output: "تبدیل نور به انرژی — ورودی: نور، خروجی: قند + اکسیژن.",
  },
  {
    title: "مارکتینگ",
    prompt: "پرسونای مخاطب برای SaaS ایرانی",
    output: "فریلنسر ۲۵–۳۵ سال، نیاز: سرعت + فارسی + پرداخت تومان.",
  },
  {
    title: "فریلنسری",
    prompt: "پروپوزال برای طراحی سایت فروشگاهی",
    output: "مشکل مشتری · راه‌حل · زمان‌بندی · قیمت · نمونه کار.",
  },
  {
    title: "کسب‌وکار",
    prompt: "پاسخ حرفه‌ای به شکایت تأخیر ارسال",
    output: "عذرخواهی + علت + جبران + زمان دقیق تحویل.",
  },
];

export default function UseCaseCards() {
  return (
    <section className="feat-section feat-section--alt">
      <div className="feat-container">
        <div className="feat-section-head">
          <span className="feat-eyebrow">کاربردها</span>
          <h2>برای کار واقعی، نه فقط چت</h2>
          <p>نمونه پرامپت و خروجی — همان چیزی که در پنل می‌بینی.</p>
        </div>
        <div className="feat-usecase-grid">
          {USE_CASES.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <article className="feat-usecase-glass">
                <h3>{item.title}</h3>
                <div className="feat-usecase-prompt">
                  <span>پرامپت</span>
                  <p>{item.prompt}</p>
                </div>
                <div className="feat-usecase-output">
                  <span>خروجی</span>
                  <p>{item.output}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
