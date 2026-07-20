import { describe, expect, it, beforeAll, afterAll } from "vitest";
import {
  createBizcardOwnerAccessToken,
  signBizcardOwnerToken,
  verifyBizcardOwnerToken,
} from "@/lib/bizcardOwnerSession";
import {
  buildOwnerPatch,
  ownerPanelUrl,
  strField,
} from "@/lib/bizcardOwner";

const PREV_SECRET = process.env.ADMIN_SESSION_SECRET;

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = "test-secret-at-least-16-chars";
});

afterAll(() => {
  if (PREV_SECRET === undefined) delete process.env.ADMIN_SESSION_SECRET;
  else process.env.ADMIN_SESSION_SECRET = PREV_SECRET;
});

describe("bizcardOwnerSession", () => {
  it("creates a hex access token", () => {
    const t = createBizcardOwnerAccessToken();
    expect(t).toMatch(/^[a-f0-9]{48}$/);
  });

  it("signs and verifies owner session tokens", () => {
    const access = createBizcardOwnerAccessToken();
    const signed = signBizcardOwnerToken("shoope_smoke_lab", access);
    const session = verifyBizcardOwnerToken(signed);
    expect(session).not.toBeNull();
    expect(session!.slug).toBe("shoope_smoke_lab");
    expect(session!.accessToken).toBe(access);
    expect(session!.exp).toBeGreaterThan(Date.now());
  });

  it("rejects tampered tokens", () => {
    const access = createBizcardOwnerAccessToken();
    const signed = signBizcardOwnerToken("demo", access);
    const dot = signed.lastIndexOf(".");
    const body = signed.slice(0, dot);
    const sig = signed.slice(dot + 1);
    const flipped =
      (sig[0] === "a" ? "b" : "a") + sig.slice(1);
    expect(verifyBizcardOwnerToken(`${body}.${flipped}`)).toBeNull();
    expect(verifyBizcardOwnerToken(undefined)).toBeNull();
    expect(verifyBizcardOwnerToken("")).toBeNull();
  });

  it("rejects expired tokens", () => {
    const access = createBizcardOwnerAccessToken();
    const signed = signBizcardOwnerToken("demo", access, -1000);
    expect(verifyBizcardOwnerToken(signed)).toBeNull();
  });
});

describe("bizcardOwnerServer helpers", () => {
  it("builds owner panel url", () => {
    const url = ownerPanelUrl("shoope_smoke_lab", "abc123", "https://araaye.com");
    expect(url).toBe(
      "https://araaye.com/dashboard/bizcard/shoope_smoke_lab?token=abc123"
    );
  });

  it("strField trims and caps length", () => {
    expect(strField("  hi  ", 10)).toBe("hi");
    expect(strField("x".repeat(50), 10)).toBe("x".repeat(10));
    expect(strField("   ")).toBeNull();
    expect(strField(null)).toBeNull();
  });

  it("buildOwnerPatch ignores slug/is_active and requires business_name when set", () => {
    const patch = buildOwnerPatch({
      business_name: "اسموک لاب شوپه",
      category: "رستوران",
      phone: "09133950497",
      snap_url: "https://snapp.ir/x",
      osm_url: "https://osm.org/x",
      slug: "hacked",
      is_active: false,
      access_token: "steal",
    });
    expect(patch.business_name).toBe("اسموک لاب شوپه");
    expect(patch.category).toBe("رستوران");
    expect(patch.phone).toBe("09133950497");
    expect(patch.snap_url).toBe("https://snapp.ir/x");
    expect(patch.osm_url).toBe("https://osm.org/x");
    expect(patch.slug).toBeUndefined();
    expect(patch.is_active).toBeUndefined();
    expect(patch.access_token).toBeUndefined();
    expect(typeof patch.updated_at).toBe("string");
  });

  it("buildOwnerPatch does not set business_name when empty string", () => {
    const patch = buildOwnerPatch({ business_name: "  ", phone: "09" });
    expect(patch.business_name).toBeUndefined();
    expect(patch.phone).toBe("09");
  });

  it("clears optional fields to null when empty", () => {
    const patch = buildOwnerPatch({
      business_name: "A",
      category: "",
      whatsapp: "",
    });
    expect(patch.business_name).toBe("A");
    expect(patch.category).toBeNull();
    expect(patch.whatsapp).toBeNull();
  });
});
