import { describe, expect, it } from "vitest";
import {
  buildAdReadyLoginUrl,
  isAllowedAdReadyNext,
  resolveAdReadyAuthRedirect,
  sanitizeNextParam,
} from "@/lib/adreadyAuth";

describe("adreadyAuth", () => {
  describe("sanitizeNextParam", () => {
    it("accepts safe internal paths", () => {
      expect(sanitizeNextParam("/dashboard/adready/new")).toBe("/dashboard/adready/new");
      expect(sanitizeNextParam("/campaign/foo")).toBe("/campaign/foo");
    });

    it("rejects open redirects and unsafe values", () => {
      expect(sanitizeNextParam("//evil.com")).toBeNull();
      expect(sanitizeNextParam("https://evil.com")).toBeNull();
      expect(sanitizeNextParam("")).toBeNull();
      expect(sanitizeNextParam(null)).toBeNull();
      expect(sanitizeNextParam("/path\\evil")).toBeNull();
    });
  });

  describe("isAllowedAdReadyNext", () => {
    it("allows dashboard and public campaign paths", () => {
      expect(isAllowedAdReadyNext("/dashboard/adready/pages")).toBe(true);
      expect(isAllowedAdReadyNext("/campaign/my-slug")).toBe(true);
    });

    it("blocks unrelated internal paths", () => {
      expect(isAllowedAdReadyNext("/ai")).toBe(false);
      expect(isAllowedAdReadyNext("/admin/login")).toBe(false);
    });
  });

  describe("resolveAdReadyAuthRedirect", () => {
    it("uses smart defaults when next is missing", () => {
      expect(resolveAdReadyAuthRedirect("register")).toBe("/dashboard/adready/new");
      expect(resolveAdReadyAuthRedirect("login")).toBe("/dashboard/adready/pages");
    });

    it("honors allowed next paths", () => {
      expect(
        resolveAdReadyAuthRedirect("login", "/dashboard/adready/pages/abc/edit"),
      ).toBe("/dashboard/adready/pages/abc/edit");
    });

    it("falls back when next is not whitelisted", () => {
      expect(resolveAdReadyAuthRedirect("login", "/ai")).toBe("/dashboard/adready/pages");
      expect(resolveAdReadyAuthRedirect("register", "//evil.com")).toBe(
        "/dashboard/adready/new",
      );
    });
  });

  describe("buildAdReadyLoginUrl", () => {
    it("builds register url with next", () => {
      expect(
        buildAdReadyLoginUrl({
          mode: "register",
          next: "/dashboard/adready/new",
        }),
      ).toBe("/adready/login?mode=register&next=%2Fdashboard%2Fadready%2Fnew");
    });

    it("omits next when not allowed", () => {
      expect(buildAdReadyLoginUrl({ mode: "login", next: "/ai" })).toBe(
        "/adready/login?mode=login",
      );
    });
  });
});
