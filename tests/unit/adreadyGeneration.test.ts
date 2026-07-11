import { beforeEach, describe, expect, it, vi } from "vitest";

const { callAIMock } = vi.hoisted(() => ({
  callAIMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/aiEngine", () => ({
  callAI: callAIMock,
}));

import {
  CampaignGenerationError,
  generateCampaignPageContent,
  type CampaignGenerationInput,
} from "@/lib/adreadyGeneration";

const input: CampaignGenerationInput = {
  campaignGoal: "جذب لید",
  businessName: "آرایه",
  businessType: "نرم‌افزار",
  contactPhone: "09121234567",
  productOrServiceName: "کمپین‌ساز",
  shortDescription: "ساخت صفحه کمپین برای تبلیغات",
  mainBenefit: "مسیر روشن‌تر برای دریافت درخواست",
  targetAudience: "کسب‌وکارهای کوچک",
  campaignChannel: "Instagram",
  campaignTone: "direct",
};

function validContent() {
  return {
    headline: "صفحه کمپین خود را آماده کنید",
    subheadline: "پیشنهادتان را روشن معرفی کنید و مسیر تماس مشخصی بسازید.",
    problemBullets: ["پیشنهاد به‌سرعت درک نمی‌شود", "مسیر اقدام روشن نیست"],
    benefits: ["پیام شفاف", "فرم تماس کوتاه", "پاسخ به پرسش‌های رایج"],
    offerSection: {
      title: "پیشنهاد کمپین",
      description: "اطلاعات لازم را ببینید و آگاهانه برای دریافت جزئیات اقدام کنید.",
      bullets: ["معرفی روشن", "راه تماس مستقیم"],
    },
    faq: [
      { question: "این خدمت برای چه کسی است؟", answer: "برای مخاطبان هدف کمپین." },
      { question: "چطور شروع کنم؟", answer: "فرم درخواست را تکمیل کنید." },
    ],
    objections: [
      { objection: "هنوز مطمئن نیستم", response: "ابتدا اطلاعات را بررسی کنید." },
      { objection: "زمان کافی ندارم", response: "ثبت درخواست کوتاه است." },
    ],
    ctaText: "دریافت اطلاعات",
    formTitle: "درخواست خود را ثبت کنید",
    thankYouMessage: "درخواست شما ثبت شد.",
    adCopyAngles: [
      {
        channel: "Instagram",
        angle: "پیشنهاد روشن",
        copy: "برای دیدن جزئیات و ثبت درخواست وارد صفحه شوید.",
      },
    ],
    whatsappMessage: "سلام، درباره این پیشنهاد اطلاعات بیشتری می‌خواهم.",
  };
}

describe("AdReady campaign generation", () => {
  beforeEach(() => {
    callAIMock.mockReset();
  });

  it("returns a valid first response without retrying", async () => {
    callAIMock.mockResolvedValue({ content: JSON.stringify(validContent()) });

    await expect(generateCampaignPageContent(input)).resolves.toEqual(validContent());
    expect(callAIMock).toHaveBeenCalledTimes(1);
  });

  it("retries once when the first structured output is invalid", async () => {
    callAIMock
      .mockResolvedValueOnce({ content: '{"headline":"ناقص"}' })
      .mockResolvedValueOnce({ content: JSON.stringify(validContent()) });

    await expect(generateCampaignPageContent(input)).resolves.toEqual(validContent());
    expect(callAIMock).toHaveBeenCalledTimes(2);
    expect(callAIMock.mock.calls[1][0][1].content).toContain("پاسخ قبلی");
  });

  it("does not return invalid content after the single retry", async () => {
    callAIMock.mockResolvedValue({ content: "not-json" });

    await expect(generateCampaignPageContent(input)).rejects.toMatchObject({
      code: "invalid_output",
    } satisfies Partial<CampaignGenerationError>);
    expect(callAIMock).toHaveBeenCalledTimes(2);
  });
});
