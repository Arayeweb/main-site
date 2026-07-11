import { SHOWCASE_NOTICE } from "@/lib/showcaseSites/notice";
import styles from "./showcase-notice.module.css";

export default function ShowcaseNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`${styles.notice} ${className}`.trim()} role="note">
      {SHOWCASE_NOTICE}
    </p>
  );
}
