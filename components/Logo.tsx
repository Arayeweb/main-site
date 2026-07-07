import React from "react";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  tone?: "default" | "light";
};

export default function Logo({
  size = "md",
  showTagline = false,
  className = "",
  tone = "default",
}: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 18, sub: 10, gap: 2.5 },
    md: { icon: 36, text: 20, sub: 11, gap: 3 },
    lg: { icon: 44, text: 26, sub: 13, gap: 3.5 },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-${s.gap} ${className}`}>
      <img
        src="/assets/logo-icon.svg"
        alt="آرایه"
        width={s.icon}
        height={s.icon}
        className="shrink-0"
      />

      <div className="flex flex-col">
        <span
          className={`font-extrabold leading-none tracking-tight ${
            tone === "light" ? "text-white" : "text-navy-900"
          }`}
          style={{ fontSize: s.text }}
        >
          آرایه
        </span>
        {showTagline && (
          <span
            className={`leading-none ${tone === "light" ? "text-white/60" : "text-navy-400"}`}
            style={{ fontSize: s.sub }}
          >
            توسعه نرم‌افزار
          </span>
        )}
      </div>
    </div>
  );
}
