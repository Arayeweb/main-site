import { describe, expect, it } from "vitest";
import {
  buildModaresLeadPayload,
  buildModaresWhatsAppMessage,
  modaresPlanForVariant,
  modaresWhatsAppUrl,
  MODARES_LEAD_CHANNEL,
  MODARES_LEAD_GOAL,
  MODARES_LEAD_SOURCE,
} from "@/lib/modaresLead";

describe("modaresLead", () => {
  it("builds the teachers campaign payload for default variant", () => {
    const payload = buildModaresLeadPayload({
      teachingField: "ریاضی",
      contact: "09123456789",
      variant: "default",
      referrer: "https://example.com",
      utm: {
        utm_source: "yektanet",
        utm_medium: "sms",
        utm_campaign: "teachers_tehran",
        utm_content: "a",
      },
    });

    expect(payload).toMatchObject({
      goal: MODARES_LEAD_GOAL,
      page: "/modares",
      plan: "professional",
      detail: "teaching_field: ریاضی; variant: default",
      source: MODARES_LEAD_SOURCE,
      channel: MODARES_LEAD_CHANNEL,
      contact: "09123456789",
      consent: true,
      company: "",
      referrer: "https://example.com",
      utm_source: "yektanet",
      utm_medium: "sms",
      utm_campaign: "teachers_tehran",
      utm_content: "a",
    });
    expect("name" in payload).toBe(false);
  });

  it("uses course_sales plan for courses variant", () => {
    const payload = buildModaresLeadPayload({
      teachingField: "زبان",
      contact: "+989123456789",
      variant: "courses",
      utm: {},
    });

    expect(modaresPlanForVariant("courses")).toBe("course_sales");
    expect(payload.plan).toBe("course_sales");
    expect(payload.detail).toContain("variant: courses");
    expect(payload.contact).toBe("09123456789");
  });

  it("builds WhatsApp message and URL from site contact config", () => {
    const message = buildModaresWhatsAppMessage("موسیقی");
    expect(message).toContain("حوزه تدریس من موسیقی است");
    expect(modaresWhatsAppUrl("موسیقی")).toContain("wa.me");
    expect(modaresWhatsAppUrl("موسیقی")).toContain(encodeURIComponent("موسیقی"));
  });
});
