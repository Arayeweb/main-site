const STEPS = [
  {
    num: "۱",
    title: "شناخت کسب‌وکار",
    description:
      "خدمات، مشتریان، محدوده فعالیت و وضعیت فعلی شما را بررسی می‌کنیم.",
    output: "اطلاعات کسب‌وکار",
  },
  {
    num: "۲",
    title: "مشخص‌کردن برنامه",
    description:
      "معلوم می‌شود چه اطلاعاتی باید اصلاح شود و چه صفحه‌هایی باید ساخته شوند.",
    output: "برنامه اجرا",
  },
  {
    num: "۳",
    title: "اجرا",
    description:
      "حضور در گوگل، نقشه، صفحات خدمات و مسیرهای تماس آماده یا بهینه می‌شوند.",
    output: "صفحات و نقشه",
  },
  {
    num: "۴",
    title: "گزارش و ادامه مسیر",
    description:
      "کارهای انجام‌شده، وضعیت فعلی و اقدامات مرحله بعد را شفاف تحویل می‌دهیم.",
    output: "گزارش نهایی",
  },
] as const;

const SCHEDULE = [
  "ثبت و تکمیل حضور در گوگل: پروژه یک‌باره",
  "سئوی محلی و صفحات خدمات: همکاری ماهانه",
  "برنامه و زمان دقیق: قبل از شروع هر پروژه مشخص می‌شود",
] as const;

export default function SeoCollaboration() {
  return (
    <section className="seo-collab section-py" aria-label="روش همکاری و زمان‌بندی">
      <div className="container-mx container-px">
        <div className="seo-collab-header">
          <span className="seo-section-tag">روش همکاری</span>
          <h2>از شروع همکاری تا اولین گزارش چه می‌گذرد؟</h2>
        </div>

        <ol className="seo-collab-timeline">
          {STEPS.map((step) => (
            <li key={step.title} className="seo-collab-step">
              <span className="seo-collab-dot">{step.num}</span>
              <div className="seo-collab-step-body">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <span className="seo-collab-output">{step.output}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="seo-collab-schedule">
          <p className="seo-collab-schedule-title">زمان‌بندی</p>
          <ul>
            {SCHEDULE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
