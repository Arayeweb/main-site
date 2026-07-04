import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge: string;
  title: string;
  subtitle?: string;
  badgeClassName?: string;
  className?: string;
  dark?: boolean;
}

export default function SectionHeader({
  badge,
  title,
  subtitle,
  badgeClassName = "bg-brand-50 text-brand-600",
  className,
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center mb-10 sm:mb-14", className)}>
      <span className={cn("badge mb-4", badgeClassName)}>{badge}</span>
      <h2 className={cn("section-title", dark && "text-white")}>{title}</h2>
      {subtitle ? (
        <p className={cn("section-subtitle", dark && "text-navy-200")}>{subtitle}</p>
      ) : null}
    </div>
  );
}
