"use client";

import { pushGtmEvent } from "@/lib/gtm";

export default function CtaLink({
  href,
  className,
  children,
  location,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  location: string;
}) {
  const isPhone = href.startsWith("tel:");

  return (
    <a
      href={href}
      className={className}
      onClick={() =>
        pushGtmEvent(isPhone ? "phone_click" : "cta_click", { location })
      }
    >
      {children}
    </a>
  );
}
