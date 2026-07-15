import { describe, expect, it } from "vitest";
import { GET as getRouteA } from "@/app/m/a/route";
import { GET as getRouteB } from "@/app/m/b/route";
import { makeRequest } from "@/tests/helpers/request";

describe("modares short routes", () => {
  it("redirects /m/a to /modares students campaign", async () => {
    const res = await getRouteA(
      makeRequest("http://localhost:3000/m/a?foo=bar", { method: "GET" }),
    );

    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/modares");
    expect(location).toContain("variant=students");
    expect(location).toContain("utm_source=yektanet");
    expect(location).toContain("utm_content=a");
    expect(location).toContain("foo=bar");
  });

  it("redirects /m/b to /modares courses campaign", async () => {
    const res = await getRouteB(
      makeRequest("http://localhost:3000/m/b", { method: "GET" }),
    );

    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/modares");
    expect(location).toContain("variant=courses");
    expect(location).toContain("utm_content=b");
  });
});
