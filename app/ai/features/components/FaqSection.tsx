const FAQ = [
  {
    q: "Araaye AI چه فرقی با ChatGPT دارد؟",
    a: "ChatGPT یک مدل است؛ آرایه AI workspace چندمدله است — مقایسه، همفکری، محتوا و کد در یک پنل فارسی.",
  },
  {
    q: "آیا برای استفاده نیاز به دانش فنی دارم؟",
    a: "خیر. سؤالت را فارسی بنویس و حالت مناسب را انتخاب کن.",
  },
  {
    q: "آیا برای تولید محتوا مناسب است؟",
    a: "بله — کپشن، تبلیغ، ایمیل و سناریو با مقایسه چند مدل.",
  },
  {
    q: "آیا برای برنامه‌نویسی کمک می‌کند؟",
    a: "بله — دیباگ، توضیح کد و استودیو کد برای پروژه‌های جدی‌تر.",
  },
  {
    q: "مقایسه چند مدل AI یعنی چه؟",
    a: "یک سؤال — چند پاسخ کنار هم — انتخاب یا ترکیب بهترین.",
  },
  {
    q: "کدام پلن برای من مناسب‌تر است؟",
    a: "رایگان برای شروع؛ Pro برای فریلنس و محتوا؛ Business برای تیم و استفاده سنگین.",
  },
];

export default function FaqSection() {
  return (
    <section className="feat-section" id="faq">
      <div className="feat-container feat-container--narrow">
        <div className="feat-section-head">
          <h2>سؤالات متداول</h2>
        </div>
        <div className="feat-faq">
          {FAQ.map((item) => (
            <details key={item.q} className="feat-faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
