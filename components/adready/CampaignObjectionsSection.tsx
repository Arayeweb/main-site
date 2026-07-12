import { ShieldCheck } from "lucide-react";
import type { CampaignPresentationContent } from "@/lib/adreadyPresentation";
import styles from "./campaignPage.module.css";

export default function CampaignObjectionsSection({
  objections,
}: {
  objections: CampaignPresentationContent["objections"];
}) {
  if (objections.length === 0) return null;

  return (
    <section className={`${styles.section} ${styles.objectionsSection}`}>
      <div className={styles.sectionIntro}>
        <span className={styles.sectionNumber}>۰۳</span>
        <div>
          <span className={styles.sectionKicker}>پیش از تصمیم</span>
          <h2>نگرانی‌های رایج، پاسخ‌های روشن</h2>
        </div>
      </div>
      <div className={styles.objectionsGrid}>
        {objections.map((item, index) => (
          <article key={`${item.objection}-${index}`}>
            <ShieldCheck size={21} />
            <div>
              <strong>{item.objection}</strong>
              <p>{item.response}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
