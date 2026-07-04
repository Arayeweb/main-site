"use client";

import { useEffect, useRef, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";

const HERO_VIDEO = "/reels/doctors/reel-01-patient-books-2am.mp4";
const HOOK_FA = "ساعت ۲ بامداد — بیمار نوبت گرفت";

function ClinicBookingMockup({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`relative mx-auto ${compact ? "w-[200px]" : "w-full max-w-[260px]"}`}
      aria-hidden
    >
      <div className="rounded-[2rem] border-[6px] border-navy-800 bg-navy-900 p-2 shadow-2xl">
        <div className="overflow-hidden rounded-[1.4rem] bg-white">
          <div className="bg-sky-600 px-3 py-2.5 text-center">
            <p className="text-[10px] font-bold text-white">مطب دکتر احمدی</p>
            <p className="text-[8px] text-sky-100">نوبت‌دهی آنلاین</p>
          </div>
          <div className="space-y-2 p-3">
            <div className="flex items-center justify-between rounded-lg bg-sky-50 px-2 py-1.5">
              <span className="text-[9px] text-navy-500">امروز</span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[8px] font-bold text-green-700 animate-pulse">
                +۳ نوبت
              </span>
            </div>
            {["۱۰:۰۰", "۱۱:۳۰", "۱۴:۰۰", "۱۶:۳۰"].map((slot, i) => (
              <div
                key={slot}
                className="flex items-center justify-between rounded-lg border border-navy-100 px-2 py-1.5"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                <span className="text-[9px] font-medium text-navy-700">{slot}</span>
                <span
                  className={`text-[8px] font-bold ${i < 3 ? "text-green-600" : "text-sky-600"}`}
                >
                  {i < 3 ? "رزرو شد ✓" : "خالی"}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-navy-50 bg-navy-50/50 px-3 py-2 text-center">
            <span className="text-[8px] text-navy-400">بدون تماس تلفنی</span>
          </div>
        </div>
      </div>
      <div className="absolute -top-2 -right-2 rounded-full bg-amber-500 px-2 py-1 text-[9px] font-bold text-white shadow-lg">
        ۲۴/۷
      </div>
    </div>
  );
}

export default function DoctorsHeroVideo({ compact }: { compact?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [playing, setPlaying] = useState(false);
  const trackedPlay = useRef(false);

  useEffect(() => {
    fetch(HERO_VIDEO, { method: "HEAD" })
      .then((r) => setHasVideo(r.ok))
      .catch(() => setHasVideo(false));
  }, []);

  const handlePlay = () => {
    setPlaying(true);
    if (!trackedPlay.current) {
      trackedPlay.current = true;
      pushGtmEvent("video_play", { page: "doctors", source: "hero_reel" });
    }
  };

  if (hasVideo) {
    return (
      <div className={`relative ${compact ? "" : "mx-auto w-full max-w-[280px]"}`}>
        <div className="overflow-hidden rounded-3xl border border-sky-100 bg-navy-900 shadow-card">
          <video
            ref={videoRef}
            src={HERO_VIDEO}
            className="aspect-[9/16] w-full object-cover"
            playsInline
            muted
            loop
            autoPlay={!compact}
            controls={compact}
            poster=""
            onPlay={handlePlay}
            aria-label="ویدیو: بیمار در نیمه‌شب نوبت آنلاین می‌گیرد"
          />
          {!playing && compact ? (
            <button
              type="button"
              onClick={() => videoRef.current?.play()}
              className="absolute inset-0 flex items-center justify-center bg-navy-900/30"
              aria-label="پخش ویدیو"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-sky-600 shadow-lg">
                ▶
              </span>
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-center text-[11px] font-medium text-navy-500">{HOOK_FA}</p>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "mx-auto"}>
      <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50/80 to-white p-5 shadow-soft">
        <p className="mb-4 text-center text-xs font-bold text-sky-700">{HOOK_FA}</p>
        <ClinicBookingMockup compact={compact} />
        <p className="mt-4 text-center text-[11px] leading-relaxed text-navy-400">
          نوبت‌دهی آنلاین — حتی وقتی مطب بسته است
        </p>
      </div>
    </div>
  );
}
