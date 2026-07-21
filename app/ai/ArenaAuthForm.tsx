"use client";

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type Ref,
} from "react";
import {
  loginAiUser,
  sendAiOtp,
  verifyAiOtp,
  type AiAuthUser,
} from "@/lib/aiAuthClient";
import { AI_AUTH_ERRORS } from "@/lib/aiAuthErrors";
import { AI_OTP_LENGTH } from "@/lib/aiOtp";
import { pickUtmForDb, getUtmParams } from "@/lib/utm";
import { FREE_SIGNUP_CREDITS } from "@/lib/aiPricingConfig";

export type ArenaAuthTab = "register" | "login" | "reset";

type Step = "phone" | "otp" | "password" | "terms";
type Mode = "auth" | "password" | "reset";

type Props = {
  hint?: string;
  phoneRef?: Ref<HTMLInputElement>;
  onSuccess: (result: {
    tab: ArenaAuthTab;
    user: AiAuthUser;
    referralCode?: string;
  }) => void;
};

const TERMS_SECTIONS = [
  {
    title: "قوانین و مقررات",
    body: "استفاده از آرایه AI به معنای پذیرش این شرایط است. لطفاً قبل از ثبت‌نام آن‌ها را بخوان.",
  },
  {
    title: "پذیرش شرایط استفاده",
    body: "با ورود یا ثبت‌نام، سیاست‌ها و قوانین پلتفرم آرایه را می‌پذیری و متعهد می‌شوی از سرویس مطابق قوانین جمهوری اسلامی ایران استفاده کنی.",
  },
  {
    title: "خدمات ارائه‌شده",
    body: "آرایه AI دسترسی به گفتگو، تولید محتوا، تصویر، ویدیو، موسیقی و ابزارهای مرتبط را از طریق مدل‌های هوش مصنوعی فراهم می‌کند. کیفیت خروجی به مدل و تنظیمات انتخابی بستگی دارد.",
  },
  {
    title: "شرایط استفاده از اعتبار",
    body: "اعتبار واحد داخلی مصرف امکانات است. با هر پیام یا تولید رسانه، بخشی از اعتبار کم می‌شود. اعتبار رایگان ثبت‌نام و بسته‌های خریداری‌شده قابل انتقال به دیگران نیستند.",
  },
  {
    title: "مسئولیت محتوا",
    body: "مسئولیت محتوای تولیدشده و نحوه استفاده از آن با کاربر است. از تولید محتوای غیرقانونی، آسیب‌زا یا ناقض حقوق دیگران خودداری کن.",
  },
  {
    title: "حریم خصوصی",
    body: "شماره موبایل برای احراز هویت و ارسال کد تأیید استفاده می‌شود. جزئیات بیشتر در صفحه درباره ما و سیاست حریم خصوصی آرایه آمده است.",
  },
];

function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function normalizePhoneInput(value: string): string {
  let digits = toLatinDigits(value).replace(/\D/g, "");
  if (digits.startsWith("98") && digits.length > 10) digits = `0${digits.slice(2)}`;
  if (digits.length === 10 && digits.startsWith("9")) digits = `0${digits}`;
  return digits.slice(0, 11);
}

function formatResendWait(sec: number): string {
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${m} دقیقه`;
  }
  return `${sec} ثانیه`;
}

export default function ArenaAuthForm({
  hint,
  phoneRef: externalPhoneRef,
  onSuccess,
}: Props) {
  const internalPhoneRef = useRef<HTMLInputElement>(null);
  const phoneRef = externalPhoneRef ?? internalPhoneRef;
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [mode, setMode] = useState<Mode>("auth");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(() =>
    Array.from({ length: AI_OTP_LENGTH }, () => "")
  );
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [resendLeft, setResendLeft] = useState(0);
  const [debugHint, setDebugHint] = useState("");
  const [termsFrom, setTermsFrom] = useState<Step>("phone");

  const otpCode = otpDigits.join("");

  useEffect(() => {
    if (resendLeft <= 0) return;
    const t = setTimeout(() => setResendLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendLeft]);

  useEffect(() => {
    if (step === "otp") {
      const firstEmpty = otpDigits.findIndex((d) => !d);
      const idx = firstEmpty === -1 ? AI_OTP_LENGTH - 1 : firstEmpty;
      otpRefs.current[idx]?.focus();
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  function openTerms() {
    setTermsFrom(step);
    setStep("terms");
  }

  function closeTerms() {
    setStep(termsFrom);
  }

  function resetToAuthPhone() {
    setMode("auth");
    setStep("phone");
    setOtpDigits(Array.from({ length: AI_OTP_LENGTH }, () => ""));
    setPassword("");
    setAuthErr("");
    setDebugHint("");
    setResendLeft(0);
  }

  async function handleSendOtp(isResend = false) {
    if (authBusy) return;
    setAuthErr("");
    const normalized = normalizePhoneInput(phone);
    if (normalized.length !== 11) {
      setAuthErr(AI_AUTH_ERRORS.invalid_phone);
      return;
    }
    setPhone(normalized);
    setAuthBusy(true);
    try {
      const purpose = mode === "reset" ? "reset" : "auth";
      const result = await sendAiOtp({ phone: normalized, purpose });
      if (!result.ok) {
        setAuthErr(result.message);
        if (result.retryAfterSec) setResendLeft(result.retryAfterSec);
        setAuthBusy(false);
        return;
      }
      setStep("otp");
      setResendLeft(result.resendAfterSec);
      setDebugHint(result.debugCode ? `کد تست: ${result.debugCode}` : "");
      if (!isResend) {
        setOtpDigits(Array.from({ length: AI_OTP_LENGTH }, () => ""));
      }
      setAuthBusy(false);
    } catch {
      setAuthErr(AI_AUTH_ERRORS.default);
      setAuthBusy(false);
    }
  }

  async function submitOtp(code: string) {
    if (authBusy) return;
    if (code.length !== AI_OTP_LENGTH) {
      setAuthErr(AI_AUTH_ERRORS.missing_otp);
      return;
    }
    setAuthErr("");
    setAuthBusy(true);
    try {
      if (mode === "reset") {
        setStep("password");
        setAuthBusy(false);
        return;
      }

      const utm = pickUtmForDb(getUtmParams());
      const result = await verifyAiOtp({
        phone: normalizePhoneInput(phone),
        code,
        purpose: "auth",
        utm,
      });
      if (!result.ok) {
        setAuthErr(result.message);
        setAuthBusy(false);
        return;
      }
      setAuthBusy(false);
      onSuccess({
        tab: result.isNewUser ? "register" : "login",
        user: result.user,
        referralCode: result.referralCode,
      });
    } catch {
      setAuthErr(AI_AUTH_ERRORS.default);
      setAuthBusy(false);
    }
  }

  async function handlePasswordSubmit() {
    if (authBusy) return;
    setAuthErr("");
    if (mode === "password") {
      if (!normalizePhoneInput(phone) || !password.trim()) {
        setAuthErr(AI_AUTH_ERRORS.missing_fields);
        return;
      }
      setAuthBusy(true);
      try {
        const result = await loginAiUser({
          phone: normalizePhoneInput(phone),
          password,
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

    if (!password.trim() || password.trim().length < 6) {
      setAuthErr(AI_AUTH_ERRORS.password_too_short);
      return;
    }
    setAuthBusy(true);
    try {
      const result = await verifyAiOtp({
        phone: normalizePhoneInput(phone),
        code: otpCode,
        purpose: "reset",
        password,
      });
      if (!result.ok) {
        setAuthErr(result.message);
        setAuthBusy(false);
        return;
      }
      setAuthBusy(false);
      onSuccess({ tab: "reset", user: result.user });
    } catch {
      setAuthErr(AI_AUTH_ERRORS.default);
      setAuthBusy(false);
    }
  }

  function setOtpAt(index: number, raw: string) {
    const digit = toLatinDigits(raw).replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      const joined = next.join("");
      if (joined.length === AI_OTP_LENGTH && next.every(Boolean)) {
        queueMicrotask(() => void submitOtp(joined));
      }
      return next;
    });
    if (digit && index < AI_OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function onOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      e.preventDefault();
    }
    if (e.key === "Enter") {
      void submitOtp(otpCode);
    }
  }

  function onOtpPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = toLatinDigits(e.clipboardData.getData("text"))
      .replace(/\D/g, "")
      .slice(0, AI_OTP_LENGTH);
    if (!pasted) return;
    const next = Array.from({ length: AI_OTP_LENGTH }, (_, i) => pasted[i] || "");
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, AI_OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
    if (pasted.length === AI_OTP_LENGTH) {
      queueMicrotask(() => void submitOtp(pasted));
    }
  }

  if (step === "terms") {
    return (
      <div className="ar-auth-terms">
        <div className="ar-auth-terms-scroll">
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title} className="ar-auth-terms-section">
              <h4>{section.title}</h4>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
        <button type="button" className="ar-auth-terms-close" onClick={closeTerms} aria-label="بستن قوانین">
          ×
        </button>
      </div>
    );
  }

  if (mode === "password") {
    return (
      <>
        <h3 className="ar-auth-title">ورود با رمز</h3>
        <p className="ar-sheet-sub">شماره و رمز عبور حسابت را وارد کن.</p>
        <div className="ar-field">
          <label>شماره موبایل</label>
          <div className="ar-phone-field">
            <span className="ar-phone-prefix" aria-hidden>
              +۹۸
            </span>
            <input
              ref={phoneRef}
              type="tel"
              inputMode="tel"
              placeholder="912xxxxxxx"
              value={phone.startsWith("0") ? phone.slice(1) : phone}
              onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
              autoComplete="tel"
            />
          </div>
        </div>
        <div className="ar-field">
          <label>رمز عبور</label>
          <input
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handlePasswordSubmit()}
            autoComplete="current-password"
          />
        </div>
        {authErr && <div className="ar-auth-err">{authErr}</div>}
        <button
          type="button"
          className="ar-btn ar-btn-primary ar-btn-block"
          onClick={() => void handlePasswordSubmit()}
          disabled={authBusy}
        >
          {authBusy ? "لطفاً صبر کن…" : "ورود"}
        </button>
        <button type="button" className="ar-auth-link" onClick={resetToAuthPhone}>
          ورود با کد پیامکی
        </button>
        <button
          type="button"
          className="ar-auth-link"
          onClick={() => {
            setMode("reset");
            setStep("phone");
            setPassword("");
            setAuthErr("");
          }}
        >
          فراموشی رمز عبور
        </button>
      </>
    );
  }

  if (step === "otp") {
    const masked = normalizePhoneInput(phone).replace(/^(\d{4})\d+(\d{2})$/, "$1***$2");
    return (
      <>
        <h3 className="ar-auth-title">کد تأیید</h3>
        <p className="ar-sheet-sub">
          کد ۵ رقمی ارسال‌شده به <span className="ar-auth-phone-ltr">{masked}</span> را وارد کن.
        </p>

        <div className="ar-otp-row" dir="ltr" onPaste={onOtpPaste}>
          {otpDigits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                otpRefs.current[i] = el;
              }}
              className="ar-otp-cell"
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              aria-label={`رقم ${i + 1}`}
              onChange={(e) => setOtpAt(i, e.target.value)}
              onKeyDown={(e) => onOtpKeyDown(i, e)}
              disabled={authBusy}
            />
          ))}
        </div>

        {authErr && <div className="ar-auth-err">{authErr}</div>}
        {debugHint && <p className="ar-auth-note">{debugHint}</p>}

        <button
          type="button"
          className="ar-btn ar-btn-primary ar-btn-block"
          onClick={() => void submitOtp(otpCode)}
          disabled={authBusy || otpCode.length !== AI_OTP_LENGTH}
        >
          {authBusy ? "لطفاً صبر کن…" : mode === "reset" ? "ادامه" : "تأیید و ورود"}
        </button>

        <button
          type="button"
          className="ar-auth-link"
          disabled={authBusy || resendLeft > 0}
          onClick={() => void handleSendOtp(true)}
        >
          {resendLeft > 0
            ? `ارسال مجدد تا ${formatResendWait(resendLeft)}`
            : "ارسال مجدد کد"}
        </button>
        <button
          type="button"
          className="ar-auth-link"
          onClick={() => {
            setStep("phone");
            setOtpDigits(Array.from({ length: AI_OTP_LENGTH }, () => ""));
            setAuthErr("");
          }}
        >
          اصلاح شماره
        </button>
      </>
    );
  }

  if (step === "password" && mode === "reset") {
    return (
      <>
        <h3 className="ar-auth-title">رمز جدید</h3>
        <p className="ar-sheet-sub">یک رمز جدید برای حسابت انتخاب کن.</p>
        <div className="ar-field">
          <label>رمز عبور</label>
          <input
            type="password"
            placeholder="حداقل ۶ کاراکتر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handlePasswordSubmit()}
            autoComplete="new-password"
          />
        </div>
        {authErr && <div className="ar-auth-err">{authErr}</div>}
        <button
          type="button"
          className="ar-btn ar-btn-primary ar-btn-block"
          onClick={() => void handlePasswordSubmit()}
          disabled={authBusy}
        >
          {authBusy ? "لطفاً صبر کن…" : "ذخیره رمز"}
        </button>
        <button type="button" className="ar-auth-link" onClick={resetToAuthPhone}>
          بازگشت
        </button>
      </>
    );
  }

  // phone step (auth or reset)
  return (
    <>
      <h3 className="ar-auth-title">
        {mode === "reset" ? "بازیابی رمز" : "ورود یا ثبت‌نام"}
      </h3>
      <p className="ar-sheet-sub">
        {hint ||
          (mode === "reset"
            ? "شماره موبایلت را وارد کن تا کد بازیابی برایت ارسال شود."
            : `با ثبت‌نام در آرایه AI، استفاده رایگان از مدل‌های مختلف هوش مصنوعی را شروع کن (${FREE_SIGNUP_CREDITS} پیام هدیه).`)}
      </p>

      <div className="ar-field">
        <label>شماره موبایل</label>
        <div className="ar-phone-field">
          <span className="ar-phone-prefix" aria-hidden>
            +۹۸
          </span>
          <input
            ref={phoneRef}
            type="tel"
            inputMode="tel"
            placeholder="912xxxxxxx"
            value={phone.startsWith("0") ? phone.slice(1) : phone}
            onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && void handleSendOtp(false)}
            autoComplete="tel"
          />
        </div>
      </div>

      <p className="ar-auth-legal">
        با ورود به آرایه،{" "}
        <button type="button" className="ar-auth-legal-link" onClick={openTerms}>
          قوانین و مقررات آرایه
        </button>{" "}
        را می‌پذیری.
      </p>

      {authErr && <div className="ar-auth-err">{authErr}</div>}

      <button
        type="button"
        className="ar-btn ar-btn-primary ar-btn-block"
        onClick={() => void handleSendOtp(false)}
        disabled={authBusy}
      >
        {authBusy ? "لطفاً صبر کن…" : "ارسال"}
      </button>

      {mode === "auth" ? (
        <>
          <div className="ar-auth-divider">
            <span>ادامه از طریق رمز</span>
          </div>
          <button
            type="button"
            className="ar-auth-link"
            onClick={() => {
              setMode("password");
              setAuthErr("");
            }}
          >
            ورود با رمز عبور
          </button>
        </>
      ) : (
        <button type="button" className="ar-auth-link" onClick={resetToAuthPhone}>
          بازگشت به ورود
        </button>
      )}
    </>
  );
}
