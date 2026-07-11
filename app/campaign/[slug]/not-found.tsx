import Link from "next/link";
import { FileQuestion } from "lucide-react";
import styles from "./publicState.module.css";

export default function PublicCampaignNotFound() {
  return (
    <main className={styles.state} dir="rtl">
      <div>
        <span><FileQuestion size={30} /></span>
        <h1>این صفحه کمپین در دسترس نیست.</h1>
        <p>ممکن است هنوز منتشر نشده، بایگانی شده یا مهلت آن به پایان رسیده باشد.</p>
        <Link href="/adready">آشنایی با کمپین‌ساز آرایه</Link>
      </div>
    </main>
  );
}
