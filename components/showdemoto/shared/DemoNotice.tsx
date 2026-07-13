import { SHOWDEMO_NOTICE } from "@/lib/showdemoto/notice";
import styles from "./demo-notice.module.css";

export default function DemoNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`${styles.notice} ${className}`.trim()} role="note">
      {SHOWDEMO_NOTICE}
    </p>
  );
}
