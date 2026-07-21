"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import {
  loginAiUser,
  sendAiOtp,
  verifyAiOtp,
  type AiAuthUser,
} from "@/lib/aiAuthClient";
import { AI_AUTH_ERRORS } from "@/lib/aiAuthErrors";
import type { AiOtpPurpose } from "@/lib/aiOtp";
import { pickUtmForDb, getUtmParams } from "@/lib/utm";

export type ArenaAuthTab = "register" | "login" | "reset";

type Step = "phone" | "otp" | "password";
type LoginMethod = "otp" | "password";

type Props = {
  hint?: string;
  initialTab?: ArenaAuthTab;
  phoneRef?: Ref<HTMLInputElement>;
  onSuccess: (result: {
    tab: ArenaAuthTab;
    user: AiAuthUser;
    referralCode?: string;
  }) => void;
};

export default function ArenaAuthForm({
  hint,
  initialTab = "register",
  phoneRef: externalPhoneRef,
  onSuccess,
}: Props) {
  const internalPhoneRef = useRef<HTMLInputElement>(null);
  const phoneRef = externalPhoneRef ?? internalPhoneRef;

  const [authTab, setAuthTab] = useState<ArenaAuthTab>(initialTab);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("otp");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [resendLeft, setResendLeft] = useState(0);
  const [debugHint, setDebugHint] = useState("");

  useEffect(() => {
    if (resendLeft <= 0) return;
    const t = setTimeout(() => setResendLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendLeft]);

  function resetFlow(nextTab: ArenaAuthTab = authTab) {
    setAuthTab(nextTab);
    setStep("phone");
    setOtp("");
    setPassword("");
    setAuthErr("");
    setDebugHint("");
    setResendLeft(0);
    if (nextTab !== "login") setLoginMethod("otp");
  }

  function purposeForTab(): AiOtpPurpose {
    if (authTab === "register") return "register";
    if (authTab === "reset") return "reset";
    return "login";
  }

  async function handleSendOtp(isResend = false) {
    if (authBusy) return;
    setAuthErr("");
    if (!phone.trim()) {
      setAuthErr(AI_AUTH_ERRORS.missing_phone);
      return;
    }
    setAuthBusy(true);
    try {
      const result = await sendAiOtp({
        phone: phone.trim(),
        purpose: purposeForTab(),
      });
      if (!result.ok) {
        if (result.error === "phone_taken") resetFlow("login");
        if (result.error === "phone_not_found" && authTab !== "register") {
          resetFlow("register");
        }
        setAuthErr(result.message);
        if (result.retryAfterSec) setResendLeft(result.retryAfterSec);
        setAuthBusy(false);
        return;
      }
      setStep("otp");
      setResendLeft(result.resendAfterSec);
      setDebugHint(result.debugCode ? `کد تست: ${result.debugCode}` : "");
      if (!isResend) setOtp("");
      setAuthBusy(false);
    } catch {
      setAuthErr(AI_AUTH_ERRORS.default);
      setAuthBusy(false);
    }
  }

  async function handleVerifyOtp() {
    if (authBusy) return;
    setAuthErr("");
    if (!otp.trim()) {
      setAuthErr(AI_AUTH_ERRORS.missing_otp);
      return;
    }

    if (authTab === "login") {
      setAuthBusy(true);
      try {
        const result = await verifyAiOtp({
          phone: phone.trim(),
          code: otp.trim(),
          purpose: "login",
        });
        if (!result.ok) {
          setAuthErr(result.message);
          setAuthBusy(false);
          return;
        }
        setAuthBusy(false);
        onSuccess({ tab: "login", user: result.user });
      } catch {
        setAuthErr(AI_AUTH_ERRORS.default);
        setAuthBusy(false);
      }
      return;
    }

    // register / reset → password step
    setStep("password");
  }

  async function handlePasswordSubmit() {
    if (authBusy) return;
    setAuthErr("");
    if (!password.trim() || password.trim().length < 6) {
      setAuthErr(AI_AUTH_ERRORS.password_too_short);
      return;
    }
    setAuthBusy(true);
    try {
      if (authTab === "login" && loginMethod === "password") {
        const result = await loginAiUser({
          phone: phone.trim(),
          password,
        });
        if (!result.ok) {
          setAuthErr(result.message);
          setAuthBusy(false);
          return;
        }
        setAuthBusy(false);
        onSuccess({ tab: "login", user: result.user });
        return;
      }

      const utm = pickUtmForDb(getUtmParams());
      const result = await verifyAiOtp({
        phone: phone.trim(),
        code: otp.trim(),
        purpose: purposeForTab(),
        password,
        utm: authTab === "register" ? utm : undefined,
      });
      if (!result.ok) {
        setAuthErr(result.message);
        setAuthBusy(false);
        return;
      }
      setAuthBusy(false);
      onSuccess({
        tab: authTab,
        user: result.user,
        referralCode: result.referralCode,
      });
    } catch {
      setAuthErr(AI_AUTH_ERRORS.default);
      setAuthBusy(false);
    }
  }

  function primaryAction() {
    if (authTab === "login" && loginMethod === "password") {
      void handlePasswordSubmit();
      return;
    }
    if (step === "phone") {
      void handleSendOtp(false);
      return;
    }
    if (step === "otp") {
      void handleVerifyOtp();
      return;
    }
    void handlePasswordSubmit();
  }

  const primaryLabel = (() => {
    if (authBusy) return "لطفاً صبر کن…";
    if (authTab === "login" && loginMethod === "password") return "ورود";
    if (step === "phone") return "دریافت کد";
    if (step === "otp") {
      return authTab === "login" ? "ورود" : "ادامه";
    }
    if (authTab === "register") return "شروع رایگان";
    if (authTab === "reset") return "تنظیم رمز جدید";
    return "ورود";
  })();

  const subtitle =
    hint ||
    (authTab === "reset"
      ? "با کد پیامکی، رمز جدید بگذار."
      : authTab === "login" && loginMethod === "password"
        ? "با شماره و رمز وارد شو."
        : "با شماره موبایل و کد پیامکی وارد شو یا ثبت‌نام کن.");

  return (
    <>
      <p className="ar-sheet-sub">{subtitle}</p>

      <div className="ar-tabs">
        <button
          type="button"
          className={`ar-tab${authTab === "register" ? " active" : ""}`}
          onClick={() => resetFlow("register")}
        >
          ثبت‌نام
        </button>
        <button
          type="button"
          className={`ar-tab${authTab === "login" ? " active" : ""}`}
          onClick={() => resetFlow("login")}
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
          onKeyDown={(e) => e.key === "Enter" && primaryAction()}
          autoComplete="tel"
          disabled={step !== "phone" && !(authTab === "login" && loginMethod === "password")}
        />
      </div>

      {authTab === "login" && loginMethod === "password" && (
        <div className="ar-field">
          <label>رمز عبور</label>
          <input
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && primaryAction()}
            autoComplete="current-password"
          />
        </div>
      )}

      {!(authTab === "login" && loginMethod === "password") && step !== "phone" && (
        <div className="ar-field">
          <label>کد تأیید</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="کد ۵ رقمی پیامک"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 5))}
            onKeyDown={(e) => e.key === "Enter" && primaryAction()}
            autoComplete="one-time-code"
            disabled={step === "password"}
          />
        </div>
      )}

      {step === "password" && authTab !== "login" && (
        <div className="ar-field">
          <label>{authTab === "reset" ? "رمز جدید" : "رمز عبور"}</label>
          <input
            type="password"
            placeholder="حداقل ۶ کاراکتر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && primaryAction()}
            autoComplete="new-password"
          />
        </div>
      )}

      {authErr && <div className="ar-auth-err">{authErr}</div>}
      {debugHint && <p className="ar-auth-note">{debugHint}</p>}

      <button
        type="button"
        className="ar-btn ar-btn-primary ar-btn-block"
        onClick={primaryAction}
        disabled={authBusy}
      >
        {primaryLabel}
      </button>

      {!(authTab === "login" && loginMethod === "password") && step !== "phone" && (
        <button
          type="button"
          className="ar-auth-link"
          disabled={authBusy || resendLeft > 0}
          onClick={() => void handleSendOtp(true)}
        >
          {resendLeft > 0 ? `ارسال مجدد تا ${resendLeft} ثانیه` : "ارسال مجدد کد"}
        </button>
      )}

      {authTab === "login" && (
        <button
          type="button"
          className="ar-auth-link"
          onClick={() => {
            setLoginMethod((m) => (m === "otp" ? "password" : "otp"));
            setStep("phone");
            setOtp("");
            setPassword("");
            setAuthErr("");
            setDebugHint("");
          }}
        >
          {loginMethod === "otp" ? "ورود با رمز عبور" : "ورود با کد پیامکی"}
        </button>
      )}

      {authTab === "login" && (
        <button
          type="button"
          className="ar-auth-link"
          onClick={() => resetFlow("reset")}
        >
          فراموشی رمز عبور
        </button>
      )}

      {authTab === "reset" && (
        <button type="button" className="ar-auth-link" onClick={() => resetFlow("login")}>
          بازگشت به ورود
        </button>
      )}

      {authTab === "register" && step === "phone" && (
        <p className="ar-auth-note">۱۰ پیام رایگان بعد از ثبت‌نام فعال می‌شود.</p>
      )}
    </>
  );
}
