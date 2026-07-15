import {
  COMPANY_DISPLAY_NAME,
  COMPANY_EMAIL,
  COMPANY_LEGAL_NAME,
  COMPANY_PHONE_DISPLAY,
  COMPANY_TRADE_NAME,
} from "@/lib/companyIdentity";

describe("companyIdentity", () => {
  it("keeps brand and legal names consistent (correct آرایه spelling)", () => {
    expect(COMPANY_TRADE_NAME).toBe("آرایه");
    expect(COMPANY_DISPLAY_NAME).toBe("شرکت آرایه");
    expect(COMPANY_LEGAL_NAME).toBe("شرکت هوش آرایه پارس");
    expect(COMPANY_LEGAL_NAME).not.toMatch(/ارایه/);
    expect(COMPANY_EMAIL).toBe("support@araaye.com");
    expect(COMPANY_PHONE_DISPLAY).toBe("۰۹۹۹۱۳۰۰۷۸۸");
  });
});
