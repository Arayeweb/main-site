"use client";

import Reveal from "./Reveal";

const FEATURES = [
  {
    title: "چت با AI",
    desc: "سؤال بپرس و سریع جواب بگیر — با انتخاب مدل یا حالت بهینه.",
  },
  {
    title: "مقایسه مدل‌ها",
    desc: "چند AI کنار هم — بهترین پاسخ را انتخاب کن.",
  },
  {
    title: "ساخت پرامپت",
    desc: "ایده خام را به پرامپت دقیق تبدیل کن.",
  },
  {
    title: "خلاصه‌سازی",
    desc: "متن بلند را در چند خط کلیدی جمع کن.",
  },
  {
    title: "بازنویسی",
    desc: "لحن حرفه‌ای‌تر، رسمی‌تر یا ساده‌تر.",
  },
  {
    title: "تولید محتوا",
    desc: "کپشن، ایمیل، تبلیغ و سناریو.",
  },
  {
    title: "کمک به کدنویسی",
    desc: "دیباگ، توضیح کد و ساخت ایده.",
  },
  {
    title: "ایده‌پردازی",
    desc: "محصول، کمپین، فروش و استراتژی.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="feat-section" id="features">
      <div className="feat-container">
        <div className="feat-section-head">
          <span className="feat-eyebrow">قابلیت‌ها</span>
          <h2>همه‌چیز برای کار روزمره با AI</h2>
        </div>
        <div className="feat-features-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 50}>
              <article className="feat-feature-glass">
                <div className="feat-feature-accent" aria-hidden="true" />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
