"use client";

import { useState } from "react";
import { submitShowcaseLead } from "@/lib/showcaseSites/lead";
import {
  kavehContact,
  kavehProducts,
  kavehUnits,
} from "@/lib/showcaseSites/kaveh/config";
import styles from "./kaveh.module.css";

export default function KavehQuoteForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [productType, setProductType] = useState<string>(kavehProducts[0].name);
  const [specs, setSpecs] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<string>(kavehUnits[1]);
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const detailParts = [
      `نوع محصول: ${productType}`,
      specs ? `مشخصات: ${specs}` : null,
      quantity ? `مقدار: ${quantity} ${unit}` : null,
      city ? `شهر مقصد: ${city}` : null,
      notes ? `توضیحات: ${notes}` : null,
    ].filter(Boolean);

    const result = await submitShowcaseLead({
      source: "showcase-kaveh-iron",
      page: "/showcase/kaveh-iron",
      name,
      contact: phone,
      goal: "price_quote",
      detail: detailParts.join(" | "),
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
        <h3>درخواست استعلام ثبت شد</h3>
        <p>کارشناس فروش به‌زودی برای اعلام قیمت و شرایط با شما تماس می‌گیرد.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGrid}>
        <div>
          <label htmlFor="kaveh-name">نام و نام خانوادگی</label>
          <input
            id="kaveh-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="kaveh-phone">شماره تماس</label>
          <input
            id="kaveh-phone"
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
          <label htmlFor="kaveh-product">نوع محصول</label>
          <select
            id="kaveh-product"
            name="productType"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          >
            {kavehProducts.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="kaveh-specs">سایز / مشخصات</label>
          <input
            id="kaveh-specs"
            name="specs"
            type="text"
            placeholder="مثلاً میلگرد ۱۴ یا ورق ۲ میلی‌متر"
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="kaveh-quantity">مقدار</label>
          <input
            id="kaveh-quantity"
            name="quantity"
            type="text"
            inputMode="numeric"
            placeholder="مثلاً ۲"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="kaveh-unit">واحد</label>
          <select
            id="kaveh-unit"
            name="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            {kavehUnits.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.fullWidth}>
          <label htmlFor="kaveh-city">شهر مقصد</label>
          <input
            id="kaveh-city"
            name="city"
            type="text"
            placeholder="مثلاً تهران"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div className={styles.fullWidth}>
          <label htmlFor="kaveh-notes">توضیحات (اختیاری)</label>
          <textarea
            id="kaveh-notes"
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
          {loading ? "در حال ارسال..." : "ثبت درخواست استعلام"}
        </button>
        <a href={kavehContact.phoneTel} className={styles.btnSecondary}>
          تماس تلفنی
        </a>
        <a
          href={kavehContact.whatsapp}
          className={styles.btnSecondary}
          target="_blank"
          rel="noopener noreferrer"
        >
          واتساپ
        </a>
      </div>

      <input type="text" name="company" tabIndex={-1} autoComplete="off" className={styles.hidden} aria-hidden />
    </form>
  );
}
