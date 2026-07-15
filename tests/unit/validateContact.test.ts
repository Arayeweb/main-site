import { describe, it, expect } from "vitest";
import {
  normalizeContact,
  toLatin,
  isEmail,
  isPhone,
  isTelegram,
} from "@/lib/validateContact";

describe("validateContact", () => {
  it("normalizes Persian digits in phone numbers", () => {
    expect(toLatin("۰۹۱۲۳۴۵۶۷۸۹")).toBe("09123456789");
  });

  it("accepts valid Iranian mobile numbers", () => {
    expect(isPhone("09123456789")).toBe(true);
    expect(isPhone("+989123456789")).toBe(true);
    expect(isPhone("00989123456789")).toBe(true);
    expect(isPhone("989123456789")).toBe(true);
  });

  it("normalizes phone to 09xxxxxxxxx format", () => {
    const { kind, value } = normalizeContact("+989123456789");
    expect(kind).toBe("phone");
    expect(value).toBe("09123456789");

    const bare98 = normalizeContact("989123456789");
    expect(bare98.kind).toBe("phone");
    expect(bare98.value).toBe("09123456789");
  });

  it("rejects invalid phone numbers", () => {
    expect(normalizeContact("12345").kind).toBe("invalid");
  });

  it("validates and normalizes email", () => {
    expect(isEmail("user@example.com")).toBe(true);
    const { kind, value } = normalizeContact("  User@Example.COM  ");
    expect(kind).toBe("email");
    expect(value).toBe("user@example.com");
  });

  it("validates telegram handles", () => {
    expect(isTelegram("@valid_user")).toBe(true);
    expect(isTelegram("invalid")).toBe(false);
  });
});
