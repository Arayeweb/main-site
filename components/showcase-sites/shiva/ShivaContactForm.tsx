"use client";

import { useState } from "react";
import { submitShowcaseLead } from "@/lib/showcaseSites/lead";
import {
  shivaAgeGroups,
  shivaContact,
  shivaRequestTypes,
} from "@/lib/showcaseSites/shiva/config";
import styles from "./shiva.module.css";

export default function ShivaContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requestType, setRequestType] = useState<string>(shivaRequestTypes[0]);
  const [ageGroup, setAgeGroup] = useState<string>(shivaAgeGroups[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await submitShowcaseLead({
      source: "showcase-shiva-hearing",
      page: "/showcase/shiva-hearing",
      name,
      contact: phone,
      goal: "consultation_request",
      detail: `نوع درخواست: ${requestType} | گروه سنی: ${ageGroup}${notes ? ` | توضیحات: ${notes}` : ""}`,
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
        <p>به‌زودی برای هماهنگی وقت مشاوره با شما تماس می‌گیریم.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGrid}>
        <div>
          <label htmlFor="shiva-name">نام و نام خانوادگی</label>
          <input
            id="shiva-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="shiva-phone">شماره تماس</label>
          <input
            id="shiva-phone"
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
          <label htmlFor="shiva-request">نوع درخواست</label>
          <select
            id="shiva-request"
            name="requestType"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
          >
            {shivaRequestTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="shiva-age">گروه سنی</label>
          <select
            id="shiva-age"
            name="ageGroup"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
          >
            {shivaAgeGroups.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="shiva-notes">توضیحات (اختیاری)</label>
          <textarea
            id="shiva-notes"
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
          {loading ? "در حال ارسال..." : "ثبت درخواست مشاوره"}
        </button>
        <a href={shivaContact.phoneTel} className={styles.btnSecondary}>
          تماس تلفنی
        </a>
        <a
          href={shivaContact.whatsapp}
          className={styles.btnSecondary}
          target="_blank"
          rel="noopener noreferrer"
        >
          واتساپ
        </a>
      </div>

      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
    </form>
  );
}
