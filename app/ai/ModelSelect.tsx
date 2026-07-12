"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  compareModels,
  councilModels,
  directModels,
  getModel,
  modelsWithImageGen,
  videoModels,
  audioModels,
  transcribeModels,
  POWERED_BY_TAGLINE,
  IMAGE_POWERED_BY_TAGLINE,
  VIDEO_POWERED_BY_TAGLINE,
  AUDIO_POWERED_BY_TAGLINE,
  type AIModelInfo,
  type ModelTier,
} from "@/lib/aiModels";
import { canUseModel } from "@/lib/aiCredits";
import { canUseVideoModel } from "@/lib/aiMediaCredits";
import { planRank } from "@/lib/aiPackages";
import { BrandGlyph, IconLock, IconCheck, IconX } from "./icons";

const TIER_MIN_RANK: Record<ModelTier, number> = {
  economy: 0,
  mid: 1,
  premium: 2,
};

const TIER_LABEL: Record<ModelTier, string> = {
  economy: "اقتصادی",
  mid: "استاندارد",
  premium: "پرچم‌دار",
};

export default function ModelSelect({
  value,
  onChange,
  plan,
  exclude,
  label,
  visionOnly,
  imageGenOnly,
  videoGenOnly,
  audioGenOnly,
  transcribeOnly,
  picker = "direct",
  variant = "chip",
  sheetOnMobile = true,
  preferOpenDown = false,
}: {
  value: string;
  onChange: (id: string) => void;
  plan: string;
  exclude?: string;
  label?: string;
  visionOnly?: boolean;
  imageGenOnly?: boolean;
  videoGenOnly?: boolean;
  audioGenOnly?: boolean;
  transcribeOnly?: boolean;
  picker?: "direct" | "compare" | "council" | "image" | "video" | "audio" | "transcribe";
  variant?: "chip" | "bar";
  sheetOnMobile?: boolean;
  /** Keep the desktop popover below the trigger (home compare bar). */
  preferOpenDown?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [popStyle, setPopStyle] = useState<CSSProperties>({});
  const [dockAsSheet, setDockAsSheet] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const useSheet =
    (isMobile && (sheetOnMobile || variant === "bar")) || dockAsSheet;

  function computePopStyle(el: HTMLElement): CSSProperties {
    const rect = el.getBoundingClientRect();
    const width = variant === "bar" ? Math.min(360, Math.max(rect.width, 280)) : 305;
    const left = Math.min(
      Math.max(8, variant === "bar" ? rect.left : rect.right - width),
      window.innerWidth - width - 8
    );
    const maxPopHeight = Math.min(window.innerHeight * 0.7, 420);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = !preferOpenDown && spaceBelow < maxPopHeight && spaceAbove > spaceBelow;

    if (openUp) {
      return {
        position: "fixed",
        left,
        bottom: Math.max(8, window.innerHeight - rect.top + 8),
        width,
        maxHeight: Math.min(maxPopHeight, spaceAbove - 16),
        zIndex: 300,
      };
    }
    return {
      position: "fixed",
      left,
      top: Math.min(rect.bottom + 8, window.innerHeight - maxPopHeight - 8),
      width,
      maxHeight: Math.min(maxPopHeight, spaceBelow - 16),
      zIndex: 300,
    };
  }

  function updatePopPosition() {
    const el = rootRef.current;
    if (!el) return;
    setPopStyle(computePopStyle(el));
  }

  function openPicker() {
    const el = rootRef.current;
    let dock = false;
    if (el) {
      const rect = el.getBoundingClientRect();
      dock =
        sheetOnMobile &&
        !isMobile &&
        rect.top > window.innerHeight * 0.48;
      if (!dock) setPopStyle(computePopStyle(el));
      else setPopStyle({});
    }
    setDockAsSheet(dock);
    setOpen(true);
    setQuery("");
  }

  function closePicker() {
    setOpen(false);
    setQuery("");
    setPopStyle({});
    setDockAsSheet(false);
  }

  useLayoutEffect(() => {
    if (!open || useSheet) return;
    updatePopPosition();
    const onReflow = () => updatePopPosition();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open, useSheet, variant, preferOpenDown]);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const selected = getModel(value);
  const rank = planRank(plan);

  useEffect(() => {
    if (!open || useSheet) return;
    setTimeout(() => searchRef.current?.focus(), 50);
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (portalRef.current?.contains(t)) return;
      closePicker();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, useSheet]);

  useEffect(() => {
    if (!open || !useSheet) return;
    setTimeout(() => searchRef.current?.focus(), 80);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, useSheet]);

  const q = query.trim().toLowerCase();
  const resolvedPicker = videoGenOnly
    ? "video"
    : audioGenOnly
      ? "audio"
      : transcribeOnly
        ? "transcribe"
        : imageGenOnly
          ? "image"
          : picker;
  const source =
    resolvedPicker === "image"
      ? modelsWithImageGen()
      : resolvedPicker === "video"
        ? videoModels()
        : resolvedPicker === "audio"
          ? audioModels()
          : resolvedPicker === "transcribe"
            ? transcribeModels()
            : resolvedPicker === "compare"
              ? compareModels()
              : resolvedPicker === "council"
                ? councilModels()
                : directModels();

  function rowTitle(m: AIModelInfo) {
    return resolvedPicker === "direct" ? (m.personaName ?? m.name) : m.name;
  }

  const list = source.filter((m) => {
    if (visionOnly && !m.capabilities?.vision) return false;
    if (!q) return true;
    const title = rowTitle(m);
    return (
      title.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      (m.personaName?.toLowerCase().includes(q) ?? false) ||
      m.poweredBy.toLowerCase().includes(q) ||
      m.blurb.toLowerCase().includes(q)
    );
  });

  function pick(id: string) {
    onChange(id);
    closePicker();
  }

  function isModelLocked(m: AIModelInfo): boolean {
    if (resolvedPicker === "video") return !canUseVideoModel(plan, m);
    if (resolvedPicker === "image") return !canUseModel(plan, m);
    return rank < TIER_MIN_RANK[m.tier];
  }

  const listBody = (
    <>
      <input
        ref={searchRef}
        className="ar-mselect-search"
        placeholder="جستجوی مدل…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="ar-mselect-list">
        {list.map((m) => {
          const locked = isModelLocked(m);
          const disabled = locked || m.id === exclude;
          return (
            <button
              key={m.id}
              type="button"
              className={`ar-mselect-item${m.id === value ? " selected" : ""}${disabled ? " disabled" : ""}`}
              onClick={() => {
                if (disabled) return;
                pick(m.id);
              }}
            >
              <span className="glyph" style={{ color: m.color }}>
                <BrandGlyph brand={m.brand} size={15} />
              </span>
              <span className="info">
                <b>{rowTitle(m)}</b>
                <small className="powered-by">{m.poweredBy}</small>
              </span>
              <span className={`tier tier-${m.tier}`}>{TIER_LABEL[m.tier]}</span>
              {locked ? (
                <span className="lock"><IconLock size={12} /></span>
              ) : m.id === value ? (
                <span className="tick"><IconCheck size={13} /></span>
              ) : null}
            </button>
          );
        })}
        {list.length === 0 && (
          <div className="ar-mselect-empty">مدلی پیدا نشد.</div>
        )}
      </div>
      {!imageGenOnly && resolvedPicker !== "image" && (
        <div className="ar-mselect-foot ar-mselect-powered-tagline">{POWERED_BY_TAGLINE}</div>
      )}
      {imageGenOnly && (
        <div className="ar-mselect-foot ar-mselect-powered-tagline">{IMAGE_POWERED_BY_TAGLINE}</div>
      )}
      {videoGenOnly && (
        <div className="ar-mselect-foot ar-mselect-powered-tagline">{VIDEO_POWERED_BY_TAGLINE}</div>
      )}
      {(audioGenOnly || transcribeOnly) && (
        <div className="ar-mselect-foot ar-mselect-powered-tagline">{AUDIO_POWERED_BY_TAGLINE}</div>
      )}
      {rank < 2 && (
        <div className="ar-mselect-foot">
          مدل‌های قفل‌شده با <Link href="/ai/pricing">خرید پکیج</Link> باز می‌شوند.
        </div>
      )}
    </>
  );

  const selectedTitle = selected ? rowTitle(selected) : (label ?? "انتخاب مدل");

  const trigger =
    variant === "bar" ? (
      <button
        type="button"
        className="ar-mselect-bar-btn"
        onClick={() => (open ? closePicker() : openPicker())}
      >
        {selected ? (
          <>
            <span className="glyph" style={{ color: selected.color }}>
              <BrandGlyph brand={selected.brand} size={16} />
            </span>
            <span className="name">{selectedTitle}</span>
          </>
        ) : (
          <span className="name">{selectedTitle}</span>
        )}
        <span className="caret">▾</span>
      </button>
    ) : (
      <button
        type="button"
        className="ar-mselect-btn"
        onClick={() => (open ? closePicker() : openPicker())}
      >
        {selected ? (
          <>
            <span className="glyph" style={{ color: selected.color }}>
              <BrandGlyph brand={selected.brand} size={14} />
            </span>
            <span className="name">{selectedTitle}</span>
          </>
        ) : (
          <span className="name">{selectedTitle}</span>
        )}
        <span className="caret">▾</span>
      </button>
    );

  return (
    <div
      className={`ar-mselect${variant === "bar" ? " ar-mselect--bar" : ""}`}
      ref={rootRef}
    >
      {trigger}

      {open &&
        !useSheet &&
        mounted &&
        Object.keys(popStyle).length > 0 &&
        createPortal(
          <>
            <div
              className="ar-mselect-floating-backdrop"
              aria-hidden
              onClick={() => closePicker()}
            />
            <div ref={portalRef} className="ar-mselect-pop ar-mselect-pop--floating" style={popStyle}>
              {listBody}
            </div>
          </>,
          document.body
        )}

      {open &&
        useSheet &&
        mounted &&
        createPortal(
          <div
            className="ar-mselect-sheet-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div className="ar-mselect-sheet" role="dialog" aria-label="انتخاب مدل">
              <div className="ar-mselect-sheet-head">
                <h4>{label ?? "انتخاب مدل"}</h4>
                <button
                  type="button"
                  className="ar-mselect-sheet-close"
                  onClick={() => setOpen(false)}
                  aria-label="بستن"
                >
                  <IconX size={14} />
                </button>
              </div>
              {listBody}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
