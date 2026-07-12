"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { IconX } from "./icons";
import { invalidateArenaAuthCache } from "./ArenaAuthContext";
import { loginAiUser, registerAiUser } from "@/lib/aiAuthClient";
import { trackAiSignup } from "@/lib/aiTracking";
import { pickUtmForDb, getUtmParams } from "@/lib/utm";
import { ADREADY_AUTH_ERRORS } from "@/lib/adreadyAuth";

type AuthTab = "register" | "login";

function isAiHomePath(pathname: string) {
  return pathname === "/ai" || pathname === "/ai/";
}

export default function ArenaAuthSheet() {
  const pathname = usePathname();
  const phoneRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState("");
  const [authTab, setAuthTab] = useState<AuthTab>("register");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      if (isAiHomePath(pathname)) return;
      const detail = (e as CustomEvent<{ hint?: string }>).detail;
      setHint(detail?.hint?.trim() || "");
      setAuthErr("");
      setOpen(true);
      setTimeout(() => phoneRef.current?.focus(), 100);
    };
    window.addEventListener("ai:open-login", onOpen);
    return () => window.removeEventListener("ai:open-login", onOpen);
  }, [pathname]);

  function close() {
    setOpen(false);
    setHint("");
    setAuthErr("");
  }

  async function handleAuth() {
    if (authBusy) return;
    setAuthErr("");
    if (!phone.trim() || !password.trim()) {
      setAuthErr(ADREADY_AUTH_ERRORS.missing_fields);
      return;
    }
    setAuthBusy(true);
    try {
      const utm = pickUtmForDb(getUtmParams());
      const result =
        authTab === "register"
          ? await registerAiUser({ phone: phone.trim(), password, utm })
          : await loginAiUser({ phone: phone.trim(), password });

      if (!result.ok) {
        if (result.error === "phone_taken") setAuthTab("login");
        setAuthErr(result.message);
        setAuthBusy(false);
        return;
      }

      if (authTab === "register") trackAiSignup();
      close();
      setAuthBusy(false);
      invalidateArenaAuthCache();
      window.dispatchEvent(new Event("ai:refresh"));
      window.dispatchEvent(new Event("ai:auth-success"));
    } catch {
      setAuthErr(ADREADY_AUTH_ERRORS.default);
      setAuthBusy(false);
    }
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
        <div className="ar-sheet-head">
          <h3>ورود به آرایه AI</h3>
          <button className="ar-sheet-close" onClick={close} aria-label="بستن">
            <IconX size={13} />
          </button>
        </div>
        <p className="ar-sheet-sub">
          {hint || "برای شروع گفتگو با شماره موبایل وارد شو یا ثبت‌نام کن."}
        </p>

        <div className="ar-tabs">
          <button
            className={`ar-tab${authTab === "register" ? " active" : ""}`}
            onClick={() => {
              setAuthTab("register");
              setAuthErr("");
            }}
          >
            ثبت‌نام
          </button>
          <button
            className={`ar-tab${authTab === "login" ? " active" : ""}`}
            onClick={() => {
              setAuthTab("login");
              setAuthErr("");
            }}
          >
            ورود
          </button>
        </div>

        <div className="ar-field">
          <label>شماره موبایل</label>
          <input
            ref={phoneRef}
            type="tel"
            inputMode="tel"
            placeholder="09xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
        <div className="ar-field">
          <label>رمز عبور</label>
          <input
            type="password"
            placeholder={authTab === "register" ? "حداقل ۶ کاراکتر" : "رمز عبور"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            autoComplete={authTab === "register" ? "new-password" : "current-password"}
          />
        </div>

        {authErr && <div className="ar-auth-err">{authErr}</div>}

        <button className="ar-btn ar-btn-primary ar-btn-block" onClick={handleAuth} disabled={authBusy}>
          {authBusy ? "لطفاً صبر کن…" : authTab === "register" ? "شروع رایگان" : "ورود"}
        </button>

        {authTab === "register" && (
          <p className="ar-auth-note">۱۰ پیام رایگان بعد از ثبت‌نام فعال می‌شود.</p>
        )}
      </div>
    </div>
  );
}
