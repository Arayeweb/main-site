type PreviewKey = "web" | "arena" | "seo" | "bizcard";

export default function SolutionPreviewArt({ product }: { product: PreviewKey }) {
  switch (product) {
    case "web":
      return <WebPreview />;
    case "arena":
      return <ArenaPreview />;
    case "seo":
      return <SeoPreview />;
    case "bizcard":
      return <BizcardPreview />;
  }
}

function WebPreview() {
  return (
    <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden="true">
      <rect x="8" y="8" width="264" height="104" rx="10" fill="white" fillOpacity="0.22" stroke="white" strokeOpacity="0.35" />
      <circle cx="22" cy="22" r="3" fill="#FCA5A5" fillOpacity="0.9" />
      <circle cx="32" cy="22" r="3" fill="#FCD34D" fillOpacity="0.9" />
      <circle cx="42" cy="22" r="3" fill="#86EFAC" fillOpacity="0.9" />
      <rect x="18" y="34" width="244" height="28" rx="6" fill="white" fillOpacity="0.22" />
      <rect x="30" y="42" width="88" height="5" rx="2.5" fill="white" fillOpacity="0.75" />
      <rect x="30" y="51" width="56" height="4" rx="2" fill="white" fillOpacity="0.4" />
      <rect x="18" y="70" width="74" height="34" rx="6" fill="white" fillOpacity="0.16" />
      <rect x="100" y="70" width="74" height="34" rx="6" fill="white" fillOpacity="0.16" />
      <rect x="182" y="70" width="80" height="34" rx="6" fill="white" fillOpacity="0.16" />
      <rect x="26" y="78" width="40" height="4" rx="2" fill="white" fillOpacity="0.5" />
      <rect x="26" y="86" width="58" height="10" rx="3" fill="white" fillOpacity="0.28" />
    </svg>
  );
}

function ArenaPreview() {
  return (
    <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden="true">
      <rect x="12" y="14" width="118" height="92" rx="10" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.35" />
      <rect x="150" y="14" width="118" height="92" rx="10" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.35" />
      <circle cx="140" cy="60" r="16" fill="white" fillOpacity="0.28" stroke="white" strokeOpacity="0.5" />
      <text x="140" y="65" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui,sans-serif">VS</text>
      <rect x="24" y="28" width="72" height="8" rx="4" fill="white" fillOpacity="0.35" />
      <rect x="24" y="44" width="94" height="22" rx="6" fill="white" fillOpacity="0.18" />
      <rect x="24" y="72" width="64" height="8" rx="4" fill="white" fillOpacity="0.25" />
      <rect x="162" y="28" width="72" height="8" rx="4" fill="white" fillOpacity="0.35" />
      <rect x="162" y="44" width="94" height="22" rx="6" fill="white" fillOpacity="0.18" />
      <rect x="162" y="72" width="64" height="8" rx="4" fill="white" fillOpacity="0.25" />
      <circle cx="198" cy="88" r="6" fill="#8eb5ff" fillOpacity="0.9" />
      <circle cx="62" cy="88" r="6" fill="#bcd3ff" fillOpacity="0.9" />
    </svg>
  );
}

function SeoPreview() {
  return (
    <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden="true">
      <rect x="16" y="18" width="248" height="28" rx="14" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.25" />
      <circle cx="36" cy="32" r="8" stroke="white" strokeOpacity="0.7" strokeWidth="2" />
      <line x1="42" y1="38" x2="48" y2="44" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
      <rect x="54" y="28" width="120" height="8" rx="4" fill="white" fillOpacity="0.45" />
      <rect x="20" y="58" width="236" height="18" rx="6" fill="white" fillOpacity="0.14" />
      <rect x="28" y="64" width="14" height="6" rx="3" fill="#34D399" fillOpacity="0.95" />
      <rect x="48" y="63" width="100" height="5" rx="2.5" fill="white" fillOpacity="0.55" />
      <rect x="48" y="70" width="72" height="3" rx="1.5" fill="white" fillOpacity="0.3" />
      <path d="M226 67 L230 63 L234 67 L230 71 Z" fill="#34D399" fillOpacity="0.9" />
      <rect x="20" y="82" width="236" height="18" rx="6" fill="white" fillOpacity="0.1" />
      <rect x="28" y="88" width="14" height="6" rx="3" fill="white" fillOpacity="0.35" />
      <rect x="48" y="87" width="88" height="5" rx="2.5" fill="white" fillOpacity="0.4" />
      <rect x="20" y="104" width="236" height="10" rx="5" fill="white" fillOpacity="0.08" />
    </svg>
  );
}

function BizcardPreview() {
  return (
    <svg viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden="true">
      <rect x="78" y="10" width="124" height="100" rx="14" fill="white" fillOpacity="0.22" stroke="white" strokeOpacity="0.38" />
      <circle cx="140" cy="38" r="16" fill="white" fillOpacity="0.32" stroke="white" strokeOpacity="0.55" strokeWidth="1.5" />
      <rect x="118" y="60" width="44" height="6" rx="3" fill="white" fillOpacity="0.7" />
      <rect x="126" y="70" width="28" height="4" rx="2" fill="white" fillOpacity="0.35" />
      <rect x="96" y="82" width="88" height="10" rx="5" fill="white" fillOpacity="0.22" />
      <rect x="96" y="96" width="88" height="10" rx="5" fill="white" fillOpacity="0.16" />
      <rect x="214" y="72" width="28" height="28" rx="4" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.2" />
      <rect x="218" y="76" width="5" height="5" fill="white" fillOpacity="0.5" />
      <rect x="226" y="76" width="5" height="5" fill="white" fillOpacity="0.5" />
      <rect x="234" y="76" width="5" height="5" fill="white" fillOpacity="0.5" />
      <rect x="218" y="84" width="5" height="5" fill="white" fillOpacity="0.35" />
      <rect x="226" y="84" width="5" height="5" fill="white" fillOpacity="0.35" />
      <rect x="234" y="84" width="5" height="5" fill="white" fillOpacity="0.35" />
      <rect x="218" y="92" width="5" height="5" fill="white" fillOpacity="0.35" />
      <rect x="226" y="92" width="5" height="5" fill="white" fillOpacity="0.35" />
      <rect x="234" y="92" width="5" height="5" fill="white" fillOpacity="0.35" />
    </svg>
  );
}
