import Image from "next/image";
import DemoNotice from "@/components/showdemoto/shared/DemoNotice";
import {
  sfBeforeAfter,
  sfBrand,
  sfContact,
  sfFaq,
  sfFeaturedServices,
  sfImages,
  sfNav,
  sfProcessSteps,
  sfStats,
  sfTestimonials,
  sfValues,
} from "@/lib/showdemoto/salamat-farda/config";
import SalamatFardaContactForm from "./SalamatFardaContactForm";
import SalamatFardaNav from "./SalamatFardaNav";
import SalamatFardaServicesCarousel from "./SalamatFardaServicesCarousel";
import styles from "./salamat-farda.module.css";

export default function SalamatFardaSite() {
  return (
    <div className={styles.site} id="top">
      <div className={styles.demoBar}>
        <div className={styles.wrap}>
          <DemoNotice />
        </div>
      </div>

      <SalamatFardaNav />

      <section className={styles.hero} aria-labelledby="sf-hero-title">
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div>
            <p className={styles.eyebrow}>{sfBrand.hospital}</p>
            <h1 id="sf-hero-title">{sfBrand.name}</h1>
            <p className={styles.heroDesc}>{sfBrand.tagline}</p>
            <div className={styles.heroActions}>
              <a href="#contact" className={styles.btnPrimary}>
                مشاوره رایگان
              </a>
              <a href="#services" className={styles.btnSecondary}>
                مشاهده خدمات
              </a>
              <a
                href={sfContact.instagram}
                className={styles.btnGhost}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sfBrand.instagram}
              </a>
            </div>

            <div className={styles.values}>
              {sfValues.map((value) => (
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
                src={sfImages.hero}
                alt={sfImages.heroAlt}
                width={700}
                height={875}
                className={styles.heroImage}
                priority
                sizes="(max-width: 960px) 100vw, 45vw"
              />
              <div className={styles.floatCard}>
                <div className={styles.floatIcon} aria-hidden="true">
                  ✦
                </div>
                <div>
                  <strong>مشاوره رایگان</strong>
                  <span>نوبت‌دهی از طریق تلگرام و تماس تلفنی</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt} aria-label="آمار کلینیک">
        <div className={styles.wrap}>
          <div className={styles.stats}>
            {sfStats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className={styles.section} aria-labelledby="sf-services-title">
        <div className={styles.wrap}>
          <h2 id="sf-services-title" className={styles.sectionTitle}>
            خدمات <span className={styles.sectionTitleGold}>تخصصی</span>
          </h2>
          <p className={styles.sectionDesc}>
            از جراحی پلک و طراحی چشم تا خدمات زیبایی — هر خدمت با برنامه‌ریزی دقیق و
            مراقبت کامل ارائه می‌شود.
          </p>
          <SalamatFardaServicesCarousel />
          <div className={styles.serviceGrid}>
            {sfFeaturedServices.map((service) => (
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

      <section id="gallery" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="sf-gallery-title">
        <div className={styles.wrap}>
          <h2 id="sf-gallery-title" className={styles.sectionTitle}>
            قبل و <span className={styles.sectionTitleGold}>بعد</span>
          </h2>
          <p className={styles.sectionDesc}>
            نمونه نتایج جراحی‌های انجام‌شده — تصاویر واقعی پس از تأیید مشتری جایگزین
            می‌شوند.
          </p>
          <div className={styles.galleryGrid}>
            {sfBeforeAfter.map((item) => (
              <article key={item.id} className={styles.galleryCard}>
                <div className={styles.galleryPlaceholder}>
                  <span className={styles.galleryLabel}>BEFORE / AFTER</span>
                </div>
                <div className={styles.galleryOverlay}>
                  <h3>{item.title}</h3>
                  <p>{item.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className={styles.section} aria-labelledby="sf-about-title">
        <div className={`${styles.wrap} ${styles.aboutGrid}`}>
          <Image
            src={sfImages.surgeon}
            alt={sfImages.surgeonAlt}
            width={600}
            height={750}
            className={styles.aboutImage}
            sizes="(max-width: 768px) 100vw, 45vw"
          />
          <div>
            <h2 id="sf-about-title" className={styles.sectionTitle}>
              تخصص، دقت، <span className={styles.sectionTitleGold}>آرامش بینایی</span>
            </h2>
            <p className={styles.sectionDesc}>
              مرکز تخصصی چشم بیمارستان سلامت فردا با تیمی از جراحان مجرب، خدمات جراحی
              پلک، زیبایی چشم و مراقبت‌های تخصصی را با بالاترین استانداردها ارائه
              می‌دهد.
            </p>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>مشاوره رایگان قبل از هر مداخله</li>
              <li className={styles.featureItem}>طراحی اختصاصی پلک متناسب با آناتومی صورت</li>
              <li className={styles.featureItem}>استفاده از تکنیک بخیه لیزری</li>
              <li className={styles.featureItem}>پیگیری کامل پس از عمل</li>
              <li className={styles.featureItem}>پشتیبانی ۲۴ ساعته از طریق تلگرام</li>
            </ul>
            <div className={styles.heroActions} style={{ marginTop: "1.5rem" }}>
              <a href="#contact" className={styles.btnPrimary}>
                رزرو نوبت
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="sf-process-title">
        <div className={styles.wrap}>
          <h2 id="sf-process-title" className={styles.sectionTitle}>
            مسیر <span className={styles.sectionTitleGold}>درمان</span>
          </h2>
          <p className={styles.sectionDesc}>
            از مشاوره اولیه تا پیگیری نهایی — هر مرحله شفاف و قابل‌پیگیری است.
          </p>
          <div className={styles.steps}>
            {sfProcessSteps.map((step) => (
              <article key={step.step} className={styles.stepCard}>
                <span className={styles.stepNum}>{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="sf-testimonials-title">
        <div className={styles.wrap}>
          <h2 id="sf-testimonials-title" className={styles.sectionTitle}>
            رضایت <span className={styles.sectionTitleGold}>مراجعین</span>
          </h2>
          <p className={styles.sectionDesc}>
            نظرات مراجعین — نمونه‌های مفهومی برای نمایش ساختار بخش نظرات.
          </p>
          <div className={styles.testimonialGrid}>
            {sfTestimonials.map((item) => (
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

      <section id="faq" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="sf-faq-title">
        <div className={styles.wrap}>
          <h2 id="sf-faq-title" className={styles.sectionTitle}>
            پرسش‌های <span className={styles.sectionTitleGold}>متداول</span>
          </h2>
          <div className={styles.faqList}>
            {sfFaq.map((item) => (
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

      <section id="contact" className={styles.section} aria-labelledby="sf-contact-title">
        <div className={`${styles.wrap} ${styles.contactGrid}`}>
          <div>
            <h2 id="sf-contact-title" className={styles.sectionTitle}>
              نوبت‌دهی و <span className={styles.sectionTitleGold}>تماس</span>
            </h2>
            <p className={styles.sectionDesc}>
              فرم را پر کنید یا از راه‌های تماس مستقیم استفاده کنید.
            </p>
            <div className={styles.contactInfo}>
              <div className={styles.infoBlock}>
                <strong>تلفن</strong>
                <a href={sfContact.phoneTel} dir="ltr">
                  {sfContact.phone}
                </a>
              </div>
              <div className={styles.infoBlock}>
                <strong>ساعات کاری</strong>
                <p>{sfContact.hours}</p>
              </div>
              <div className={styles.infoBlock}>
                <strong>آدرس</strong>
                <p>{sfContact.address}</p>
              </div>
              <div className={styles.infoBlock}>
                <strong>شبکه‌های اجتماعی</strong>
                <div className={styles.socialLinks}>
                  <a
                    href={sfContact.telegram}
                    className={styles.btnGhost}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    تلگرام
                  </a>
                  <a
                    href={sfContact.instagram}
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
          <SalamatFardaContactForm />
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <div className={styles.footerGrid}>
            <div>
              <h3>{sfBrand.name}</h3>
              <p>{sfBrand.hospital}</p>
              <p>{sfBrand.tagline}</p>
            </div>
            <div>
              <h3>دسترسی سریع</h3>
              {sfNav.slice(1).map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
            <div>
              <h3>تماس</h3>
              <a href={sfContact.phoneTel}>{sfContact.phone}</a>
              <a href={sfContact.telegram} target="_blank" rel="noopener noreferrer">
                تلگرام — نوبت‌دهی
              </a>
              <a href={sfContact.instagram} target="_blank" rel="noopener noreferrer">
                {sfBrand.instagram}
              </a>
            </div>
          </div>
          <div className={styles.footerNotice}>
            <DemoNotice />
          </div>
        </div>
      </footer>
    </div>
  );
}
