import { describe, expect, it } from "vitest";
import {
  parseCampaignPageContent,
  validateCampaignPageContent,
} from "@/lib/adreadyContent";

function validContent() {
  return {
    headline: "یک پیشنهاد روشن برای مخاطب",
    subheadline: "توضیح کوتاه و مستقیم درباره ارزش پیشنهادی کمپین.",
    problemBullets: ["انتخاب مسیر مناسب دشوار است", "اطلاعات پراکنده است"],
    benefits: ["توضیح شفاف", "اقدام ساده", "پاسخ سریع"],
    offerSection: {
      title: "پیشنهاد کمپین",
      description: "اطلاعات لازم را دریافت کنید و آگاهانه تصمیم بگیرید.",
      bullets: ["جزئیات روشن", "راه تماس مستقیم"],
    },
    faq: [
      { question: "این پیشنهاد چیست؟", answer: "راهی برای دریافت اطلاعات کامل‌تر." },
      { question: "چطور اقدام کنم؟", answer: "فرم تماس را تکمیل کنید." },
    ],
    objections: [
      { objection: "هنوز مطمئن نیستم", response: "ابتدا اطلاعات کامل را بررسی کنید." },
      { objection: "زمان ندارم", response: "ثبت درخواست کمتر از یک دقیقه زمان می‌برد." },
    ],
    ctaText: "دریافت اطلاعات",
    formTitle: "درخواست خود را ثبت کنید",
    thankYouMessage: "درخواست شما ثبت شد.",
    adCopyAngles: [
      {
        channel: "Google",
        angle: "راه‌حل روشن",
        copy: "برای دریافت اطلاعات و انتخاب بهتر، وارد صفحه شوید.",
      },
    ],
    whatsappMessage: "سلام، درباره این پیشنهاد اطلاعات بیشتری می‌خواهم.",
  };
}

describe("AdReady structured campaign content", () => {
  it("accepts the complete campaign content contract", () => {
    const result = validateCampaignPageContent(validContent());
    expect(result.success).toBe(true);
  });

  it("rejects missing and undersized required sections", () => {
    const value = validContent();
    value.benefits = [];
    value.faq = [];

    const result = validateCampaignPageContent(value);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.join(" ")).toContain("benefits");
      expect(result.errors.join(" ")).toContain("faq");
    }
  });

  it("extracts valid JSON from a fenced model response", () => {
    const result = parseCampaignPageContent(
      `\`\`\`json\n${JSON.stringify(validContent())}\n\`\`\``
    );
    expect(result.success).toBe(true);
  });

  it("rejects prose and malformed JSON", () => {
    expect(parseCampaignPageContent("متأسفانه امکان تولید وجود ندارد").success).toBe(
      false
    );
    expect(parseCampaignPageContent("{ invalid }").success).toBe(false);
  });
});
