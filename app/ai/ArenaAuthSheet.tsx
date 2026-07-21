"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { IconX } from "./icons";
import { invalidateArenaAuthCache } from "./ArenaAuthContext";
import ArenaAuthForm from "./ArenaAuthForm";
import { trackAiSignup } from "@/lib/aiTracking";

function isAiHomePath(pathname: string) {
  return pathname === "/ai" || pathname === "/ai/";
}

export default function ArenaAuthSheet() {
  const pathname = usePathname();
  const phoneRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState("");
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const onOpen = (e: Event) => {
      if (isAiHomePath(pathname)) return;
      const detail = (e as CustomEvent<{ hint?: string }>).detail;
      setHint(detail?.hint?.trim() || "");
      setFormKey((k) => k + 1);
      setOpen(true);
      setTimeout(() => phoneRef.current?.focus(), 100);
    };
    window.addEventListener("ai:open-login", onOpen);
    return () => window.removeEventListener("ai:open-login", onOpen);
  }, [pathname]);

  function close() {
    setOpen(false);
    setHint("");
  }

  if (!open) return null;

  return (
    <div
      className="ar-sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="ar-sheet ar-sheet--auth">
        <div className="ar-sheet-head ar-sheet-head--auth">
          <div className="ar-auth-brand">
            <img
              className="ar-auth-brand-logo"
              src="/assets/logo-icon.svg"
              alt=""
              width={22}
              height={22}
            />
            <span className="ar-auth-brand-name">آرایه AI</span>
          </div>
          <button className="ar-sheet-close" onClick={close} aria-label="بستن">
            <IconX size={13} />
          </button>
        </div>

        <ArenaAuthForm
          key={formKey}
          hint={hint}
          phoneRef={phoneRef}
          onSuccess={({ tab }) => {
            if (tab === "register") trackAiSignup();
            close();
            invalidateArenaAuthCache();
            window.dispatchEvent(new Event("ai:refresh"));
            window.dispatchEvent(new Event("ai:auth-success"));
          }}
        />
      </div>
    </div>
  );
}
