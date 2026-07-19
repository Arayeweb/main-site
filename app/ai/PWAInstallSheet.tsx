"use client";

import { useState } from "react";
import { IconX } from "./icons";
import {
  promptNativeInstall,
  trackPwaEvent,
  type PwaInstallEntry,
} from "@/lib/ai/pwaInstall";

const IOS_STEPS = [
  {
    title: "۱. اشتراک‌گذاری را بزن",
    body: "در نوار پایین Safari روی دکمه اشتراک‌گذاری (مربع با فلش رو به بالا) بزن.",
  },
  {
    title: "۲. «افزودن به صفحه اصلی» را پیدا کن",
    body: "در منوی بازشده پایین بکش تا گزینه «افزودن به صفحه اصلی» را ببینی و روی آن بزن.",
  },
  {
    title: "۳. تأیید کن",
    body: "روی «افزودن» بزن. آیکون آرایه AI روی صفحه اصلی گوشی‌ات ظاهر می‌شود.",
  },
] as const;

export default function PWAInstallSheet({
  iosGuide,
  entry,
  onClose,
}: {
  iosGuide: boolean;
  entry: PwaInstallEntry;
  onClose: (reason: "dismiss" | "later" | "installed" | "done") => void;
}) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  async function handleInstallClick() {
    trackPwaEvent("pwa_install_cta_clicked", { entry, mode: "android_prompt" });
    setBusy(true);
    const outcome = await promptNativeInstall();
    setBusy(false);
    if (outcome === "accepted") {
      onClose("installed");
      return;
    }
    if (outcome === "dismissed") {
      onClose("dismiss");
      return;
    }
    // unavailable — keep sheet, user can dismiss
  }

  function handleLater() {
    onClose("later");
  }

  function handleIosNext() {
    if (step < IOS_STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    trackPwaEvent("pwa_install_cta_clicked", { entry, mode: "ios_guide" });
    onClose("done");
  }

  return (
    <div
      className="ar-sheet-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleLater();
      }}
    >
      <div
        className="ar-sheet ar-sheet--pwa"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ar-pwa-install-title"
      >
        <div className="ar-sheet-head">
          <h3 id="ar-pwa-install-title">
            {iosGuide ? "نصب آرایه روی آیفون" : "آرایه رو دم دستت داشته باش"}
          </h3>
          <button
            type="button"
            className="ar-sheet-close"
            aria-label="بستن"
            onClick={handleLater}
          >
            <IconX size={16} />
          </button>
        </div>

        {iosGuide ? (
          <>
            <div className="ar-pwa-ios-steps" aria-live="polite">
              <div className="ar-pwa-ios-visual" data-step={step} aria-hidden="true">
                {step === 0 && (
                  <div className="ar-pwa-ios-mock">
                    <div className="ar-pwa-ios-mock-bar">
                      <span className="ar-pwa-ios-share" />
                    </div>
                    <p>اشتراک‌گذاری</p>
                  </div>
                )}
                {step === 1 && (
                  <div className="ar-pwa-ios-mock ar-pwa-ios-mock--menu">
                    <div className="ar-pwa-ios-menu-item ar-pwa-ios-menu-item--active">
                      افزودن به صفحه اصلی
                    </div>
                    <div className="ar-pwa-ios-menu-item">نشان‌ها</div>
                    <div className="ar-pwa-ios-menu-item">کپی</div>
                  </div>
                )}
                {step === 2 && (
                  <div className="ar-pwa-ios-mock ar-pwa-ios-mock--home">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/ai-icon-192.png" alt="" width={48} height={48} />
                    <span>آرایه AI</span>
                  </div>
                )}
              </div>
              <p className="ar-pwa-ios-step-title">{IOS_STEPS[step].title}</p>
              <p className="ar-sheet-sub">{IOS_STEPS[step].body}</p>
              <div className="ar-pwa-ios-dots" aria-hidden="true">
                {IOS_STEPS.map((_, i) => (
                  <span key={i} className={i === step ? "active" : undefined} />
                ))}
              </div>
            </div>
            <div className="ar-pwa-sheet-actions">
              <button
                type="button"
                className="ar-btn ar-btn-primary ar-btn-block"
                onClick={handleIosNext}
              >
                {step < IOS_STEPS.length - 1 ? "مرحله بعد" : "متوجه شدم"}
              </button>
              <button type="button" className="ar-btn ar-btn-ghost ar-btn-block" onClick={handleLater}>
                فعلاً نه
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="ar-sheet-sub">
              مستقیم از صفحه اصلی گوشیت بازش کن؛ بدون پیدا کردن تب مرورگر.
              <br />
              چت‌ها و مدل‌های اخیرت همون‌جا منتظرته.
            </p>
            <div className="ar-pwa-sheet-actions">
              <button
                type="button"
                className="ar-btn ar-btn-primary ar-btn-block"
                disabled={busy}
                onClick={handleInstallClick}
              >
                {busy ? "در حال آماده‌سازی…" : "نصب آرایه AI"}
              </button>
              <button type="button" className="ar-btn ar-btn-ghost ar-btn-block" onClick={handleLater}>
                فعلاً نه
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
