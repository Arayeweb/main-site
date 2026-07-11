import { describe, expect, it } from "vitest";
import {
  hasRequiredPublicPresentation,
  mergeCampaignPresentation,
  normalizeAdReadyTemplateKey,
  normalizeAdReadyThemeKey,
  validateCampaignPresentationUpdate,
} from "@/lib/adreadyPresentation";

function generatedContent() {
  return {
    headline: "تیتر اصلی AI",
    subheadline: "زیرتیتر اصلی کمپین",
    problemBullets: ["مسئله اول", "مسئله دوم"],
    benefits: ["مزیت اول", "مزیت دوم", "مزیت سوم"],
    offerSection: {
      title: "پیشنهاد اصلی",
      description: "توضیح پیشنهاد",
      bullets: ["مورد اول", "مورد دوم"],
    },
    faq: [
      { question: "پرسش اول؟", answer: "پاسخ اول" },
      { question: "پرسش دوم؟", answer: "پاسخ دوم" },
    ],
    objections: [
      { objection: "اعتراض اول", response: "پاسخ اعتراض اول" },
      { objection: "اعتراض دوم", response: "پاسخ اعتراض دوم" },
    ],
    ctaText: "ثبت درخواست",
    formTitle: "فرم درخواست",
    thankYouMessage: "سپاس از درخواست شما",
    adCopyAngles: [
      { channel: "Instagram", angle: "زاویه اول", copy: "متن تبلیغ" },
    ],
    whatsappMessage: "سلام، اطلاعات بیشتری می‌خواهم.",
  };
}

function validUpdate() {
  const content = generatedContent();
  const { adCopyAngles: _adCopyAngles, ...editable } = content;
  return {
    content: editable,
    contactPhone: "09121234567",
    whatsappNumber: "",
    telegramUsername: "",
    templateKey: "clinic",
    themeKey: "warm",
  };
}

describe("AdReady campaign presentation", () => {
  it("deep-merges custom edits while preserving original AI-only ad copy", () => {
    const generated = generatedContent();
    const merged = mergeCampaignPresentation(generated, {
      headline: "تیتر ویرایش‌شده",
      benefits: ["تنها مزیت سفارشی"],
      offerSection: { title: "پیشنهاد سفارشی" },
    });

    expect(merged).toMatchObject({
      headline: "تیتر ویرایش‌شده",
      subheadline: generated.subheadline,
      benefits: ["تنها مزیت سفارشی"],
      offerSection: {
        title: "پیشنهاد سفارشی",
        description: generated.offerSection.description,
      },
      adCopyAngles: generated.adCopyAngles,
    });
    expect(generated.headline).toBe("تیتر اصلی AI");
  });

  it("falls back safely for unknown templates and themes", () => {
    expect(normalizeAdReadyTemplateKey("missing-template")).toBe("clean-service");
    expect(normalizeAdReadyTemplateKey("Clean Service")).toBe("clean-service");
    expect(normalizeAdReadyThemeKey("missing-theme")).toBe("default");
  });

  it("validates editable content, structured lists, and a contact method", () => {
    const valid = validateCampaignPresentationUpdate(validUpdate());
    expect(valid.ok).toBe(true);

    const missingContact = validUpdate();
    missingContact.contactPhone = "";
    expect(validateCampaignPresentationUpdate(missingContact)).toEqual({
      ok: false,
      error: "missing_contact_method",
    });

    const malformedFaq = validUpdate();
    malformedFaq.content.faq = [{ question: "بدون پاسخ", answer: "" }];
    expect(validateCampaignPresentationUpdate(malformedFaq)).toEqual({
      ok: false,
      error: "invalid_content_structure",
    });
  });

  it("requires core content and one contact method for public rendering", () => {
    const content = mergeCampaignPresentation(generatedContent(), {});
    expect(
      hasRequiredPublicPresentation(content, { contactPhone: "09121234567" })
    ).toBe(true);
    expect(hasRequiredPublicPresentation(content, {})).toBe(false);
    expect(
      hasRequiredPublicPresentation({ ...content, benefits: [] }, {
        contactPhone: "09121234567",
      })
    ).toBe(false);
  });
});
