"use client";

import { useState } from "react";
import { submitShowcaseLead } from "@/lib/showcaseSites/lead";
import { sfContact, sfRequestTypes } from "@/lib/showdemoto/salamat-farda/config";
import styles from "./salamat-farda.module.css";

export default function SalamatFardaContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requestType, setRequestType] = useState<string>(sfRequestTypes[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await submitShowcaseLead({
      source: "showdemoto-salamat-farda-eye",
      page: "/showdemoto/salamat-farda-eye",
      name,
      contact: phone,
      goal: "appointment_request",
      detail: `نوع درخواست: ${requestType}${notes ? ` | توضیحات: ${notes}` : ""}`,
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className={styles.formSuccess} role="status" aria-live="polite">
        <h3>درخواست شما ثبت شد</h3>
        <p>به‌زودی برای هماهنگی نوبت با شما تماس می‌گیریم.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGrid}>
        <div>
          <label htmlFor="sf-name">نام و نام خانوادگی</label>
          <input
            id="sf-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sf-phone">شماره تماس</label>
          <input
            id="sf-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            dir="ltr"
            required
            placeholder="09xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sf-request">نوع درخواست</label>
          <select
            id="sf-request"
            name="requestType"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
          >
            {sfRequestTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sf-notes">توضیحات (اختیاری)</label>
          <textarea
            id="sf-notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.heroActions} style={{ marginTop: "1rem" }}>
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? "در حال ارسال..." : "ثبت درخواست نوبت"}
        </button>
        <a href={sfContact.phoneTel} className={styles.btnSecondary}>
          تماس تلفنی
        </a>
        <a
          href={sfContact.telegram}
          className={styles.btnGhost}
          target="_blank"
          rel="noopener noreferrer"
        >
          تلگرام
        </a>
      </div>

      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className={styles.hidden}
        aria-hidden
      />
    </form>
  );
}
