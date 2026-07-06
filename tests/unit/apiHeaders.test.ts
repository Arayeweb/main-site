import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";
import { jsonNoStore, noStore, NO_STORE_HEADER } from "@/lib/apiHeaders";

describe("apiHeaders", () => {
  it("exports the correct no-store header value", () => {
    expect(NO_STORE_HEADER).toBe("no-store, no-cache, must-revalidate, private");
  });

  it("noStore sets Cache-Control on a NextResponse", () => {
    const res = NextResponse.json({ ok: true });
    const wrapped = noStore(res);
    expect(wrapped.headers.get("Cache-Control")).toBe(NO_STORE_HEADER);
    expect(wrapped).toBe(res);
  });

  it("jsonNoStore returns a JSON response with the no-store header", () => {
    const res = jsonNoStore({ ok: true }, { status: 200 });
    expect(res.headers.get("Cache-Control")).toBe(NO_STORE_HEADER);
    expect(res.status).toBe(200);
  });
});
