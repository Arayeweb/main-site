import { Clock3, MapPin, MessagesSquare, MousePointerClick } from "lucide-react";
import styles from "./campaignPage.module.css";

export default function CampaignTrustBar({
  city,
  hasDirectContact,
}: {
  city?: string | null;
  hasDirectContact: boolean;
}) {
  return (
    <section className={styles.trustBar} aria-label="مزایای ارتباط">
      {city && <span><MapPin size={17} />فعال در {city}</span>}
      <span><MousePointerClick size={17} />فرم درخواست سریع</span>
      {hasDirectContact && <span><MessagesSquare size={17} />ارتباط مستقیم</span>}
      <span><Clock3 size={17} />پیگیری آسان</span>
    </section>
  );
}
