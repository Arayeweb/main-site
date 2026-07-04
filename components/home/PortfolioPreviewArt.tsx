import type { PortfolioPreviewKey } from "@/lib/homeData";

export type { PortfolioPreviewKey };

export default function PortfolioPreviewArt({
  project,
  featured = false,
}: {
  project: PortfolioPreviewKey;
  featured?: boolean;
}) {
  const height = featured ? "min-h-[240px] lg:min-h-full" : "min-h-[160px]";

  return (
    <div className={`relative h-full w-full overflow-hidden ${height}`} aria-hidden="true">
      {project === "deepinhq" && <DeepinPreview featured={featured} />}
      {project === "emroz" && <EmrozPreview />}
      {project === "shiva" && <ShivaPreview />}
      {project === "pordast" && <PordastPreview />}
    </div>
  );
}

function DeepinPreview({ featured }: { featured?: boolean }) {
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="280" fill="url(#deepinBg)" />
      <rect x="20" y="20" width="360" height="36" rx="8" fill="white" fillOpacity="0.12" />
      <rect x="32" y="32" width="80" height="8" rx="4" fill="white" fillOpacity="0.5" />
      <rect x="20" y="68" width="110" height="80" rx="10" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.15" />
      <rect x="30" y="80" width="50" height="6" rx="3" fill="white" fillOpacity="0.4" />
      <rect x="30" y="92" width="70" height="10" rx="4" fill="white" fillOpacity="0.65" />
      <rect x="30" y="118" width="40" height="5" rx="2.5" fill="#34D399" fillOpacity="0.9" />
      <rect x="140" y="68" width="240" height={featured ? "192" : "120"} rx="10" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.15" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <rect
          key={i}
          x={155 + i * 18}
          y={featured ? 200 - [60, 80, 50, 95, 70, 110, 85, 120, 90, 130, 100, 115][i] : 150 - [40, 55, 35, 70, 50, 85, 60, 90][i % 8]}
          width="12"
          height={[60, 80, 50, 95, 70, 110, 85, 120, 90, 130, 100, 115][i] * (featured ? 1 : 0.7)}
          rx="3"
          fill="white"
          fillOpacity={0.25 + (i / 12) * 0.45}
        />
      ))}
      <defs>
        <linearGradient id="deepinBg" x1="0" y1="0" x2="400" y2="280" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e30b0" />
          <stop offset="1" stopColor="#3b6cff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function EmrozPreview() {
  return (
    <svg viewBox="0 0 400 200" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="url(#emrozBg)" />
      <rect x="130" y="16" width="140" height="168" rx="18" fill="white" fillOpacity="0.14" stroke="white" strokeOpacity="0.25" />
      <circle cx="200" cy="52" r="18" fill="white" fillOpacity="0.25" />
      <rect x="162" y="80" width="76" height="7" rx="3.5" fill="white" fillOpacity="0.6" />
      <rect x="148" y="96" width="104" height="36" rx="10" fill="white" fillOpacity="0.18" />
      <rect x="156" y="104" width="60" height="5" rx="2.5" fill="white" fillOpacity="0.45" />
      <rect x="156" y="114" width="88" height="5" rx="2.5" fill="white" fillOpacity="0.3" />
      <rect x="148" y="142" width="104" height="28" rx="14" fill="white" fillOpacity="0.22" />
      <circle cx="168" cy="156" r="6" fill="#8eb5ff" />
      <circle cx="188" cy="156" r="6" fill="#bcd3ff" />
      <circle cx="208" cy="156" r="6" fill="#34D399" />
      <defs>
        <linearGradient id="emrozBg" x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2238db" />
          <stop offset="1" stopColor="#5a8cff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ShivaPreview() {
  return (
    <svg viewBox="0 0 400 200" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="url(#shivaBg)" />
      <rect x="24" y="24" width="160" height="120" rx="8" fill="white" fillOpacity="0.15" />
      <rect x="200" y="24" width="80" height="56" rx="6" fill="white" fillOpacity="0.12" />
      <rect x="292" y="24" width="80" height="56" rx="6" fill="white" fillOpacity="0.12" />
      <rect x="200" y="88" width="80" height="56" rx="6" fill="white" fillOpacity="0.12" />
      <rect x="292" y="88" width="80" height="56" rx="6" fill="white" fillOpacity="0.12" />
      <rect x="24" y="156" width="348" height="20" rx="4" fill="white" fillOpacity="0.1" />
      <defs>
        <linearGradient id="shivaBg" x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#243b53" />
          <stop offset="1" stopColor="#9fb3c8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PordastPreview() {
  return (
    <svg viewBox="0 0 400 200" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="url(#pordastBg)" />
      <circle cx="200" cy="58" r="24" fill="white" fillOpacity="0.22" stroke="white" strokeOpacity="0.35" strokeWidth="2" />
      <rect x="156" y="94" width="88" height="8" rx="4" fill="white" fillOpacity="0.55" />
      <rect x="170" y="108" width="60" height="5" rx="2.5" fill="white" fillOpacity="0.3" />
      <rect x="120" y="128" width="160" height="32" rx="16" fill="white" fillOpacity="0.2" />
      <rect x="136" y="140" width="60" height="8" rx="4" fill="white" fillOpacity="0.5" />
      <rect x="100" y="168" width="90" height="20" rx="10" fill="white" fillOpacity="0.14" />
      <rect x="210" y="168" width="90" height="20" rx="10" fill="white" fillOpacity="0.14" />
      <defs>
        <linearGradient id="pordastBg" x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#102a43" />
          <stop offset="1" stopColor="#3b6cff" />
        </linearGradient>
      </defs>
    </svg>
  );
}
