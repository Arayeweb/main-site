"use client";

import { useState } from "react";
import { submitShowcaseLead } from "@/lib/showcaseSites/lead";
import {
  medisaContact,
  medisaProjectStatuses,
  medisaProjectTypes,
} from "@/lib/showcaseSites/medisa/config";
import styles from "./medisa.module.css";

type FieldErrors = Partial<
  Record<"name" | "phone" | "projectType" | "city" | "status" | "area", string>
>;

function validateFields(values: {
  name: string;
  phone: string;
  projectType: string;
  city: string;
  status: string;
  area: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = "نام و نام خانوادگی را وارد کنید.";
  } else if (values.name.trim().length < 3) {
    errors.name = "نام باید حداقل ۳ حرف باشد.";
  }

  if (!values.phone.trim()) {
    errors.phone = "شماره تماس را وارد کنید.";
  }

  if (!values.city.trim()) {
    errors.city = "شهر یا محل پروژه را وارد کنید.";
  }

  if (!values.area.trim()) {
    errors.area = "متراژ تقریبی را وارد کنید.";
  } else if (!/^\d+/.test(values.area.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)))) {
    errors.area = "متراژ را به عدد وارد کنید.";
  }

  return errors;
}

export default function MedisaInquiryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [projectType, setProjectType] = useState<string>(medisaProjectTypes[0]);
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<string>(medisaProjectStatuses[0]);
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const errors = validateFields({ name, phone, projectType, city, status, area });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    const result = await submitShowcaseLead({
      source: "showcase-medisa-studio",
      page: "/showcase/medisa-studio",
      name,
      contact: phone,
      goal: "project_inquiry",
      detail: [
        `نوع پروژه: ${projectType}`,
        `شهر: ${city}`,
        `وضعیت: ${status}`,
        `متراژ: ${area}`,
        notes ? `توضیحات: ${notes}` : null,
      ]
        .filter(Boolean)
        .join(" | "),
    });

    setLoading(false);

    if (!result.ok) {
      if (result.error === "validation") {
        setFieldErrors((prev) => ({ ...prev, phone: result.message }));
      } else {
        setError(result.message);
      }
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className={styles.formSuccess} role="status" aria-live="polite">
        <h3>درخواست شما ثبت شد</h3>
        <p>به‌زودی برای گفتگوی اولیه درباره پروژه با شما تماس می‌گیریم.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label htmlFor="medisa-name">نام و نام خانوادگی</label>
          <input
            id="medisa-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
            }}
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? "medisa-name-error" : undefined}
          />
          {fieldErrors.name ? (
            <p id="medisa-name-error" className={styles.fieldError} role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className={styles.formField}>
          <label htmlFor="medisa-phone">شماره تماس</label>
          <input
            id="medisa-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            dir="ltr"
            placeholder="09xxxxxxxxx"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: undefined }));
            }}
            aria-invalid={fieldErrors.phone ? true : undefined}
            aria-describedby={fieldErrors.phone ? "medisa-phone-error" : undefined}
          />
          {fieldErrors.phone ? (
            <p id="medisa-phone-error" className={styles.fieldError} role="alert">
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label htmlFor="medisa-project-type">نوع پروژه</label>
          <select
            id="medisa-project-type"
            name="projectType"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
          >
            {medisaProjectTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label htmlFor="medisa-city">شهر / محل پروژه</label>
          <input
            id="medisa-city"
            name="city"
            type="text"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              if (fieldErrors.city) setFieldErrors((p) => ({ ...p, city: undefined }));
            }}
            aria-invalid={fieldErrors.city ? true : undefined}
            aria-describedby={fieldErrors.city ? "medisa-city-error" : undefined}
          />
          {fieldErrors.city ? (
            <p id="medisa-city-error" className={styles.fieldError} role="alert">
              {fieldErrors.city}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label htmlFor="medisa-status">وضعیت پروژه</label>
          <select
            id="medisa-status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {medisaProjectStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label htmlFor="medisa-area">متراژ تقریبی (متر مربع)</label>
          <input
            id="medisa-area"
            name="area"
            type="text"
            inputMode="numeric"
            placeholder="مثلاً ۱۵۰"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              if (fieldErrors.area) setFieldErrors((p) => ({ ...p, area: undefined }));
            }}
            aria-invalid={fieldErrors.area ? true : undefined}
            aria-describedby={fieldErrors.area ? "medisa-area-error" : undefined}
          />
          {fieldErrors.area ? (
            <p id="medisa-area-error" className={styles.fieldError} role="alert">
              {fieldErrors.area}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.formField}>
        <label htmlFor="medisa-notes">توضیحات (اختیاری)</label>
        <textarea
          id="medisa-notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error ? (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className={styles.btnSubmit} disabled={loading}>
        {loading ? "در حال ارسال..." : "ارسال درخواست"}
      </button>

      <p style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "var(--md-stone)" }}>
        یا تماس مستقیم:{" "}
        <a href={medisaContact.phoneTel} dir="ltr">
          {medisaContact.phone}
        </a>
      </p>

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
