"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_MAP_CENTER, PROVINCE_MAP_CENTER } from "@/lib/googlesabtCheckout";

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
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);

  const hasSelection = lat != null && lng != null;

  const center = useMemo(() => {
    if (hasSelection) return { lat: lat!, lng: lng! };
    if (province && PROVINCE_MAP_CENTER[province]) return PROVINCE_MAP_CENTER[province];
    return DEFAULT_MAP_CENTER;
  }, [hasSelection, lat, lng, province]);

  const mapSrc = useMemo(() => {
    const delta = hasSelection ? 0.008 : 0.04;
    const left = center.lng - delta;
    const right = center.lng + delta;
    const top = center.lat + delta;
    const bottom = center.lat - delta;
    const marker = hasSelection ? `&marker=${center.lat}%2C${center.lng}` : "";
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik${marker}`;
  }, [center.lat, center.lng, hasSelection]);

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
          { headers: { Accept: "application/json" } },
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
          })),
        );
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [query, province]);

  const selectHit = (hit: SearchHit) => {
    onChange(hit.lat, hit.lng);
    const short = hit.display.split(",")[0]?.trim() || hit.display;
    setPlaceLabel(short);
    setQuery(short);
    setHits([]);
    setGeoError(null);
  };

  const useMyLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("موقعیت‌یاب در این مرورگر در دسترس نیست.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setPlaceLabel("موقعیت فعلی شما");
        setHits([]);
      },
      () => setGeoError("دسترسی به موقعیت رد شد. آدرس را جستجو کنید."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
      <div className="border-b border-navy-100 bg-slate-50/80 px-4 py-3">
        <p className="text-[12px] font-semibold leading-6 text-navy-500">
          آدرس را جستجو کنید یا موقعیت فعلی را بزنید — پین دقیق را کارشناس تأیید می‌کند.
        </p>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="نام محل، خیابان یا محله…"
              className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400"
              autoComplete="off"
            />
            {searching ? (
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-navy-400">
                …
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            className="shrink-0 rounded-xl border border-navy-200 bg-white px-3.5 py-3 text-xs font-extrabold text-navy-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            موقعیت من
          </button>
        </div>

        {hits.length > 0 ? (
          <ul className="overflow-hidden rounded-xl border border-navy-100">
            {hits.map((h) => (
              <li key={`${h.lat}-${h.lng}-${h.display}`}>
                <button
                  type="button"
                  onClick={() => selectHit(h)}
                  className="w-full border-b border-navy-50 px-3 py-2.5 text-right text-[12px] leading-6 text-navy-600 last:border-0 hover:bg-brand-50/60"
                >
                  {h.display}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {geoError ? <p className="text-xs font-bold text-red-600">{geoError}</p> : null}

        <div className="relative overflow-hidden rounded-xl border border-navy-100 bg-navy-50">
          <iframe
            title="پیش‌نمایش موقعیت روی نقشه"
            src={mapSrc}
            className={`pointer-events-none h-48 w-full border-0 sm:h-56 ${hasSelection ? "" : "opacity-70"}`}
            loading="lazy"
            tabIndex={-1}
          />
          {/* Clip OSM chrome / donation strip; keep our own credit */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white via-white/90 to-transparent" />
          {!hasSelection ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/35 px-6 text-center backdrop-blur-[1px]">
              <p className="rounded-xl bg-white/90 px-4 py-3 text-[12px] font-bold leading-6 text-navy-700 shadow-soft">
                هنوز پین نشده — جستجو یا «موقعیت من»
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex items-start justify-between gap-3">
          {hasSelection ? (
            <p className="text-[12px] font-bold leading-6 text-emerald-700">
              موقعیت ثبت شد
              {placeLabel ? <span className="font-semibold text-navy-500"> — {placeLabel}</span> : null}
            </p>
          ) : (
            <p className="text-[12px] font-semibold leading-6 text-navy-400">موقعیت انتخاب نشده</p>
          )}
          <p className="shrink-0 text-[10px] text-navy-300">© OpenStreetMap</p>
        </div>
      </div>
    </div>
  );
}
