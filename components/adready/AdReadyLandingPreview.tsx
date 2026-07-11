import { MessageCircle, Phone, Send, Sparkles } from "lucide-react";
import type { AdReadyLandingSample } from "@/lib/adreadyLandingSamples";
import styles from "./adreadySampleLandings.module.css";

const THEME_CLASS = {
  warm: styles.themeWarm,
  dark: styles.themeDark,
  clean: styles.themeClean,
} as const;

export function AdReadyLandingPreview({
  sample,
  variant = "compact",
}: {
  sample: AdReadyLandingSample;
  variant?: "compact" | "featured";
}) {
  const isFeatured = variant === "featured";

  return (
    <article
      className={`${styles.card} ${THEME_CLASS[sample.theme]}${isFeatured ? ` ${styles.isFeatured}` : ""}`}
      aria-label={`نمونه صفحه ${sample.business}`}
    >
      <div className={styles.chrome}>
        <span />
        <span />
        <span />
        <small>araaye.com/campaign/{sample.slug}</small>
      </div>

      <div className={styles.page}>
        <div className={styles.brandBar}>
          <div className={styles.brandMark}>
            <span aria-hidden="true">
              <Sparkles size={isFeatured ? 12 : 10} />
            </span>
            <strong>{sample.business}</strong>
          </div>
          <span>{sample.cta}</span>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroMain}>
            <span className={styles.badge}>{sample.badge}</span>
            <h3>{sample.headline}</h3>
            <p>{sample.subhead}</p>

            <ul className={styles.benefits}>
              {sample.benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className={styles.form}>
              <span>نام و نام خانوادگی</span>
              <span>شماره موبایل</span>
              <button type="button">{sample.cta}</button>
            </div>

            <div className={styles.contacts}>
              <span>
                <Phone size={11} aria-hidden="true" />
                تماس
              </span>
              <span>
                <MessageCircle size={11} aria-hidden="true" />
                واتساپ
              </span>
              <span>
                <Send size={11} aria-hidden="true" />
                تلگرام
              </span>
            </div>
          </div>

          {isFeatured ? (
            <div className={styles.heroAside} aria-hidden="true">
              <div className={styles.asideCard}>
                <small>پیشنهاد کمپین</small>
                <strong>{sample.badge}</strong>
                <span />
                <span />
                <button type="button">{sample.cta}</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {!isFeatured ? (
        <div className={styles.meta}>
          <span>{sample.industry}</span>
          <p>فرم درخواست + دکمه تماس + منبع تبلیغ</p>
        </div>
      ) : null}
    </article>
  );
}
