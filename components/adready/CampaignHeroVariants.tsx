import {
  BarChart3,
  CalendarCheck,
  Check,
  GraduationCap,
  MapPin,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import type { AdReadyTemplateKey } from "@/lib/adreadyPresentation";
import styles from "./campaignPage.module.css";

export default function CampaignHeroVariants({
  template,
  businessName,
  ctaText,
  city,
  priceRange,
  benefits,
}: {
  template: AdReadyTemplateKey;
  businessName?: string | null;
  ctaText: string;
  city?: string | null;
  priceRange?: string | null;
  benefits: string[];
}) {
  const topBenefits = benefits.slice(0, 3);

  if (template === "local-business") {
    return (
      <div className={`${styles.heroArtifact} ${styles.localArtifact}`} aria-hidden="true">
        <div className={styles.localMark}><MapPin size={22} /></div>
        <small>{city || "در نزدیکی شما"}</small>
        <strong>{businessName || "کسب‌وکار شما"}</strong>
        <p>پاسخ‌گویی مستقیم و ثبت درخواست در چند ثانیه</p>
        <button type="button">{ctaText}</button>
      </div>
    );
  }

  if (template === "online-shop") {
    return (
      <div className={`${styles.heroArtifact} ${styles.shopArtifact}`} aria-hidden="true">
        <span className={styles.artifactBadge}>پیشنهاد محدود</span>
        <PackageCheck size={42} />
        <strong>{businessName || "پیشنهاد ویژه فروش"}</strong>
        <b>{priceRange || "قیمت ویژه کمپین"}</b>
        <ul>{topBenefits.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
        <button type="button">{ctaText}</button>
      </div>
    );
  }

  if (template === "clinic") {
    return (
      <div className={`${styles.heroArtifact} ${styles.clinicArtifact}`} aria-hidden="true">
        <div className={styles.clinicCalendar}>
          <CalendarCheck size={30} />
          <span>رزرو سریع</span>
        </div>
        <strong>{businessName || "مشاوره تخصصی"}</strong>
        <p>درخواست خود را ثبت کنید تا برای هماهنگی با شما تماس بگیریم.</p>
        <div><span>امروز</span><span>فردا</span><span>اولین زمان آزاد</span></div>
        <button type="button">{ctaText}</button>
      </div>
    );
  }

  if (template === "education") {
    return (
      <div className={`${styles.heroArtifact} ${styles.educationArtifact}`} aria-hidden="true">
        <GraduationCap size={38} />
        <small>مسیر یادگیری روشن</small>
        <strong>{businessName || "آموزش کاربردی"}</strong>
        <ol>{topBenefits.map((item, index) => <li key={item}><b>{index + 1}</b>{item}</li>)}</ol>
        <button type="button">{ctaText}</button>
      </div>
    );
  }

  if (template === "saas") {
    return (
      <div className={`${styles.heroArtifact} ${styles.saasArtifact}`} aria-hidden="true">
        <div className={styles.saasTop}><BarChart3 size={22} /><strong>{businessName || "داشبورد محصول"}</strong></div>
        <div className={styles.saasChart}><i /><i /><i /><i /><i /></div>
        <div className={styles.saasStats}>
          <span><b>۲۴/۷</b>دسترسی</span>
          <span><b>سریع</b>راه‌اندازی</span>
          <span><b>ساده</b>شروع</span>
        </div>
        <button type="button">{ctaText}</button>
      </div>
    );
  }

  return (
    <div className={styles.heroArtifact} aria-hidden="true">
      <div className={styles.artifactTop}><span /><span /><span /></div>
      <div className={styles.artifactBody}>
        <Sparkles size={28} />
        <strong>{businessName || "پیشنهاد شما"}</strong>
        {topBenefits.map((item) => <span key={item}>{item}</span>)}
        <button type="button">{ctaText}</button>
      </div>
    </div>
  );
}
