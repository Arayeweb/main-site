import {
  Check,
  ChevronDown,
  ClipboardList,
  Megaphone,
  MousePointerClick,
  Store,
} from "lucide-react";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import AdReadyCta from "./AdReadyCta";
import { buildAdReadyLoginUrl } from "@/lib/adreadyAuth";
import AdReadyHeroMockup from "./AdReadyHeroMockup";
import AdReadySampleLandings from "./AdReadySampleLandings";

const spotlightCases = [
  {
    icon: Megaphone,
    title: "برای تبلیغ آنلاین",
    text: "صفحه مقصد مخصوص تبلیغ بساز؛ با دکمه تماس و فرم دریافت درخواست آماده.",
  },
  {
    icon: Store,
    title: "برای فروش محصول و خدمت",
    text: "یک پیشنهاد مشخص، دکمه تماس یا ثبت درخواست واضح — بدون ساخت سایت کامل.",
  },
  {
    icon: ClipboardList,
    title: "برای جمع‌آوری درخواست مشتری",
    text: "فرم داخل صفحه، ثبت درخواست در پنل و مشخص‌بودن منبع هر تماس.",
  },
];

const quickSteps = [
  { number: "۱", title: "اطلاعات کسب‌وکار", text: "هدف و معرفی کوتاه را وارد کن." },
  { number: "۲", title: "ساخت صفحه", text: "AdReady متن، فرم و دکمه‌های تماس را آماده می‌کند." },
  { number: "۳", title: "پیش‌نمایش رایگان", text: "خروجی را ببین و در صورت نیاز ویرایش کن." },
  { number: "۴", title: "انتشار", text: "پرداخت یک‌باره کن، لینک را در تبلیغ بگذار." },
];

const comparison = {
  generic: [
    "خودت باید متن بنویسی",
    "خودت باید ساختار فروش بچینی",
    "بیشتر ابزار طراحی است",
    "درخواست‌ها و منبع تبلیغ همیشه مرکزی نیستند",
    "برای کاربر غیرمارکتر سخت می‌شود",
  ],
  adready: [
    "AdReady متن و ساختار اولیه را می‌سازد",
    "مخصوص صفحه تبلیغاتی است",
    "فرم دریافت درخواست و دکمه تماس آماده دارد",
    "درخواست‌ها داخل پنل ذخیره می‌شوند",
    "مشخص‌بودن منبع تبلیغ آماده است",
    "برای بازار ایران و RTL طراحی شده",
  ],
};

const plans = [
  {
    key: "preview",
    name: "پیش‌نمایش",
    price: "رایگان",
    note: "بدون انتشار عمومی",
    features: [
      "ساخت و مشاهده پیش‌نمایش",
      "بدون انتشار عمومی",
      "با واترمارک آرایه",
    ],
    cta: "پیش‌نمایش رایگان بساز",
  },
  {
    key: "publish",
    name: "انتشار",
    price: "۳۹۰ هزار تومان",
    note: "پرداخت یک‌باره — بدون اشتراک",
    featured: true,
    badge: "برای شروع",
    features: [
      "انتشار ۱ صفحه فعال",
      "فرم دریافت درخواست",
      "دکمه تماس، واتساپ و تلگرام",
      "ثبت درخواست‌ها در پنل",
      "لینک اختصاصی روی araaye.com",
    ],
    cta: "پیش‌نمایش رایگان بساز",
  },
  {
    key: "done",
    name: "اجرا توسط آرایه",
    price: "۶.۹ میلیون تومان",
    note: "شامل طراحی، متن و انتشار",
    features: [
      "تیم آرایه صفحه را کامل می‌سازد",
      "بهبود متن و ساختار صفحه",
      "تنظیم فرم و دکمه‌های تماس",
      "انتشار و تحویل لینک آماده",
      "مناسب کسانی که نمی‌خواهند خودشان درگیر شوند",
    ],
    cta: "درخواست اجرا",
  },
];

export const adReadyFaq = [
  {
    question: "آیا این طراحی سایت کامل است؟",
    answer:
      "نه. AdReady برای ساخت صفحه آماده تبلیغ است، نه سایت کامل.",
  },
  {
    question: "پرداخت یک‌باره است یا اشتراک؟",
    answer:
      "پرداخت یک‌باره است. اشتراک ماهانه نداریم. پیش‌نمایش رایگان است و فقط برای انتشار صفحه پرداخت می‌کنی.",
  },
  {
    question: "بعد از پرداخت، صفحه چقدر فعال می‌ماند؟",
    answer:
      "صفحه تا پایان دوره انتخابی فعال می‌ماند. برای تمدید، همان پلن انتشار را دوباره می‌خری — صفحه حذف نمی‌شود مگر خودت آن را غیرفعال کنی.",
  },
  {
    question: "دامنه اختصاصی در کدام پلن است؟",
    answer:
      "در نسخه لانچ، صفحه روی لینک araaye.com منتشر می‌شود. اتصال دامنه اختصاصی در پلن‌های بعدی اضافه می‌شود.",
  },
  {
    question: "هزینه اجرا توسط آرایه شامل انتشار هم می‌شود؟",
    answer:
      "بله. تیم آرایه طراحی، متن، تنظیم فرم و انتشار کامل صفحه را انجام می‌دهد و لینک آماده تحویل می‌گیرد.",
  },
  {
    question: "آیا باید طراحی بلد باشم؟",
    answer:
      "نه. اطلاعات کسب‌وکارت را وارد می‌کنی و AdReady ساختار اولیه را می‌سازد.",
  },
  {
    question: "آیا درخواست‌های مشتری داخل پنل می‌آیند؟",
    answer:
      "بله. فرم صفحه به پنل درخواست‌های همان صفحه وصل است.",
  },
];

function SectionIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="adready-section-intro">
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

export default function AdReadyLanding() {
  return (
    <div className="adready-page" dir="rtl">
      <header className="adready-header">
        <div className="adready-container adready-header-inner">
          <a href="/" aria-label="صفحه اصلی آرایه" className="adready-logo-link">
            <Logo size="sm" />
          </a>
          <nav aria-label="بخش‌های صفحه">
            <a href="#examples">نمونه‌ها</a>
            <a href="#how-it-works">چطور کار می‌کند؟</a>
            <a href="#difference">تفاوت</a>
            <a href="#pricing">قیمت</a>
            <a href="#faq">سوالات</a>
          </nav>
          <div className="adready-header-actions">
            <a href={buildAdReadyLoginUrl({ mode: "login" })} className="adready-header-login">
              ورود
            </a>
            <AdReadyCta
              location="header"
              label="پیش‌نمایش رایگان"
              className="adready-header-cta"
            />
          </div>
        </div>
      </header>

      <main>
        <section className="adready-hero">
          <div className="adready-container adready-hero-stack">
            <div className="adready-hero-copy is-centered">
              <p className="adready-hero-eyebrow">AdReady — صفحه آماده تبلیغ</p>
              <div className="adready-kicker">
                مناسب تبلیغات گوگل، یکتانت، تلگرام و اینستاگرام
              </div>
              <h1>
                قبل از تبلیغ، صفحه‌ای بساز که{" "}
                <span className="adready-highlight">آماده گرفتن تماس و سفارش</span>
                {" "}باشد
              </h1>
              <p className="adready-hero-subhead">
                اطلاعات کسب‌وکارت را وارد کن؛ AdReady صفحه، متن، فرم درخواست و
                راه‌های تماس را آماده می‌کند.
              </p>
              <div className="adready-hero-actions is-centered">
                <AdReadyCta location="hero" label="پیش‌نمایش رایگان بساز" />
                <a href="#how-it-works" className="adready-secondary-button">
                  چطور کار می‌کند؟
                </a>
              </div>
              <div className="adready-microcopy is-centered">
                <Check size={15} />
                پیش‌نمایش رایگان — پرداخت فقط برای انتشار
              </div>
            </div>
            <AdReadyHeroMockup />
          </div>
        </section>

        <section className="adready-spotlight">
          <div className="adready-container">
            <div className="adready-spotlight-grid">
              {spotlightCases.map(({ icon: Icon, title, text }) => (
                <article key={title} className="adready-spotlight-card">
                  <div className="adready-spotlight-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="examples" className="adready-showcase">
          <div className="adready-container">
            <SectionIntro
              eyebrow="نمونه‌های واقعی"
              title="این‌طور صفحه‌های تبلیغاتی با AdReady ساخته می‌شوند"
              text="سه نمونه از صنایع مختلف — هر کدام با فرم درخواست و دکمه تماس."
            />
            <AdReadySampleLandings />
          </div>
        </section>

        <section id="how-it-works" className="adready-steps">
          <div className="adready-container">
            <SectionIntro
              title="در ۴ مرحله صفحه را بساز و منتشر کن"
              text="از ورود اطلاعات تا دریافت درخواست مشتری، مسیر روشن و ساده است."
            />
            <div className="adready-quick-steps">
              {quickSteps.map((step) => (
                <article className="adready-quick-step" key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="difference" className="adready-difference">
          <div className="adready-container">
            <SectionIntro title="تبلیغ بدون صفحه مناسب، یعنی کلیک‌هایی که به تماس و سفارش نمی‌رسند" />
            <div className="adready-compare">
              <div className="adready-compare-col">
                <h3>صفحه‌ساز معمولی</h3>
                <ul>
                  {comparison.generic.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="adready-compare-col is-adready">
                <h3>AdReady</h3>
                <ul>
                  {comparison.adready.map((item) => (
                    <li key={item}>
                      <Check size={15} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="adready-pricing">
          <div className="adready-container">
            <SectionIntro
              eyebrow="قیمت"
              title="اول پیش‌نمایش را ببین، بعد برای انتشار پرداخت کن"
              text="پرداخت یک‌باره است — اشتراک ماهانه نداریم."
            />
            <div className="adready-plan-grid">
              {plans.map((plan) => (
                <article
                  key={plan.key}
                  className={`adready-plan${plan.featured ? " is-featured" : ""}`}
                >
                  {plan.badge ? <div className="adready-plan-badge">{plan.badge}</div> : null}
                  <div className="adready-plan-name">{plan.name}</div>
                  <div className="adready-plan-price">
                    <strong>{plan.price}</strong>
                  </div>
                  {plan.note ? <p className="adready-plan-note">{plan.note}</p> : null}
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check size={15} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <AdReadyCta
                    location={`pricing_${plan.key}`}
                    label={plan.cta}
                    className={
                      plan.featured
                        ? "adready-plan-button is-primary"
                        : "adready-plan-button"
                    }
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="adready-faq">
          <div className="adready-container adready-faq-layout">
            <div className="adready-faq-heading">
              <span>سوالات متداول</span>
              <h2>پیش از شروع</h2>
              <p>
                پیش‌نمایش رایگان است. تا زمانی که خودت نخواهی، صفحه منتشر
                نمی‌شود.
              </p>
              <div className="adready-faq-icon">
                <MousePointerClick size={26} />
              </div>
            </div>
            <div className="adready-faq-list">
              {adReadyFaq.map((item) => (
                <details key={item.question}>
                  <summary>
                    {item.question}
                    <ChevronDown size={18} />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="adready-final">
          <div className="adready-container adready-final-inner">
            <span>AdReady — صفحه آماده تبلیغ</span>
            <h2>قبل از تبلیغ، صفحه‌ات را آماده کن</h2>
            <p>
              پیش‌نمایش را رایگان بساز. اگر خروجی مناسب بود، برای انتشار
              پرداخت کن.
            </p>
            <AdReadyCta location="final" label="پیش‌نمایش رایگان بساز" />
            <small>پرداخت یک‌باره — فقط برای انتشار</small>
          </div>
        </section>
      </main>

      <Footer />

      <div className="adready-sticky-cta">
        <AdReadyCta
          location="mobile_sticky"
          label="پیش‌نمایش رایگان بساز"
          className="adready-sticky-button"
          showArrow={false}
        />
      </div>
    </div>
  );
}
