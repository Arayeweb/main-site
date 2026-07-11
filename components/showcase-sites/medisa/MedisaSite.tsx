import Image from "next/image";
import ShowcaseNotice from "@/components/showcase-sites/shared/ShowcaseNotice";
import {
  medisaApproach,
  medisaContact,
  medisaFeatured,
  medisaImages,
  medisaNav,
  medisaProjects,
  medisaServices,
} from "@/lib/showcaseSites/medisa/config";
import MedisaInquiryForm from "./MedisaInquiryForm";
import MedisaNav from "./MedisaNav";
import styles from "./medisa.module.css";

export default function MedisaSite() {
  return (
    <div className={styles.site} id="top">
      <MedisaNav />

      <section className={styles.hero} aria-labelledby="medisa-hero-title">
        <div className={styles.heroVisual}>
          <Image
            src={medisaImages.hero}
            alt={medisaImages.heroAlt}
            fill
            className={styles.heroImage}
            priority
            sizes="100vw"
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={styles.heroContent}>
            <div className={styles.wrap}>
              <p className={styles.eyebrow}>استودیو معماری مدیسا</p>
              <h1 id="medisa-hero-title">فضایی که با زندگی شما هم‌راستا می‌شود</h1>
              <p className={styles.heroDesc}>
                معماری، طراحی داخلی و بازسازی — با تمرکز بر نور، متریال و ارتباط فضاها
                برای زندگی روزمره.
              </p>
              <a href="#inquiry" className={styles.heroLink}>
                شروع همکاری
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className={styles.section} aria-labelledby="medisa-projects-title">
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>پروژه‌های منتخب</p>
          <h2 id="medisa-projects-title" className={styles.sectionTitle}>
            کارهای اخیر
          </h2>
          <p className={styles.sectionDesc}>
            نمونه‌های مفهومی از پروژه‌های مسکونی، اداری و ویلایی — هر کدام با رویکردی
            متفاوت به نور و فضا.
          </p>

          <div className={styles.projectGrid}>
            {medisaProjects.map((project) => (
              <a
                key={project.slug}
                href={project.slug === "courtyard" ? "#featured" : "#inquiry"}
                className={styles.projectItem}
              >
                <Image
                  src={project.image}
                  alt={project.alt}
                  fill
                  className={styles.projectImage}
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                <div className={styles.projectMeta}>
                  <p className={styles.projectCategory}>{project.category}</p>
                  <p className={styles.projectTitle}>{project.title}</p>
                  <p className={styles.projectLocation}>
                    {project.location} · {project.status}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="featured"
        className={`${styles.section} ${styles.featured}`}
        aria-labelledby="medisa-featured-title"
      >
        <div className={`${styles.wrap} ${styles.featuredGrid}`}>
          <div className={styles.featuredText}>
            <p className={styles.sectionLabel}>پروژه ویژه</p>
            <h2 id="medisa-featured-title">{medisaFeatured.title}</h2>
            <p className={styles.featuredType}>{medisaFeatured.type}</p>
            <p className={styles.featuredConcept}>{medisaFeatured.concept}</p>

            <dl className={styles.featuredDetails}>
              <div className={styles.featuredDetail}>
                <dt>چالش</dt>
                <dd>{medisaFeatured.challenge}</dd>
              </div>
              <div className={styles.featuredDetail}>
                <dt>رویکرد طراحی</dt>
                <dd>{medisaFeatured.approach}</dd>
              </div>
              <div className={styles.featuredDetail}>
                <dt>متریال</dt>
                <dd>{medisaFeatured.materials}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.featuredGallery}>
            <div className={styles.featuredGalleryMain}>
              <Image
                src={medisaImages.featured[0]}
                alt="نمای داخلی خانه حیاط مرکزی"
                width={800}
                height={600}
                className={styles.featuredGalleryImage}
                sizes="(max-width: 900px) 100vw, 45vw"
              />
            </div>
            <div className={styles.featuredGalleryRow}>
              <div className={styles.featuredGalleryThumb}>
                <Image
                  src={medisaImages.featured[1]}
                  alt="جزئیات فضای زندگی با نور طبیعی"
                  width={400}
                  height={267}
                  className={styles.featuredGalleryImage}
                  sizes="(max-width: 900px) 50vw, 22vw"
                />
              </div>
              <div className={styles.featuredGalleryThumb}>
                <Image
                  src={medisaImages.featured[2]}
                  alt="حیاط مرکزی و ارتباط فضاها"
                  width={400}
                  height={267}
                  className={styles.featuredGalleryImage}
                  sizes="(max-width: 900px) 50vw, 22vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className={styles.sectionTight} aria-labelledby="medisa-services-title">
        <div className={styles.wrapNarrow}>
          <p className={styles.sectionLabel}>خدمات</p>
          <h2 id="medisa-services-title" className={styles.sectionTitle}>
            آنچه انجام می‌دهیم
          </h2>

          <ul className={styles.serviceList}>
            {medisaServices.map((service, index) => (
              <li key={service} className={styles.serviceItem}>
                <span>{service}</span>
                <span className={styles.serviceIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="approach" className={styles.section} aria-labelledby="medisa-approach-title">
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>رویکرد ما</p>
          <h2 id="medisa-approach-title" className={styles.sectionTitle}>
            از ایده تا اجرا
          </h2>
          <p className={styles.sectionDesc}>
            هر پروژه با شناخت دقیق نیازها شروع می‌شود و تا مرحله اجرا همراهی می‌کنیم.
          </p>

          <ol className={styles.approachList}>
            {medisaApproach.map((step, index) => (
              <li key={step} className={styles.approachStep}>
                <span className={styles.approachNum}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className={styles.approachText}>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="studio" className={styles.section} aria-labelledby="medisa-studio-title">
        <div className={`${styles.wrap} ${styles.studioGrid}`}>
          <Image
            src={medisaImages.studio}
            alt={medisaImages.studioAlt}
            width={640}
            height={768}
            className={styles.studioImage}
            sizes="(max-width: 900px) 100vw, 50vw"
          />
          <div>
            <p className={styles.sectionLabel}>استودیو</p>
            <h2 id="medisa-studio-title" className={styles.sectionTitle}>
              درباره مدیسا
            </h2>
            <p className={styles.studioStatement}>
              استودیو معماری مدیسا با تمرکز بر طراحی مسکونی و فضاهای زندگی شکل گرفته است.
              ما معتقدیم معماری خوب باید در خدمت سبک زندگی باشد — نه برعکس. هر پروژه
              فرصتی است برای خلق فضایی که آرامش، نور و ارتباط معنادار میان فضاها را
              همزمان فراهم کند.
            </p>

            <dl className={styles.studioContact}>
              <div>
                <dt>تلفن</dt>
                <dd>
                  <a href={medisaContact.phoneTel} dir="ltr">
                    {medisaContact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt>اینستاگرام</dt>
                <dd>{medisaContact.instagram}</dd>
              </div>
              <div>
                <dt>آدرس</dt>
                <dd>{medisaContact.address}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        id="inquiry"
        className={`${styles.section} ${styles.inquiry}`}
        aria-labelledby="medisa-inquiry-title"
      >
        <div className={`${styles.wrap} ${styles.inquiryGrid}`}>
          <div>
            <p className={styles.sectionLabel}>شروع همکاری</p>
            <h2 id="medisa-inquiry-title" className={styles.sectionTitle}>
              درباره پروژه خود بگویید
            </h2>
            <p className={styles.sectionDesc}>
              فرم را پر کنید تا برای گفتگوی اولیه و برآورد زمان‌بندی با شما تماس بگیریم.
            </p>
          </div>
          <MedisaInquiryForm />
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <div className={styles.footerGrid}>
            <div>
              <h3>استودیو معماری مدیسا</h3>
              <p>
                معماری، طراحی داخلی و بازسازی — با تمرکز بر فضاهای مسکونی، اداری و ویلایی.
              </p>
            </div>
            <div>
              <h3>دسترسی سریع</h3>
              {medisaNav.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
            <div>
              <h3>تماس</h3>
              <a href={medisaContact.phoneTel}>{medisaContact.phone}</a>
              <p>{medisaContact.address}</p>
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
