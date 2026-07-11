import Image from "next/image";
import ShowcaseNotice from "@/components/showcase-sites/shared/ShowcaseNotice";
import {
  shivaConcerns,
  shivaContact,
  shivaFaq,
  shivaImages,
  shivaNav,
  shivaProcessSteps,
  shivaAidSteps,
  shivaServices,
} from "@/lib/showcaseSites/shiva/config";
import ShivaContactForm from "./ShivaContactForm";
import ShivaNav from "./ShivaNav";
import styles from "./shiva.module.css";

export default function ShivaSite() {
  return (
    <div className={styles.site} id="top">
      <ShivaNav />

      <section className={styles.hero} aria-labelledby="shiva-hero-title">
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div>
            <p className={styles.eyebrow}>کلینیک تخصصی شنوایی و سمعک</p>
            <h1 id="shiva-hero-title">صدای زندگی را واضح‌تر بشنوید</h1>
            <p className={styles.heroDesc}>
              ارزیابی شنوایی، مشاوره تخصصی و انتخاب سمعک متناسب با نیازهای شما؛ در
              محیطی آرام و با توضیحاتی روشن و قابل‌فهم.
            </p>
            <div className={styles.heroActions}>
              <a href="#contact" className={styles.btnPrimary}>
                دریافت وقت مشاوره
              </a>
              <a href="#services" className={styles.btnSecondary}>
                مشاهده خدمات
              </a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <svg className={styles.wave} viewBox="0 0 80 32" aria-hidden="true">
              <path
                d="M0 16 Q10 4 20 16 T40 16 T60 16 T80 16"
                fill="none"
                stroke="#c8784a"
                strokeWidth="2"
              />
              <path
                d="M0 22 Q10 10 20 22 T40 22 T60 22 T80 22"
                fill="none"
                stroke="#1a3348"
                strokeWidth="1.5"
                opacity="0.5"
              />
            </svg>
            <Image
              src={shivaImages.hero}
              alt={shivaImages.heroAlt}
              width={700}
              height={560}
              className={styles.heroImage}
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <div className={styles.floatCard}>
              <strong>وقت مشاوره موجود</strong>
              <span>هماهنگی تلفنی پس از ثبت درخواست</span>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className={styles.section} aria-labelledby="shiva-services-title">
        <div className={styles.wrap}>
          <h2 id="shiva-services-title" className={styles.sectionTitle}>
            خدمات کلینیک
          </h2>
          <p className={styles.sectionDesc}>
            از ارزیابی اولیه تا تنظیم و پیگیری سمعک؛ هر مرحله با توضیح شفاف و قابل‌پیگیری.
          </p>
          <div className={styles.serviceGrid}>
            {shivaServices.map((service) => (
              <a key={service.id} href="#contact" className={styles.serviceCard}>
                <span className={styles.serviceIcon} aria-hidden="true">
                  {service.icon}
                </span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="shiva-concerns-title">
        <div className={styles.wrap}>
          <h2 id="shiva-concerns-title" className={styles.sectionTitle}>
            چه زمانی بهتر است شنوایی خود را بررسی کنیم؟
          </h2>
          <ul className={styles.concernList}>
            {shivaConcerns.map((item) => (
              <li key={item} className={styles.concernItem}>
                {item}
              </li>
            ))}
          </ul>
          <div className={styles.heroActions} style={{ marginTop: "1.5rem" }}>
            <a href="#contact" className={styles.btnPrimary}>
              رزرو ارزیابی شنوایی
            </a>
          </div>
        </div>
      </section>

      <section id="hearing-aids" className={styles.section} aria-labelledby="shiva-aids-title">
        <div className={styles.wrap}>
          <h2 id="shiva-aids-title" className={styles.sectionTitle}>
            انتخاب سمعک فقط انتخاب یک دستگاه نیست
          </h2>
          <p className={styles.sectionDesc}>
            نوع کم‌شنوایی، سبک زندگی، محیط کار و توانایی استفاده روزمره باید در انتخاب
            سمعک در نظر گرفته شوند.
          </p>
          <div className={styles.steps}>
            {shivaAidSteps.map((step, index) => (
              <article key={step.title} className={styles.stepCard}>
                <span className={styles.stepNum}>مرحله {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="shiva-process-title">
        <div className={`${styles.wrap} ${styles.aboutGrid}`}>
          <div>
            <h2 id="shiva-process-title" className={styles.sectionTitle}>
              برای شروع چه کاری باید انجام دهید؟
            </h2>
            <ol className={styles.processList}>
              {shivaProcessSteps.map((step) => (
                <li key={step} className={styles.processItem}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <Image
            src={shivaImages.clinicInterior}
            alt={shivaImages.clinicInteriorAlt}
            width={600}
            height={450}
            className={styles.aboutImage}
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>
      </section>

      <section id="faq" className={styles.section} aria-labelledby="shiva-faq-title">
        <div className={styles.wrap}>
          <h2 id="shiva-faq-title" className={styles.sectionTitle}>
            پرسش‌های متداول
          </h2>
          <div className={styles.faqList}>
            {shivaFaq.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary>
                  {item.q}
                  <span className={styles.faqPlus} aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="shiva-contact-title">
        <div className={`${styles.wrap} ${styles.contactGrid}`}>
          <div>
            <h2 id="shiva-contact-title" className={styles.sectionTitle}>
              تماس و نوبت
            </h2>
            <p className={styles.sectionDesc}>
              فرم را پر کنید یا از راه‌های تماس مستقیم استفاده کنید.
            </p>
            <div className={styles.contactInfo}>
              <div className={styles.infoBlock}>
                <strong>تلفن</strong>
                <a href={shivaContact.phoneTel} dir="ltr">
                  {shivaContact.phone}
                </a>
              </div>
              <div className={styles.infoBlock}>
                <strong>ساعات کاری</strong>
                <p>{shivaContact.hours}</p>
              </div>
              <div className={styles.infoBlock}>
                <strong>آدرس</strong>
                <p>{shivaContact.address}</p>
              </div>
            </div>
          </div>
          <ShivaContactForm />
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <div className={styles.footerGrid}>
            <div>
              <h3>کلینیک شنوایی شیوا</h3>
              <p>
                مرکز ارزیابی شنوایی، تجویز سمعک و خدمات شنوایی‌شناسی با تمرکز بر
                توضیح شفاف و مسیر درمان قابل‌پیگیری.
              </p>
            </div>
            <div>
              <h3>دسترسی سریع</h3>
              {shivaNav.slice(1).map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
            <div>
              <h3>تماس</h3>
              <a href={shivaContact.phoneTel}>{shivaContact.phone}</a>
              <a href={shivaContact.whatsapp} target="_blank" rel="noopener noreferrer">
                واتساپ
              </a>
            </div>
          </div>
          <div className={styles.footerNotice}>
            <ShowcaseNotice />
          </div>
        </div>
      </footer>
    </div>
  );
}
