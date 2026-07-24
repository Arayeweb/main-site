import { describe, expect, it } from "vitest";
import { pageFromPath } from "@/lib/pageFromPath";

describe("pageFromPath", () => {
  it("maps programmatic seo/website industry paths", () => {
    expect(pageFromPath("/seo/doctor")).toBe("seo/doctor");
    expect(pageFromPath("/seo/clinic")).toBe("seo/clinic");
    expect(pageFromPath("/website/doctor")).toBe("website/doctor");
    expect(pageFromPath("/website/clinic")).toBe("website/clinic");
    expect(pageFromPath("/seo/restaurant")).toBe("seo/restaurant");
    expect(pageFromPath("/website/beauty-clinic")).toBe("website/beauty-clinic");
  });

  it("keeps existing landing attributions", () => {
    expect(pageFromPath("/seo")).toBe("seo");
    expect(pageFromPath("/doctors")).toBe("doctors");
    expect(pageFromPath("/clinic")).toBe("clinic");
    expect(pageFromPath("/restaurant")).toBe("restaurant");
    expect(pageFromPath("/website-design/restaurant")).toBe("restaurant");
    expect(pageFromPath("/website-design")).toBe("website-design");
    expect(pageFromPath("/website-design/cost")).toBe("website-design");
    expect(pageFromPath("web-design")).toBe("web-design");
    expect(pageFromPath("/googlesabt")).toBe("googlesabt");
    expect(pageFromPath("/modares")).toBe("modares");
    expect(pageFromPath("/")).toBe("index");
    expect(pageFromPath("")).toBe("index");
    expect(pageFromPath("seo")).toBe("seo");
    expect(pageFromPath("doctors")).toBe("doctors");
  });

  it("does not collapse /seo/doctor to bare seo", () => {
    expect(pageFromPath("/seo/doctor")).not.toBe("seo");
  });

  it("falls back to raw path when unknown", () => {
    expect(pageFromPath("/portfolio")).toBe("portfolio");
    expect(pageFromPath("/some/custom/path")).toBe("some/custom/path");
  });

  it("maps growth free-tool hubs and industry pages", () => {
    expect(pageFromPath("/review-link")).toBe("review-link");
    expect(pageFromPath("/review-link/doctor")).toBe("review-link/doctor");
    expect(pageFromPath("/local-seo-check/clinic")).toBe("local-seo-check/clinic");
    expect(pageFromPath("/seo-roi-calculator/lawyer")).toBe("seo-roi-calculator/lawyer");
    expect(pageFromPath("/qr")).toBe("qr");
    expect(pageFromPath("/shortener")).toBe("shortener");
    expect(pageFromPath("/free-seo-audit")).toBe("free-seo-audit");
  });

  it("strips query and hash", () => {
    expect(pageFromPath("/seo/doctor?utm_source=x")).toBe("seo/doctor");
    expect(pageFromPath("/website/doctor#lead-form")).toBe("website/doctor");
  });
});
