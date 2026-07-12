"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import type { CampaignPresentationContent } from "@/lib/adreadyPresentation";
import {
  normalizeAdReadyTemplateKey,
  normalizeAdReadyThemeKey,
} from "@/lib/adreadyPresentation";
import { toLatin } from "@/lib/validateContact";
import CampaignLeadForm from "./CampaignLeadForm";
import { useCampaignTracking } from "./CampaignPageTracker";
import CampaignHeroVariants from "./CampaignHeroVariants";
import CampaignObjectionsSection from "./CampaignObjectionsSection";
import CampaignTrustBar from "./CampaignTrustBar";
import styles from "./campaignPage.module.css";

type ContactInfo = {
  contactPhone?: string | null;
  whatsappNumber?: string | null;
  telegramUsername?: string | null;
};

const TEMPLATE_CLASS = {
  "clean-service": styles.templateClean,
  "local-business": styles.templateLocal,
  "online-shop": styles.templateShop,
  clinic: styles.templateClinic,
  education: styles.templateEducation,
  saas: styles.templateSaas,
} as const;

const THEME_CLASS = {
  default: styles.themeDefault,
  dark: styles.themeDark,
  premium: styles.themePremium,
  warm: styles.themeWarm,
  minimal: styles.themeMinimal,
} as const;

function phoneHref(value?: string | null): string | null {
  if (!value) return null;
  const safe = toLatin(value).replace(/[^\d+]/g, "");
  return safe.length >= 7 ? `tel:${safe}` : null;
}

function whatsappHref(value: string | null | undefined, message: string): string | null {
  if (!value) return null;
  let digits = toLatin(value).replace(/\D/g, "");
  if (digits.startsWith("09")) digits = `98${digits.slice(1)}`;
  if (digits.startsWith("0098")) digits = digits.slice(2);
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function telegramHref(value?: string | null): string | null {
  if (!value) return null;
  const username = value.trim().replace(/^@/, "");
  return /^[a-zA-Z0-9_]{5,32}$/.test(username)
    ? `https://t.me/${username}`
    : null;
}

export default function CampaignPageView({
  content,
  businessName,
  campaignGoal,
  city,
  priceRange,
  templateKey,
  themeKey,
  contacts,
  publicSlug,
  campaignPageId,
  isPreview = false,
  showAdCopyAngles = false,
}: {
  content: CampaignPresentationContent;
  businessName?: string | null;
  campaignGoal?: string | null;
  city?: string | null;
  priceRange?: string | null;
  templateKey?: string | null;
  themeKey?: string | null;
  contacts: ContactInfo;
  publicSlug?: string;
  campaignPageId?: string;
  isPreview?: boolean;
  showAdCopyAngles?: boolean;
}) {
  const tracking = useCampaignTracking();
  const template = normalizeAdReadyTemplateKey(templateKey);
  const theme = normalizeAdReadyThemeKey(themeKey);
  const call = phoneHref(contacts.contactPhone);
  const whatsapp = whatsappHref(contacts.whatsappNumber, content.whatsappMessage);
  const telegram = telegramHref(contacts.telegramUsername);
  const ctaHref = publicSlug ? "#lead-form" : call || whatsapp || telegram || "#";

  return (
    <article
      className={`${styles.campaign} ${TEMPLATE_CLASS[template]} ${THEME_CLASS[theme]}`}
      dir="rtl"
    >
      {isPreview && (
        <div className={styles.previewWatermark} role="status">
          پیش‌نمایش رایگان — برای انتشار عمومی یکی از پلن‌ها را انتخاب کنید
        </div>
      )}
      <header className={styles.brandBar}>
        <a href="#top" className={styles.publicBrand}>
          <span><Sparkles size={15} /></span>
          <strong>{businessName || "صفحه کمپین"}</strong>
        </a>
        <a
          className={styles.headerCta}
          href={ctaHref}
          onClick={() => tracking?.onCtaClick("header")}
        >
          {content.ctaText}
          <ArrowLeft size={15} />
        </a>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <i />
            {campaignGoal || "پیشنهاد ویژه"}
          </span>
          <h1>{content.headline}</h1>
          <p>{content.subheadline}</p>
          <div className={styles.heroActions}>
            <a
              className={styles.primaryCta}
              href={ctaHref}
              onClick={() => tracking?.onCtaClick("hero")}
            >
              {content.ctaText}
              <ArrowLeft size={18} />
            </a>
            {(call || whatsapp || telegram) && (
              <span className={styles.heroMicrocopy}>راه ارتباط مستقیم در دسترس است</span>
            )}
          </div>
        </div>
        <CampaignHeroVariants
          template={template}
          businessName={businessName}
          ctaText={content.ctaText}
          city={city}
          priceRange={priceRange}
          benefits={content.benefits}
        />
      </section>

      <CampaignTrustBar
        city={city}
        hasDirectContact={Boolean(call || whatsapp || telegram)}
      />

      {content.problemBullets.length > 0 && (
        <section className={`${styles.section} ${styles.problemSection}`}>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionNumber}>۰۱</span>
            <div>
              <span className={styles.sectionKicker}>مسئله مخاطب</span>
              <h2>اگر این دغدغه‌ها برایتان آشناست...</h2>
            </div>
          </div>
          <div className={styles.problemGrid}>
            {content.problemBullets.map((item, index) => (
              <article key={`${item}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={`${styles.section} ${styles.benefitsSection}`}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionNumber}>۰۲</span>
          <div>
            <span className={styles.sectionKicker}>ارزش پیشنهادی</span>
            <h2>آنچه با این پیشنهاد دریافت می‌کنید</h2>
          </div>
        </div>
        <div className={styles.benefitGrid}>
          {content.benefits.map((item, index) => (
            <article key={`${item}-${index}`}>
              <CheckCircle2 size={22} />
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      {(content.offerSection.title ||
        content.offerSection.description ||
        content.offerSection.bullets.length > 0) && (
        <section className={`${styles.section} ${styles.offerSection}`}>
          <div className={styles.offerCopy}>
            <span className={styles.sectionKicker}>پیشنهاد کمپین</span>
            <h2>{content.offerSection.title}</h2>
            <p>{content.offerSection.description}</p>
            <a href={ctaHref} onClick={() => tracking?.onCtaClick("offer")}>
              {content.ctaText}
              <ArrowLeft size={17} />
            </a>
          </div>
          {content.offerSection.bullets.length > 0 && (
            <ul>
              {content.offerSection.bullets.map((item, index) => (
                <li key={`${item}-${index}`}>
                  <span><Check size={16} /></span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <CampaignObjectionsSection objections={content.objections} />

      <section className={`${styles.section} ${styles.conversionSection}`}>
        <div className={styles.conversionCopy}>
          <span className={styles.sectionKicker}>قدم بعدی</span>
          <h2>برای دریافت جزئیات آماده‌اید؟</h2>
          <p>
            مشخصات تماس را ثبت کنید تا ادامه مسیر برایتان شفاف و سریع پیگیری شود.
          </p>
          <div className={styles.contactLinks}>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                onClick={() => tracking?.onWhatsappClick()}
              >
                <MessageCircle size={18} />
                واتساپ
              </a>
            )}
            {telegram && (
              <a
                href={telegram}
                target="_blank"
                rel="noreferrer"
                onClick={() => tracking?.onTelegramClick()}
              >
                <Send size={18} />
                تلگرام
              </a>
            )}
            {call && (
              <a href={call} onClick={() => tracking?.onCallClick()}>
                <Phone size={18} />
                تماس
              </a>
            )}
          </div>
        </div>
        <div id="lead-form" className={styles.formWrap}>
          {publicSlug ? (
            <CampaignLeadForm
              slug={publicSlug}
              campaignPageId={campaignPageId}
              title={content.formTitle}
              ctaText={content.ctaText}
              thankYouMessage={content.thankYouMessage}
              whatsappHref={whatsapp}
              onFormStart={() => tracking?.onFormStart()}
            />
          ) : (
            <div className={styles.leadForm}>
              <div className={styles.formHeading}>
                <span>نمونه فرم لید</span>
                <h2>{content.formTitle || "برای دریافت اطلاعات فرم را تکمیل کنید"}</h2>
              </div>
              <label>
                <span>نام و نام خانوادگی</span>
                <input disabled placeholder="نام شما" />
              </label>
              <label>
                <span>شماره موبایل</span>
                <input disabled dir="ltr" placeholder="0912 123 4567" />
              </label>
              <button type="button" disabled>{content.ctaText}</button>
            </div>
          )}
        </div>
      </section>

      {content.faq.length > 0 && (
        <section className={`${styles.section} ${styles.faqSection}`}>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionNumber}>۰۳</span>
            <div>
              <span className={styles.sectionKicker}>پرسش‌های پرتکرار</span>
              <h2>پیش از اقدام، پاسخ سؤال‌هایتان را ببینید</h2>
            </div>
          </div>
          <div className={styles.faqList}>
            {content.faq.map((item, index) => (
              <details key={`${item.question}-${index}`} open={index === 0}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {showAdCopyAngles && content.adCopyAngles.length > 0 && (
        <section className={`${styles.section} ${styles.adCopySection}`}>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionNumber}>AD</span>
            <div>
              <span className={styles.sectionKicker}>دارایی تبلیغاتی</span>
              <h2>زاویه‌های پیشنهادی برای تبلیغ</h2>
            </div>
          </div>
          <div className={styles.adCopyGrid}>
            {content.adCopyAngles.map((item, index) => (
              <article key={`${item.angle}-${index}`}>
                <span>{item.channel}</span>
                <strong>{item.angle}</strong>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className={styles.campaignFooter}>
        <strong>{businessName || "صفحه کمپین"}</strong>
        <span>{isPreview ? "پیش‌نمایش کمپین‌ساز آرایه" : "ساخته‌شده با کمپین‌ساز آرایه"}</span>
      </footer>

      <div className={styles.mobileSticky}>
        <a href={ctaHref} onClick={() => tracking?.onCtaClick("mobile_sticky")}>
          {content.ctaText}
        </a>
        {call && (
          <a
            href={call}
            aria-label="تماس مستقیم"
            onClick={() => tracking?.onCallClick()}
          >
            <Phone size={19} />
          </a>
        )}
      </div>
    </article>
  );
}
