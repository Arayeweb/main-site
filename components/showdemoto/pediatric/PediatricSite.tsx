"use client";

import Image from "next/image";
import DemoNotice from "@/components/showdemoto/shared/DemoNotice";
import ShowDemoChatWidget, {
  type ShowDemoChatTheme,
} from "@/components/showdemoto/shared/ShowDemoChatWidget";
import {
  pedAgeGroups,
  pedBrand,
  pedChatConfig,
  pedContact,
  pedFaq,
  pedFeaturedServices,
  pedImages,
  pedNav,
  pedProcessSteps,
  pedStats,
  pedTestimonials,
  pedValues,
} from "@/lib/showdemoto/pediatric/config";
import PediatricContactForm from "./PediatricContactForm";
import PediatricNav from "./PediatricNav";
import styles from "./pediatric.module.css";

const chatTheme: ShowDemoChatTheme = {
  bg: "bg-[#4a9fd4]",
  hoverBg: "hover:bg-[#2b8cc4]",
  border: "border-[#c2dceb]",
  headerBg: "bg-gradient-to-l from-[#2b8cc4] to-[#4a9fd4]",
  botBubbleBg: "bg-[#eef7fc]",
  botBubbleText: "text-[#1f3a4d]",
  dot: "bg-[#4a9fd4]",
  badge: "bg-[#5bb98c]",
};

export default function PediatricSite() {
  return (
    <div className={styles.site} id="top">
      <div className={styles.demoBar}>
        <div className={styles.wrap}>
          <DemoNotice />
        </div>
      </div>

      <PediatricNav />

      <section className={styles.hero} aria-labelledby="ped-hero-title">
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div>
            <p className={styles.eyebrow}>متخصص اطفال و کودکان</p>
            <h1 id="ped-hero-title">{pedBrand.name}</h1>
            <p className={styles.heroDesc}>{pedBrand.tagline}</p>
            <div className={styles.heroActions}>
              <a href="#contact" className={styles.btnPrimary}>
                رزرو نوبت آنلاین
              </a>
              <a href="#services" className={styles.btnSecondary}>
                مشاهده خدمات
              </a>
              <a
                href={pedContact.instagram}
                className={styles.btnGhost}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pedBrand.instagram}
              </a>
            </div>

            <div className={styles.values}>
              {pedValues.map((value) => (
                <div key={value.label} className={styles.valueCard}>
                  <strong>{value.label}</strong>
                  <span>{value.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroImageWrap}>
              <Image
                src={pedImages.hero}
                alt={pedImages.heroAlt}
                width={700}
                height={875}
                className={styles.heroImage}
                priority
                sizes="(max-width: 960px) 100vw, 45vw"
              />
              <div className={styles.floatCard}>
                <div className={styles.floatIcon} aria-hidden="true">
                  ❤
                </div>
                <div>
                  <strong>نوبت‌دهی آنلاین</strong>
                  <span>چت‌بات، فرم سایت و تماس تلفنی</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt} aria-label="آمار مطب">
        <div className={styles.wrap}>
          <div className={styles.stats}>
            {pedStats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ages" className={styles.section} aria-labelledby="ped-ages-title">
        <div className={styles.wrap}>
          <h2 id="ped-ages-title" className={styles.sectionTitle}>
            مراقبت در هر <span className={styles.sectionAccent}>مرحله رشد</span>
          </h2>
          <p className={styles.sectionDesc}>
            از نوزادی تا نوجوانی — خدمات تخصصی متناسب با هر گروه سنی برای رشد سالم کودک شما.
          </p>
          <div className={styles.ageGrid}>
            {pedAgeGroups.map((group) => (
              <article key={group.id} className={styles.ageCard}>
                <div className={styles.ageIcon} aria-hidden="true">
                  {group.icon}
                </div>
                <h3>{group.title}</h3>
                <span className={styles.ageRange}>{group.age}</span>
                <p>{group.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="services"
        className={`${styles.section} ${styles.sectionAlt}`}
        aria-labelledby="ped-services-title"
      >
        <div className={styles.wrap}>
          <h2 id="ped-services-title" className={styles.sectionTitle}>
            خدمات <span className={styles.sectionAccent}>تخصصی اطفال</span>
          </h2>
          <p className={styles.sectionDesc}>
            از واکسیناسیون و پایش رشد تا درمان بیماری‌های شایع کودکی — همه با رویکرد دلسوزانه و
            قابل اعتماد.
          </p>
          <div className={styles.serviceGrid}>
            {pedFeaturedServices.map((service) => (
              <a key={service.id} href="#contact" className={styles.serviceCard}>
                {service.highlight ? (
                  <span className={styles.serviceBadge}>{service.highlight}</span>
                ) : null}
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className={styles.section} aria-labelledby="ped-about-title">
        <div className={`${styles.wrap} ${styles.aboutGrid}`}>
          <Image
            src={pedImages.doctor}
            alt={pedImages.doctorAlt}
            width={600}
            height={750}
            className={styles.aboutImage}
            sizes="(max-width: 768px) 100vw, 45vw"
          />
          <div>
            <h2 id="ped-about-title" className={styles.sectionTitle}>
              با <span className={styles.sectionAccent}>{pedBrand.doctor}</span> آشنا شوید
            </h2>
            <p className={styles.sectionDesc}>
              {pedBrand.doctor}، {pedBrand.title}، با بیش از ۱۲ سال تجربه در مراقبت از نوزادان و
              کودکان. رویکرد دکتر احمدی بر اساس برقراری ارتباط آرام با کودک و همراهی کامل والدین
              در مسیر سلامت است.
            </p>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>تخصص در نوزادان و بیماری‌های شایع کودکی</li>
              <li className={styles.featureItem}>واکسیناسیون طبق برنامه وزارت بهداشت با ثبت سوابق</li>
              <li className={styles.featureItem}>پایش منظم رشد و تکامل کودک</li>
              <li className={styles.featureItem}>مشاوره تخصصی شیردهی و تغذیه کودک</li>
              <li className={styles.featureItem}>نوبت‌دهی آنلاین و یادآوری پیامکی نوبت بعدی</li>
            </ul>
            <div className={styles.heroActions} style={{ marginTop: "1.5rem" }}>
              <a href="#contact" className={styles.btnPrimary}>
                رزرو نوبت
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        aria-labelledby="ped-process-title"
      >
        <div className={styles.wrap}>
          <h2 id="ped-process-title" className={styles.sectionTitle}>
            مسیر <span className={styles.sectionAccent}>ویزیت</span>
          </h2>
          <p className={styles.sectionDesc}>
            از رزرو نوبت تا پیگیری — هر مرحله شفاف و همراه با راهنمایی والدین.
          </p>
          <div className={styles.steps}>
            {pedProcessSteps.map((step) => (
              <article key={step.step} className={styles.stepCard}>
                <span className={styles.stepNum}>{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ped-testimonials-title">
        <div className={styles.wrap}>
          <h2 id="ped-testimonials-title" className={styles.sectionTitle}>
            نظرات <span className={styles.sectionAccent}>والدین</span>
          </h2>
          <p className={styles.sectionDesc}>
            تجربه خانواده‌هایی که فرزندانشان را به مطب سپردند — نمونه‌های مفهومی برای نمایش ساختار
            بخش نظرات.
          </p>
          <div className={styles.testimonialGrid}>
            {pedTestimonials.map((item) => (
              <blockquote key={item.id} className={styles.testimonialCard}>
                <p className={styles.testimonialQuote}>{item.quote}</p>
                <footer className={styles.testimonialMeta}>
                  <strong>{item.name}</strong>
                  <span>{item.service}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="ped-faq-title">
        <div className={styles.wrap}>
          <h2 id="ped-faq-title" className={styles.sectionTitle}>
            پرسش‌های <span className={styles.sectionAccent}>متداول</span>
          </h2>
          <div className={styles.faqList}>
            {pedFaq.map((item) => (
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

      <section id="contact" className={styles.section} aria-labelledby="ped-contact-title">
        <div className={`${styles.wrap} ${styles.contactGrid}`}>
          <div>
            <h2 id="ped-contact-title" className={styles.sectionTitle}>
              نوبت‌دهی و <span className={styles.sectionAccent}>تماس</span>
            </h2>
            <p className={styles.sectionDesc}>
              فرم را پر کنید یا از راه‌های تماس مستقیم استفاده کنید. همکاران مطب برای تأیید نوبت با
              شما تماس می‌گیرند.
            </p>
            <div className={styles.contactInfo}>
              <div className={styles.infoBlock}>
                <strong>تلفن</strong>
                <a href={pedContact.phoneTel} dir="ltr">
                  {pedContact.phone}
                </a>
              </div>
              <div className={styles.infoBlock}>
                <strong>ساعات کاری</strong>
                <p>{pedContact.hours}</p>
              </div>
              <div className={styles.infoBlock}>
                <strong>آدرس</strong>
                <p>{pedContact.address}</p>
              </div>
              <div className={styles.infoBlock}>
                <strong>شبکه‌های اجتماعی</strong>
                <div className={styles.socialLinks}>
                  <a
                    href={pedContact.telegram}
                    className={styles.btnGhost}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    تلگرام
                  </a>
                  <a
                    href={pedContact.instagram}
                    className={styles.btnGhost}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    اینستاگرام
                  </a>
                </div>
              </div>
            </div>
          </div>
          <PediatricContactForm />
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <div className={styles.footerGrid}>
            <div>
              <h3>{pedBrand.name}</h3>
              <p>{pedBrand.doctor}</p>
              <p>{pedBrand.title}</p>
              <p>{pedBrand.tagline}</p>
            </div>
            <div>
              <h3>دسترسی سریع</h3>
              {pedNav.slice(1).map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
            <div>
              <h3>تماس</h3>
              <a href={pedContact.phoneTel}>{pedContact.phone}</a>
              <a href={pedContact.telegram} target="_blank" rel="noopener noreferrer">
                تلگرام — نوبت‌دهی
              </a>
              <a href={pedContact.instagram} target="_blank" rel="noopener noreferrer">
                {pedBrand.instagram}
              </a>
            </div>
          </div>
          <div className={styles.footerNotice}>
            <DemoNotice />
          </div>
        </div>
      </footer>

      <ShowDemoChatWidget
        config={{
          ...pedChatConfig,
          faq: pedFaq,
          eventLabel: "dr-ahmadi-pediatric",
          intents: [
            { key: "hello", pattern: /سلام|درود|\bhi\b|hello/ },
            { key: "booking", pattern: /نوبت|رزرو|وقت|ویزیت|appointment/ },
            { key: "vaccine", pattern: /واکس|واکسی|تزریق|vacc/ },
            { key: "fever", pattern: /تب|درد|بیمار|عفونت|سرفه|سرماخورد/ },
            { key: "services", pattern: /خدمات|رشد|تغذیه|شیردهی|چکاپ/ },
            { key: "price", pattern: /قیمت|هزینه|تعرفه|بیمه|insurance/ },
            { key: "location", pattern: /آدرس|کجا|مسیر|نقشه|location/ },
            { key: "hours", pattern: /ساعت|زمان|کی باز|hours|open/ },
            { key: "insurance", pattern: /بیمه|پوشش|insurance/ },
            { key: "online", pattern: /آنلاین|تلفنی|ویدیو|online/ },
            { key: "emergency", pattern: /اورژانس|فوری|emergency|نوزاد|تب بالا/ },
          ],
        }}
        theme={chatTheme}
      />
    </div>
  );
}
