"use client";

import { useState } from "react";
import PortfolioPreviewArt, { type PortfolioPreviewKey } from "./PortfolioPreviewArt";

interface PortfolioPreviewProps {
  name: string;
  previewKey: PortfolioPreviewKey;
  image?: string;
  className?: string;
  featured?: boolean;
}

export default function PortfolioPreview({
  name,
  previewKey,
  image,
  className = "",
  featured = false,
}: PortfolioPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-navy-900 ${featured ? "min-h-[240px] lg:min-h-full" : "min-h-[160px]"} ${className}`}
    >
      {!imageLoaded ? <PortfolioPreviewArt project={previewKey} featured={featured} /> : null}

      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={`نمای ${name}`}
          className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-1.5 border-b border-white/15 bg-black/25 px-3 py-2 backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-red-400/90" />
        <span className="h-2 w-2 rounded-full bg-amber-400/90" />
        <span className="h-2 w-2 rounded-full bg-green-400/90" />
        <span className="mr-auto truncate text-[10px] font-medium text-white/85">{name}</span>
      </div>
    </div>
  );
}
