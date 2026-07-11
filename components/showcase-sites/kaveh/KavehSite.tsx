import Image from "next/image";
import ShowcaseNotice from "@/components/showcase-sites/shared/ShowcaseNotice";
import {
  kavehBenefits,
  kavehContact,
  kavehExamples,
  kavehFaq,
  kavehImages,
  kavehNav,
  kavehProcess,
  kavehProducts,
} from "@/lib/showcaseSites/kaveh/config";
import KavehNav from "./KavehNav";
import KavehQuoteForm from "./KavehQuoteForm";
import styles from "./kaveh.module.css";

export default function KavehSite() {
  return (
    <div className={styles.site} id="top">
      <KavehNav />

      <section className={styles.hero} aria-labelledby="kaveh-hero-title">
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div>
            <p className={styles.eyebrow}>فروش و تأمین آهن‌آلات</p>
            <h1 id="kaveh-hero-title">استعلام قیمت آهن‌آلات ساختمانی</h1>
            <p className={styles.heroDesc}>
              میلگرد، تیرآهن، ورق و سایر مقاطع فولادی — محصول و مقدار را ثبت کنید تا
              قیمت و شرایط ارسال را دریافت کنید.
            </p>
            <div className={styles.heroActions}>
              <a href="#quote" className={styles.btnPrimary}>
                ثبت درخواست استعلام
              </a>
              <a href="#products" className={styles.btnSecondary}>
                مشاهده محصولات
              </a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <Image
              src={kavehImages.hero}
              alt={kavehImages.heroAlt}
              width={700}
              height={560}
              className={styles.heroImage}
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <div className={styles.floatCard}>
              <strong>پاسخ سریع کارشناس</strong>
              <span>هماهنگی تلفنی پس از ثبت درخواست</span>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className={styles.section} aria-labelledby="kaveh-products-title">
        <div className={styles.wrap}>
          <h2 id="kaveh-products-title" className={styles.sectionTitle}>
            محصولات
          </h2>
          <p className={styles.sectionDesc}>
            انواع مقاطع فولادی ساختمانی و صنعتی — برای استعلام قیمت، نوع محصول و مشخصات
            را در فرم ثبت کنید.
          </p>
          <div className={styles.productGrid}>
            {kavehProducts.map((product) => (
              <a key={product.id} href="#quote" className={styles.productCard}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className={styles.productImage}
                  sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 25vw"
                />
                <div className={styles.productBody}>
                  <h3>{product.name}</h3>
                  <p>{product.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="quote" className={styles.quoteSection} aria-labelledby="kaveh-quote-title">
        <div className={`${styles.wrap} ${styles.quoteGrid}`}>
          <div className={styles.quoteIntro}>
            <h2 id="kaveh-quote-title">استعلام قیمت</h2>
            <p>
              نوع محصول، سایز، مقدار و شهر مقصد را وارد کنید. کارشناس فروش پس از بررسی
              درخواست، قیمت و شرایط را اعلام می‌کند.
            </p>
            <div className={styles.contactInfo}>
              <div className={styles.infoBlock}>
                <strong>تلفن</strong>
                <a href={kavehContact.phoneTel} dir="ltr">
                  {kavehContact.phone}
                </a>
              </div>
              <div className={styles.infoBlock}>
                <strong>آدرس انبار</strong>
                <p>{kavehContact.address}</p>
              </div>
            </div>
          </div>
          <KavehQuoteForm />
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionSteel}`} aria-labelledby="kaveh-benefits-title">
        <div className={styles.wrap}>
          <h2 id="kaveh-benefits-title" className={styles.sectionTitle}>
            مزایای ثبت درخواست آنلاین
          </h2>
          <div className={styles.benefitGrid}>
            {kavehBenefits.map((item) => (
              <div key={item} className={styles.benefitItem}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="kaveh-process-title">
        <div className={styles.wrap}>
          <h2 id="kaveh-process-title" className={styles.sectionTitle}>
            مراحل ثبت سفارش
          </h2>
          <p className={styles.sectionDesc}>
            از ثبت درخواست تا هماهنگی ارسال — هر مرحله شفاف و قابل‌پیگیری است.
          </p>
          <ol className={styles.processList}>
            {kavehProcess.map((step) => (
              <li key={step} className={styles.processItem}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionSteel}`} aria-labelledby="kaveh-examples-title">
        <div className={styles.wrap}>
          <h2 id="kaveh-examples-title" className={styles.sectionTitle}>
            نمونه سفارش‌ها
          </h2>
          <p className={styles.sectionDesc}>
            برای ثبت درخواست دقیق‌تر، از این نمونه‌ها الگو بگیرید.
          </p>
          <ul className={styles.exampleList}>
            {kavehExamples.map((item) => (
              <li key={item} className={styles.exampleItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="delivery" className={styles.section} aria-labelledby="kaveh-delivery-title">
        <div className={`${styles.wrap} ${styles.deliveryGrid}`}>
          <div>
            <h2 id="kaveh-delivery-title" className={styles.sectionTitle}>
              نحوه ارسال
            </h2>
            <p className={styles.sectionDesc}>
              ارسال آهن‌آلات بر اساس نوع کالا، وزن و مقصد هماهنگ می‌شود.
            </p>
            <div className={styles.deliveryPoints}>
              <p className={styles.deliveryPoint}>هماهنگی زمان بارگیری پس از تأیید سفارش</p>
              <p className={styles.deliveryPoint}>ارسال تا مقصد پروژه در سراسر کشور</p>
              <p className={styles.deliveryPoint}>محاسبه هزینه حمل بر اساس وزن و مسافت</p>
              <p className={styles.deliveryPoint}>امکان تحویل چند محصول در یک بار ارسال</p>
            </div>
            <div className={styles.heroActions} style={{ marginTop: "1.5rem" }}>
              <a href="#quote" className={styles.btnPrimary}>
                ثبت درخواست ارسال
              </a>
            </div>
          </div>
          <Image
            src={kavehImages.products.delivery}
            alt="بارگیری و ارسال آهن‌آلات"
            width={600}
            height={450}
            className={styles.deliveryImage}
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>
      </section>

      <section id="faq" className={`${styles.section} ${styles.sectionSteel}`} aria-labelledby="kaveh-faq-title">
        <div className={styles.wrap}>
          <h2 id="kaveh-faq-title" className={styles.sectionTitle}>
            سوالات متداول
          </h2>
          <div className={styles.faqList}>
            {kavehFaq.map((item) => (
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

      <section className={styles.ctaBand} aria-labelledby="kaveh-cta-title">
        <div className={styles.wrap}>
          <h2 id="kaveh-cta-title">همین حالا استعلام بگیرید</h2>
          <p>قیمت روز آهن‌آلات را با ثبت مشخصات دقیق دریافت کنید.</p>
          <div className={styles.heroActions}>
            <a href="#quote" className={styles.btnPrimary}>
              فرم استعلام قیمت
            </a>
            <a href={kavehContact.whatsapp} className={styles.btnSecondary} target="_blank" rel="noopener noreferrer">
              واتساپ
            </a>
          </div>
        </div>
      </section>

      <footer id="contact" className={styles.footer}>
        <div className={styles.wrap}>
          <div className={styles.footerGrid}>
            <div>
              <h3>آهن کاوه</h3>
              <p>
                فروش و تأمین آهن‌آلات ساختمانی — میلگرد، تیرآهن، ورق و سایر مقاطع
                فولادی با امکان استعلام قیمت آنلاین.
              </p>
            </div>
            <div>
              <h3>دسترسی سریع</h3>
              {kavehNav.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
            <div>
              <h3>تماس</h3>
              <a href={kavehContact.phoneTel}>{kavehContact.phone}</a>
              <a href={kavehContact.whatsapp} target="_blank" rel="noopener noreferrer">
                واتساپ
              </a>
              <p>{kavehContact.address}</p>
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
