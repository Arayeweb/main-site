"use client";

import { useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { buildAdReadyLoginUrl } from "@/lib/adreadyAuth";
import { pushGtmEvent } from "@/lib/gtm";

const DESTINATION = "/dashboard/adready/new";
const AUTH_URL = buildAdReadyLoginUrl({ mode: "register", next: DESTINATION });

type AdReadyCtaProps = {
  label?: string;
  location: string;
  className?: string;
  showArrow?: boolean;
};

export default function AdReadyCta({
  label = "پیش‌نمایش رایگان بساز",
  location,
  className = "adready-primary-button",
  showArrow = true,
}: AdReadyCtaProps) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    pushGtmEvent("cta_click", {
      page: "adready",
      location,
      destination: DESTINATION,
    });

    try {
      const response = await fetch("/api/adready/auth", {
        credentials: "same-origin",
        cache: "no-store",
        signal: AbortSignal.timeout(4_000),
      });
      const data = (await response.json().catch(() => null)) as
        | { authed?: boolean }
        | null;
      window.location.assign(data?.authed ? DESTINATION : AUTH_URL);
    } catch {
      window.location.assign(AUTH_URL);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={busy}
      aria-busy={busy}
    >
      {busy ? (
        <LoaderCircle size={18} className="adready-spin" aria-hidden="true" />
      ) : showArrow ? (
        <ArrowLeft size={18} aria-hidden="true" />
      ) : null}
      <span>{busy ? "در حال بررسی..." : label}</span>
    </button>
  );
}
