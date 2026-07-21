"use client";

import { useMemo, useState, type ReactNode } from "react";
import { IconX } from "./icons";
import {
  getDeferredInstallPrompt,
  promptNativeInstall,
  trackPwaEvent,
  type PwaInstallEntry,
} from "@/lib/ai/pwaInstall";

type Platform = "android" | "ios";

type Step = {
  text: ReactNode;
};

function IconAndroid({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#3DDC84"
        d="M17.6 9.5l1.6-2.8a.6.6 0 10-1.05-.6l-1.65 2.85A7.4 7.4 0 0012 8c-1.6 0-3.07.5-4.3 1.35L6.05 6.5a.6.6 0 10-1.05.6l1.6 2.8A7.45 7.45 0 004.5 15.5v.7c0 .7.55 1.25 1.25 1.25h1.1V14a.75.75 0 011.5 0v3.45h7.3V14a.75.75 0 011.5 0v3.45h1.1c.7 0 1.25-.55 1.25-1.25v-.7c0-2.4-1.15-4.52-2.9-5.95zM9.2 12.4a.9.9 0 110-1.8.9.9 0 010 1.8zm5.6 0a.9.9 0 110-1.8.9.9 0 010 1.8z"
      />
    </svg>
  );
}

function IconApple({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.7 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1-.1 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.2-2.4-.1 0-2.2-.8-2.2-3.7zm-2-6.2c.6-.7 1-1.7.9-2.7-1 .1-2.1.7-2.7 1.5-.6.7-1.1 1.7-.9 2.7 1.1.1 2.1-.5 2.7-1.5z"
      />
    </svg>
  );
}

function IconDotsV({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="19" r="1.8" fill="currentColor" />
    </svg>
  );
}

function IconDotsH({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="19" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

function IconAddHome({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function IconShareIos({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 3v11" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 13v5a3 3 0 003 3h8a3 3 0 003-3v-5" />
    </svg>
  );
}

function InlineIcon({ children }: { children: ReactNode }) {
  return <span className="ar-pwa-inline-icon">{children}</span>;
}

const ANDROID_STEPS: Step[] = [
  {
    text: (
      <>
        از منوی مرورگر{" "}
        <InlineIcon>
          <IconDotsV />
        </InlineIcon>{" "}
        بزنید.
      </>
    ),
  },
  {
    text: (
      <>
        گزینه{" "}
        <strong>
          <InlineIcon>
            <IconAddHome />
          </InlineIcon>{" "}
          Add to Home Screen
        </strong>{" "}
        را انتخاب کنید.
      </>
    ),
  },
  {
    text: (
      <>
        روی <strong>Add</strong> یا <strong>Install</strong> بزنید.
      </>
    ),
  },
  {
    text: <>آرایه حالا مثل یک اپلیکیشن روی گوشی شماست.</>,
  },
];

const IOS_STEPS: Step[] = [
  {
    text: (
      <>
        روی دکمه{" "}
        <InlineIcon>
          <IconDotsH />
        </InlineIcon>{" "}
        در نوار پایین مرورگر Safari بزنید.
      </>
    ),
  },
  {
    text: (
      <>
        روی دکمه{" "}
        <InlineIcon>
          <IconShareIos />
        </InlineIcon>{" "}
        بزنید.
      </>
    ),
  },
  {
    text: (
      <>
        از منوی پایین روی دکمه{" "}
        <InlineIcon>
          <IconDotsH />
        </InlineIcon>{" "}
        بزنید.
      </>
    ),
  },
  {
    text: (
      <>
        گزینه <strong>Add to Home Screen</strong> را انتخاب کنید.
      </>
    ),
  },
  {
    text: (
      <>
        روی <strong>Add</strong> ضربه بزنید.
      </>
    ),
  },
];

export default function PWAInstallSheet({
  iosGuide,
  entry,
  onClose,
}: {
  iosGuide: boolean;
  entry: PwaInstallEntry;
  onClose: (reason: "dismiss" | "later" | "installed" | "done") => void;
}) {
  const [platform, setPlatform] = useState<Platform>(iosGuide ? "ios" : "android");
  const [busy, setBusy] = useState(false);

  const canNativeInstall = useMemo(
    () => platform === "android" && Boolean(getDeferredInstallPrompt()),
    [platform]
  );

  const steps = platform === "ios" ? IOS_STEPS : ANDROID_STEPS;

  async function handlePrimary() {
    if (canNativeInstall) {
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
      // unavailable — fall through to done
    }

    trackPwaEvent("pwa_install_cta_clicked", {
      entry,
      mode: platform === "ios" ? "ios_guide" : "android_prompt",
    });
    onClose("done");
  }

  function handleLater() {
    onClose("later");
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
        <button
          type="button"
          className="ar-pwa-guide-close"
          aria-label="بستن"
          onClick={handleLater}
        >
          <IconX size={16} />
        </button>

        <header className="ar-pwa-guide-head">
          <h3 id="ar-pwa-install-title">اپلیکیشن آرایه</h3>
          <p className="ar-pwa-guide-tagline">سریع، راحت و در دسترس</p>
          <p className="ar-pwa-guide-hint">راهنمای نحوه فعال‌سازی وب‌اپلیکیشن</p>
        </header>

        <div className="ar-pwa-guide-divider" />

        <div
          className="ar-pwa-platform"
          role="tablist"
          aria-label="انتخاب سیستم‌عامل"
        >
          <button
            type="button"
            role="tab"
            aria-selected={platform === "android"}
            className={`ar-pwa-platform-btn${platform === "android" ? " active" : ""}`}
            onClick={() => setPlatform("android")}
          >
            <IconAndroid />
            <span>android</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={platform === "ios"}
            className={`ar-pwa-platform-btn${platform === "ios" ? " active" : ""}`}
            onClick={() => setPlatform("ios")}
          >
            <IconApple />
            <span>iOS</span>
          </button>
        </div>

        <ol className="ar-pwa-guide-steps" key={platform}>
          {steps.map((step, i) => (
            <li key={i} className="ar-pwa-guide-step">
              <span className="ar-pwa-guide-num" aria-hidden="true">
                {i + 1}
              </span>
              <p className="ar-pwa-guide-step-text">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="ar-pwa-guide-divider" />

        <div className="ar-pwa-sheet-actions">
          <button
            type="button"
            className="ar-btn ar-btn-primary ar-btn-block ar-pwa-guide-cta"
            disabled={busy}
            onClick={handlePrimary}
          >
            {busy
              ? "در حال آماده‌سازی…"
              : canNativeInstall
                ? "نصب آرایه AI"
                : "متوجه شدم"}
          </button>
        </div>
      </div>
    </div>
  );
}
