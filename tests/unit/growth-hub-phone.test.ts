import { describe, expect, it } from "vitest";
import {
  maskPhoneForInvite,
  normalizePhoneE164,
  phoneE164ToLocal,
  phoneToAuthEmail,
} from "@/lib/growth-hub/phone";
import { createInviteSchema } from "@/lib/growth-hub/validation";

describe("Growth Hub phone invite helpers", () => {
  it("normalizes Iranian mobiles to E.164", () => {
    expect(normalizePhoneE164("09129687180")).toBe("+989129687180");
    expect(normalizePhoneE164("9129687180")).toBe("+989129687180");
    expect(normalizePhoneE164("+98 912 968 7180")).toBe("+989129687180");
    expect(normalizePhoneE164("00989129687180")).toBe("+989129687180");
    expect(normalizePhoneE164("abc")).toBeNull();
  });

  it("masks for invite UI without full number", () => {
    const masked = maskPhoneForInvite("+989129687180");
    expect(masked).toBe("0912•••7180");
    expect(masked).not.toContain("968");
  });

  it("builds stable auth email from phone", () => {
    expect(phoneToAuthEmail("+989129687180")).toBe(
      "989129687180@phone.growth-hub.local",
    );
    expect(phoneE164ToLocal("+989129687180")).toBe("09129687180");
  });

  it("validates phone invite schema", () => {
    expect(
      createInviteSchema.safeParse({
        workspace_id: "00000000-0000-4000-8000-000000000001",
        phone: "09129687180",
        role: "client_owner",
        expiry_days: 7,
      }).success,
    ).toBe(true);
    expect(
      createInviteSchema.safeParse({
        workspace_id: "00000000-0000-4000-8000-000000000001",
        phone: "bad",
        role: "client_owner",
      }).success,
    ).toBe(false);
  });
});
