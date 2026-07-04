import Link from "next/link";
import type { ComponentType } from "react";

export default function StudioHeader({
  icon: Icon,
  title,
  badge,
  backHref = "/ai",
  backLabel = "بازگشت",
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  badge?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="ar-studio-head">
      <span className="ar-studio-head-icon" aria-hidden>
        <Icon size={16} />
      </span>
      <h1 className="ar-studio-head-title">{title}</h1>
      {badge ? <span className="ar-studio-head-badge">{badge}</span> : null}
      <Link href={backHref} className="ar-studio-back">
        {backLabel}
      </Link>
    </header>
  );
}
