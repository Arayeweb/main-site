"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_MAP_CENTER } from "@/lib/googlesabtCheckout";

type Props = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  province?: string;
};

type SearchHit = { display: string; lat: number; lng: number };

export default function GooglesabtMapPicker({ lat, lng, onChange, province }: Props) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const center = useMemo(() => {
    if (lat != null && lng != null) return { lat, lng };
    return DEFAULT_MAP_CENTER;
  }, [lat, lng]);

  const mapSrc = useMemo(() => {
    const delta = 0.012;
    const left = center.lng - delta;
    const right = center.lng + delta;
    const top = center.lat + delta;
    const bottom = center.lat - delta;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = window.setTimeout(async () => {
      setSearching(true);
      try {
        const q = province ? `${query} ${province} ایران` : `${query} ایران`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`,
          { headers: { Accept: "application/json" } }
        );
        const data = (await res.json()) as Array<{
          display_name: string;
          lat: string;
          lon: string;
        }>;
        setHits(
          data.map((d) => ({
            display: d.display_name,
            lat: Number(d.lat),
            lng: Number(d.lon),
          }))
        );
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [query, province]);

  const useMyLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("موقعیت‌یاب در این مرورگر در دسترس نیست.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange(pos.coords.latitude, pos.coords.longitude),
      () => setGeoError("دسترسی به موقعیت رد شد."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const nudge = (dLat: number, dLng: number) => {
    onChange(center.lat + dLat, center.lng + dLng);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی آدرس روی نقشه…"
          className="w-full rounded-xl border border-navy-100 bg-navy-50/40 px-4 py-3 text-sm outline-none transition focus:border-[#4285F4] focus:bg-white"
        />
        <button
          type="button"
          onClick={useMyLocation}
          className="shrink-0 rounded-xl border border-navy-200 bg-white px-4 py-3 text-xs font-bold text-navy-700 transition hover:border-[#4285F4] hover:text-[#4285F4]"
        >
          موقعیت من
        </button>
      </div>

      {searching ? <p className="text-[11px] text-navy-400">در حال جستجو…</p> : null}
      {hits.length > 0 ? (
        <ul className="overflow-hidden rounded-xl border border-navy-100 bg-white">
          {hits.map((h) => (
            <li key={`${h.lat}-${h.lng}-${h.display}`}>
              <button
                type="button"
                onClick={() => {
                  onChange(h.lat, h.lng);
                  setQuery(h.display.split(",")[0] || h.display);
                  setHits([]);
                }}
                className="w-full border-b border-navy-50 px-3 py-2.5 text-right text-[12px] text-navy-600 last:border-0 hover:bg-blue-50/50"
              >
                {h.display}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-navy-50">
        <iframe
          title="انتخاب موقعیت روی نقشه"
          src={mapSrc}
          className="h-56 w-full border-0 sm:h-64"
          loading="lazy"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-navy-400" dir="ltr">
          {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
        </p>
        <div className="flex gap-1.5">
          {[
            { label: "↑", dLat: 0.001, dLng: 0 },
            { label: "↓", dLat: -0.001, dLng: 0 },
            { label: "→", dLat: 0, dLng: 0.001 },
            { label: "←", dLat: 0, dLng: -0.001 },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => nudge(b.dLat, b.dLng)}
              className="h-8 w-8 rounded-lg border border-navy-100 bg-white text-xs font-bold text-navy-600 hover:border-[#4285F4]"
              aria-label={`جابه‌جایی ${b.label}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      {geoError ? <p className="text-xs font-bold text-red-600">{geoError}</p> : null}
    </div>
  );
}
