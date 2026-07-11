"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Plus, Save, Trash2 } from "lucide-react";
import type { CampaignPage } from "@/lib/adready";
import {
  ADREADY_TEMPLATE_KEYS,
  ADREADY_THEME_KEYS,
  campaignContentForEdit,
  normalizeAdReadyTemplateKey,
  normalizeAdReadyThemeKey,
  type CampaignPresentationContent,
} from "@/lib/adreadyPresentation";
import { buildAdReadyLoginUrl } from "@/lib/adreadyAuth";
import styles from "./dashboard.module.css";

type EditableContent = Omit<CampaignPresentationContent, "adCopyAngles">;
type SaveState = "idle" | "saving" | "success" | "error";

const TEMPLATE_LABELS: Record<(typeof ADREADY_TEMPLATE_KEYS)[number], string> = {
  "clean-service": "Clean Service",
  "local-business": "Local Business",
  "online-shop": "Online Shop",
  clinic: "Clinic",
  education: "Education",
  saas: "SaaS",
};

const THEME_LABELS: Record<(typeof ADREADY_THEME_KEYS)[number], string> = {
  default: "پیش‌فرض",
  dark: "تیره",
  premium: "پریمیوم",
  warm: "گرم",
  minimal: "مینیمال",
};

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function saveErrorMessage(code?: string): string {
  switch (code) {
    case "missing_required_public_content":
      return "تیتر، زیرتیتر، CTA و حداقل یک مزیت الزامی است.";
    case "missing_contact_method":
      return "حداقل یک راه تماس وارد کنید.";
    case "invalid_contact_method":
      return "فرمت شماره تماس یا نام کاربری تلگرام معتبر نیست.";
    case "invalid_content_structure":
    case "invalid_offer":
      return "ساختار بخش‌های محتوا معتبر نیست.";
    default:
      return "ذخیره تغییرات انجام نشد. دوباره تلاش کنید.";
  }
}

export default function CampaignPresentationEditor({
  campaign,
}: {
  campaign: CampaignPage;
}) {
  const [content, setContent] = useState<EditableContent>(() =>
    campaignContentForEdit(campaign.generatedContent, campaign.customContent)
  );
  const [contactPhone, setContactPhone] = useState(campaign.contactPhone || "");
  const [whatsappNumber, setWhatsappNumber] = useState(
    campaign.whatsappNumber || ""
  );
  const [telegramUsername, setTelegramUsername] = useState(
    campaign.telegramUsername || ""
  );
  const [templateKey, setTemplateKey] = useState(
    normalizeAdReadyTemplateKey(campaign.templateKey)
  );
  const [themeKey, setThemeKey] = useState(
    normalizeAdReadyThemeKey(campaign.themeKey)
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function markDirty() {
    setSaveState("idle");
    setMessage("");
  }

  function update<K extends keyof EditableContent>(
    key: K,
    value: EditableContent[K]
  ) {
    setContent((current) => ({ ...current, [key]: value }));
    markDirty();
  }

  function updateOffer(
    key: keyof EditableContent["offerSection"],
    value: string | string[]
  ) {
    setContent((current) => ({
      ...current,
      offerSection: { ...current.offerSection, [key]: value },
    }));
    markDirty();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaveState("saving");
    setMessage("");
    try {
      const response = await fetch(
        `/api/adready/campaigns/${campaign.id}/presentation`,
        {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            contactPhone,
            whatsappNumber,
            telegramUsername,
            templateKey,
            themeKey,
          }),
        }
      );
      if (response.status === 401) {
        window.location.assign(
          buildAdReadyLoginUrl({
            mode: "login",
            next: `/dashboard/adready/pages/${campaign.id}/edit`,
          }),
        );
        return;
      }
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !data.ok) throw new Error(data.error || "save_failed");
      setSaveState("success");
      setMessage("تغییرات در محتوای سفارشی ذخیره شد.");
    } catch (error) {
      setSaveState("error");
      setMessage(saveErrorMessage(error instanceof Error ? error.message : undefined));
    }
  }

  return (
    <form className={styles.editor} onSubmit={submit}>
      <section className={styles.editorSection}>
        <div className={styles.editorSectionHead}>
          <h2>محتوای اصلی</h2>
          <p>این تغییرات روی خروجی اصلی AI نوشته نمی‌شوند.</p>
        </div>
        <div className={styles.fields}>
          <label className={`${styles.field} ${styles.wide}`}>
            <span>تیتر اصلی *</span>
            <input
              value={content.headline}
              onChange={(event) => update("headline", event.target.value)}
              maxLength={180}
              required
            />
          </label>
          <label className={`${styles.field} ${styles.wide}`}>
            <span>زیرتیتر *</span>
            <textarea
              value={content.subheadline}
              onChange={(event) => update("subheadline", event.target.value)}
              maxLength={600}
              rows={3}
              required
            />
          </label>
          <label className={styles.field}>
            <span>متن CTA *</span>
            <input
              value={content.ctaText}
              onChange={(event) => update("ctaText", event.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label className={styles.field}>
            <span>عنوان فرم</span>
            <input
              value={content.formTitle}
              onChange={(event) => update("formTitle", event.target.value)}
              maxLength={180}
            />
          </label>
          <label className={`${styles.field} ${styles.wide}`}>
            <span>پیام تشکر</span>
            <input
              value={content.thankYouMessage}
              onChange={(event) => update("thankYouMessage", event.target.value)}
              maxLength={600}
            />
          </label>
        </div>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHead}>
          <h2>مسئله، مزیت و پیشنهاد</h2>
          <p>هر مورد را در یک خط جداگانه وارد کنید.</p>
        </div>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>مسئله‌های مخاطب</span>
            <textarea
              value={content.problemBullets.join("\n")}
              onChange={(event) => update("problemBullets", lines(event.target.value))}
              rows={6}
              maxLength={4000}
            />
          </label>
          <label className={styles.field}>
            <span>مزیت‌ها *</span>
            <textarea
              value={content.benefits.join("\n")}
              onChange={(event) => update("benefits", lines(event.target.value))}
              rows={6}
              maxLength={4800}
              required
            />
          </label>
          <label className={styles.field}>
            <span>عنوان پیشنهاد</span>
            <input
              value={content.offerSection.title}
              onChange={(event) => updateOffer("title", event.target.value)}
              maxLength={180}
            />
          </label>
          <label className={styles.field}>
            <span>بولت‌های پیشنهاد</span>
            <textarea
              value={content.offerSection.bullets.join("\n")}
              onChange={(event) => updateOffer("bullets", lines(event.target.value))}
              rows={4}
              maxLength={4000}
            />
          </label>
          <label className={`${styles.field} ${styles.wide}`}>
            <span>توضیح پیشنهاد</span>
            <textarea
              value={content.offerSection.description}
              onChange={(event) => updateOffer("description", event.target.value)}
              maxLength={1200}
              rows={4}
            />
          </label>
        </div>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHead}>
          <h2>پرسش‌های پرتکرار</h2>
          <p>پرسش و پاسخ‌ها به صورت متن ساده نمایش داده می‌شوند.</p>
        </div>
        <div className={styles.repeatList}>
          {content.faq.map((item, index) => (
            <div className={styles.repeatCard} key={`faq-${index}`}>
              <label className={styles.field}>
                <span>پرسش</span>
                <input
                  value={item.question}
                  maxLength={300}
                  required
                  onChange={(event) =>
                    update(
                      "faq",
                      content.faq.map((entry, itemIndex) =>
                        itemIndex === index
                          ? { ...entry, question: event.target.value }
                          : entry
                      )
                    )
                  }
                />
              </label>
              <label className={styles.field}>
                <span>پاسخ</span>
                <textarea
                  value={item.answer}
                  maxLength={1200}
                  rows={3}
                  required
                  onChange={(event) =>
                    update(
                      "faq",
                      content.faq.map((entry, itemIndex) =>
                        itemIndex === index
                          ? { ...entry, answer: event.target.value }
                          : entry
                      )
                    )
                  }
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  update(
                    "faq",
                    content.faq.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
              >
                <Trash2 size={13} />
                حذف
              </button>
            </div>
          ))}
          <button
            className={styles.addButton}
            type="button"
            onClick={() =>
              update("faq", [...content.faq, { question: "", answer: "" }])
            }
            disabled={content.faq.length >= 12}
          >
            <Plus size={13} />
            افزودن پرسش
          </button>
        </div>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHead}>
          <h2>پاسخ به اعتراض‌ها</h2>
          <p>این بخش در داده سفارشی ذخیره می‌شود و برای توسعه‌های بعدی آماده است.</p>
        </div>
        <div className={styles.repeatList}>
          {content.objections.map((item, index) => (
            <div className={styles.repeatCard} key={`objection-${index}`}>
              <label className={styles.field}>
                <span>اعتراض</span>
                <input
                  value={item.objection}
                  maxLength={300}
                  required
                  onChange={(event) =>
                    update(
                      "objections",
                      content.objections.map((entry, itemIndex) =>
                        itemIndex === index
                          ? { ...entry, objection: event.target.value }
                          : entry
                      )
                    )
                  }
                />
              </label>
              <label className={styles.field}>
                <span>پاسخ</span>
                <textarea
                  value={item.response}
                  maxLength={1200}
                  rows={3}
                  required
                  onChange={(event) =>
                    update(
                      "objections",
                      content.objections.map((entry, itemIndex) =>
                        itemIndex === index
                          ? { ...entry, response: event.target.value }
                          : entry
                      )
                    )
                  }
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  update(
                    "objections",
                    content.objections.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
              >
                <Trash2 size={13} />
                حذف
              </button>
            </div>
          ))}
          <button
            className={styles.addButton}
            type="button"
            onClick={() =>
              update("objections", [
                ...content.objections,
                { objection: "", response: "" },
              ])
            }
            disabled={content.objections.length >= 12}
          >
            <Plus size={13} />
            افزودن اعتراض
          </button>
        </div>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHead}>
          <h2>راه‌های تماس و پیام</h2>
          <p>حداقل یک راه تماس برای نمایش عمومی لازم است.</p>
        </div>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>شماره تماس</span>
            <input
              value={contactPhone}
              onChange={(event) => {
                setContactPhone(event.target.value);
                markDirty();
              }}
              maxLength={40}
              dir="ltr"
              inputMode="tel"
            />
          </label>
          <label className={styles.field}>
            <span>شماره واتساپ</span>
            <input
              value={whatsappNumber}
              onChange={(event) => {
                setWhatsappNumber(event.target.value);
                markDirty();
              }}
              maxLength={40}
              dir="ltr"
              inputMode="tel"
            />
          </label>
          <label className={styles.field}>
            <span>نام کاربری تلگرام</span>
            <input
              value={telegramUsername}
              onChange={(event) => {
                setTelegramUsername(event.target.value);
                markDirty();
              }}
              maxLength={120}
              dir="ltr"
              placeholder="@username"
            />
          </label>
          <label className={styles.field}>
            <span>پیام آماده واتساپ</span>
            <textarea
              value={content.whatsappMessage}
              onChange={(event) => update("whatsappMessage", event.target.value)}
              maxLength={1200}
              rows={3}
            />
          </label>
        </div>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHead}>
          <h2>قالب و تم</h2>
          <p>قالب چیدمان و تم فضای رنگی صفحه را تغییر می‌دهد.</p>
        </div>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>قالب</span>
            <select
              value={templateKey}
              onChange={(event) => {
                setTemplateKey(
                  event.target.value as (typeof ADREADY_TEMPLATE_KEYS)[number]
                );
                markDirty();
              }}
            >
              {ADREADY_TEMPLATE_KEYS.map((key) => (
                <option key={key} value={key}>{TEMPLATE_LABELS[key]}</option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>تم</span>
            <select
              value={themeKey}
              onChange={(event) => {
                setThemeKey(event.target.value as (typeof ADREADY_THEME_KEYS)[number])
                markDirty();
              }}
            >
              {ADREADY_THEME_KEYS.map((key) => (
                <option key={key} value={key}>{THEME_LABELS[key]}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className={styles.saveBar}>
        <div
          className={`${styles.saveMessage} ${
            saveState === "success"
              ? styles.saveSuccess
              : saveState === "error"
                ? styles.saveError
                : ""
          }`}
          role="status"
        >
          {saveState === "success" && <CheckCircle2 size={14} />}
          {message || "خروجی اصلی AI بدون تغییر باقی می‌ماند."}
        </div>
        <div className={styles.detailActions}>
          <Link
            href={`/dashboard/adready/pages/${campaign.id}`}
            className={styles.secondaryButton}
          >
            پیش‌نمایش
          </Link>
          <button type="submit" disabled={saveState === "saving"}>
            {saveState === "saving" ? (
              <Loader2 className={styles.spin} size={17} />
            ) : (
              <Save size={17} />
            )}
            {saveState === "saving" ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </div>
    </form>
  );
}
