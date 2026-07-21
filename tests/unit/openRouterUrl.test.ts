import { describe, it, expect } from "vitest";
import {
  isTrustedOpenRouterUrl,
  isTrustedSupabaseStorageUrl,
} from "@/lib/openRouterUrl";

describe("openRouterUrl trust checks", () => {
  it("accepts canonical OpenRouter HTTPS URLs", () => {
    expect(
      isTrustedOpenRouterUrl("https://openrouter.ai/api/v1/videos/job-1/content?index=0")
    ).toBe(true);
  });

  it("rejects substring spoofing in hostname", () => {
    expect(
      isTrustedOpenRouterUrl("https://evil.tld/?q=openrouter.ai")
    ).toBe(false);
    expect(
      isTrustedOpenRouterUrl("https://notopenrouter.ai/api/v1/videos/x/content")
    ).toBe(false);
  });

  it("accepts Supabase storage URLs on configured origin", () => {
    const prev = process.env.SUPABASE_URL;
    process.env.SUPABASE_URL = "https://abc.supabase.co";
    expect(
      isTrustedSupabaseStorageUrl(
        "https://abc.supabase.co/storage/v1/object/public/ai-uploads/u1/file.jpg"
      )
    ).toBe(true);
    expect(isTrustedSupabaseStorageUrl("https://evil.tld/storage/v1/object/public/x")).toBe(
      false
    );
    process.env.SUPABASE_URL = prev;
  });
});
