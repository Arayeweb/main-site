import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  applyGooglesabtDiscount,
  normalizeGooglesabtDiscountCode,
  resolveGooglesabtDiscount,
} from "@/lib/googlesabtData";
import { CHECKOUT_STEP_LABELS, emptyOrderDraft } from "@/lib/googlesabtCheckout";

const ROOT = process.cwd();

function source(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("googlesabt discount codes", () => {
  it("normalizes and resolves known codes", () => {
    expect(normalizeGooglesabtDiscountCode(" araaye10 ")).toBe("ARAAYE10");
    expect(resolveGooglesabtDiscount("map15")?.percent).toBe(15);
    expect(resolveGooglesabtDiscount("BADCODE")).toBeNull();
  });

  it("applies percent discount to package price", () => {
    expect(applyGooglesabtDiscount(1_000_000, 10)).toBe(900_000);
    expect(applyGooglesabtDiscount(3_411_000, 15)).toBe(2_899_350);
  });
});

describe("googlesabt lead-callback flow", () => {
  it("keeps discountCode on order draft and contact-final step label", () => {
    const draft = emptyOrderDraft("popular");
    expect(draft.discountCode).toBe("");
    expect(CHECKOUT_STEP_LABELS[5]).toContain("ثبت درخواست");
  });

  it("uses expert-callback checkout API without zibal redirect", () => {
    const api = source("app/api/googlesabt/checkout/route.ts");
    expect(api).toContain("awaiting_expert_call");
    expect(api).toContain("paymentDeferred");
    expect(api).not.toContain("zibalRequest");
    expect(api).toContain("resolveGooglesabtDiscount");
  });

  it("shows discount field and expert-contact CTA in checkout UI", () => {
    const ui = source("components/googlesabt/GooglesabtCheckout.tsx");
    expect(ui).toContain("کد تخفیف");
    expect(ui).toContain("کی با شما تماس بگیریم؟");
    expect(ui).toContain("ثبت درخواست — کارشناسان تماس می‌گیرند");
    expect(ui).not.toContain("پرداخت امن آنلاین");
    expect(ui).not.toContain("redirectUrl");
  });

  it("captures callback preference fields on the draft", () => {
    const draft = emptyOrderDraft("popular");
    expect(draft.preferredCallWindow).toBe("anytime");
    expect(draft.contactChannel).toBe("call");
    expect(draft.contactName).toBe("");
  });

  it("removes gateway-first messaging from hero and final CTA", () => {
    const hero = source("components/googlesabt/GooglesabtHero.tsx");
    const finalCta = source("components/googlesabt/GooglesabtFinalCta.tsx");
    expect(hero).toContain("بدون پرداخت آنلاین");
    expect(finalCta).toContain("بدون پرداخت فوری در سایت");
    expect(finalCta).not.toContain("بلافاصله پس از پرداخت");
  });
});
