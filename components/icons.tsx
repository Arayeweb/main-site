import React from "react";

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
});

export function IconCode({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="m8 6-6 6 6 6" />
      <path d="m16 6 6 6-6 6" />
      <path d="m14 4-4 16" />
    </svg>
  );
}

export function IconGlobe({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function IconBot({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 8V4" />
      <circle cx="12" cy="4" r="1" />
      <circle cx="9" cy="13" r="1" />
      <circle cx="15" cy="13" r="1" />
      <path d="M9 17h6" />
    </svg>
  );
}

export function IconUsers({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconChart({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 4 5-5" />
    </svg>
  );
}

export function IconRocket({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.16 5-1 5-1" />
      <path d="M12 15v5s3.03-.55 4-2c1.16-1.62 1-5 1-5" />
    </svg>
  );
}

export function IconStethoscope({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .2.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}

export function IconBuilding({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  );
}

export function IconCart({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

export function IconAcademy({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

export function IconStartup({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconHandshake({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.22a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11-10 9-1-1" />
      <path d="M3.5 7.5 2 9l6 6" />
    </svg>
  );
}

export function IconClinic({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
      <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </svg>
  );
}

export function IconCard({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

export function IconArrowLeft({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

export function IconCheck({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconMenu({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function IconClose({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconSparkle({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconBolt({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
    </svg>
  );
}

export function IconShield({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconLayers({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="m12 2 9 5-9 5-9-5 9-5z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

export function IconTrending({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M22 7 13.5 15.5l-5-5L2 17" />
      <path d="M16 7h6v6" />
    </svg>
  );
}

export function IconTarget({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function IconPuzzle({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 2 12c0-.617.236-1.234.706-1.704L4.317 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61A2.402 2.402 0 0 1 12 2c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.878.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02z" />
    </svg>
  );
}

export function IconPhone({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function IconMail({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 5L2 7" />
    </svg>
  );
}

export function IconInstagram({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

export function IconLinkedin({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function IconNetwork({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="4" cy="8" r="2" />
      <circle cx="20" cy="8" r="2" />
      <circle cx="8" cy="20" r="2" />
      <circle cx="16" cy="20" r="2" />
      <path d="M12 9V4M12 15v5M9 12H4M15 12h5M9.5 17.5l-2.5 2M14.5 17.5l2.5 2M9.5 6.5l-2.5-2M14.5 6.5l2.5-2" />
    </svg>
  );
}

export function IconBrainCircuit({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 5a3 3 0 1 0-5.5 1.5M12 5a3 3 0 1 1 5.5 1.5M12 5v14M6.5 6.5a3 3 0 0 0 0 11M17.5 6.5a3 3 0 0 1 0 11M8 12h8M8 16h8" />
    </svg>
  );
}

export function IconSearchCheck({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35M8 11l2 2 4-4" />
    </svg>
  );
}

export function IconScanLine({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M4 7V4a2 2 0 0 1 2-2h3M17 2h3a2 2 0 0 1 2 2v3M20 17v3a2 2 0 0 1-2 2h-3M7 20H4a2 2 0 0 1-2-2v-3M8 12h8M12 8v8" />
    </svg>
  );
}

export function IconTooth({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 2c-2.5 0-4.5 1.5-5.5 1.5C4.5 3.5 3 5 3 7.5c0 2 .8 3.3 1.2 5.3.4 2 .3 4.7 1.6 7.6.5 1.1 1.2 1.6 1.9 1.6.9 0 1.4-.8 1.7-2 .3-1.4.4-3.5 1.6-3.5s1.3 2.1 1.6 3.5c.3 1.2.8 2 1.7 2 .7 0 1.4-.5 1.9-1.6 1.3-2.9 1.2-5.6 1.6-7.6.4-2 1.2-3.3 1.2-5.3 0-2.5-1.5-4-3.5-4-1 0-3-1.5-5.5-1.5z" />
    </svg>
  );
}

export function IconStar({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  );
}

export function IconCalendar({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function IconQuote({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth} fill="currentColor" stroke="none">
      <path d="M9.5 8C6.5 8 4 10.5 4 13.5S6.5 19 9.5 19c.4 0 .7-.3.7-.7 0-.3-.2-.6-.5-.7-1.7-.5-2.9-2-2.9-3.9v-.2c.3.1.7.2 1.1.2 1.9 0 3.4-1.5 3.4-3.4S11.4 8 9.5 8zm9 0c-3 0-5.5 2.5-5.5 5.5S15.5 19 18.5 19c.4 0 .7-.3.7-.7 0-.3-.2-.6-.5-.7-1.7-.5-2.9-2-2.9-3.9v-.2c.3.1.7.2 1.1.2 1.9 0 3.4-1.5 3.4-3.4S20.4 8 18.5 8z" />
    </svg>
  );
}

export function IconMapPin({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconClock({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function IconHeart({ size = 24, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

const iconMap: Record<string, React.FC<IconProps>> = {
  code: IconCode,
  globe: IconGlobe,
  bot: IconBot,
  users: IconUsers,
  chart: IconChart,
  rocket: IconRocket,
  stethoscope: IconStethoscope,
  building: IconBuilding,
  cart: IconCart,
  academy: IconAcademy,
  startup: IconStartup,
  handshake: IconHandshake,
  clinic: IconClinic,
  card: IconCard,
  trending: IconTrending,
  network: IconNetwork,
  brainCircuit: IconBrainCircuit,
  searchCheck: IconSearchCheck,
  scanLine: IconScanLine,
  tooth: IconTooth,
  star: IconStar,
  calendar: IconCalendar,
  quote: IconQuote,
  mapPin: IconMapPin,
  clock: IconClock,
  heart: IconHeart,
  sparkle: IconSparkle,
  shield: IconShield,
  target: IconTarget,
  bolt: IconBolt,
};

export function DynamicIcon({
  name,
  size = 24,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Cmp = iconMap[name] || IconCode;
  return <Cmp size={size} className={className} />;
}
