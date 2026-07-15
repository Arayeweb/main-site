import { describe, expect, it } from "vitest";
import { buildModaresRedirectUrl } from "@/lib/modaresRedirects";

describe("modaresRedirects", () => {
  it("maps /m/a to students campaign with yektanet UTMs", () => {
    const url = buildModaresRedirectUrl("a", new URLSearchParams());
    expect(url.pathname).toBe("/modares");
    expect(url.searchParams.get("variant")).toBe("students");
    expect(url.searchParams.get("utm_source")).toBe("yektanet");
    expect(url.searchParams.get("utm_medium")).toBe("sms");
    expect(url.searchParams.get("utm_campaign")).toBe("teachers_tehran");
    expect(url.searchParams.get("utm_content")).toBe("a");
  });

  it("maps /m/b to courses campaign", () => {
    const url = buildModaresRedirectUrl("b", new URLSearchParams());
    expect(url.searchParams.get("variant")).toBe("courses");
    expect(url.searchParams.get("utm_content")).toBe("b");
  });

  it("preserves additional query parameters without overriding defaults", () => {
    const incoming = new URLSearchParams("foo=bar&utm_source=custom");
    const url = buildModaresRedirectUrl("a", incoming);
    expect(url.searchParams.get("foo")).toBe("bar");
    expect(url.searchParams.get("utm_source")).toBe("yektanet");
  });
});
