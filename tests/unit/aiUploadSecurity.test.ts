import { describe, expect, it } from "vitest";
import { isOwnedAiUploadUrl } from "@/lib/aiUploadSecurity";

describe("AI upload URL ownership", () => {
  it("accepts only the authenticated user's storage prefix", () => {
    const own =
      "https://test-project.supabase.co/storage/v1/object/public/ai-uploads/user-a/file.png";
    const other =
      "https://test-project.supabase.co/storage/v1/object/public/ai-uploads/user-b/file.png";
    expect(isOwnedAiUploadUrl(own, "user-a")).toBe(true);
    expect(isOwnedAiUploadUrl(other, "user-a")).toBe(false);
  });

  it("rejects external origins and encoded traversal", () => {
    expect(isOwnedAiUploadUrl("https://evil.example/ai-uploads/user-a/file.png", "user-a")).toBe(
      false
    );
    expect(
      isOwnedAiUploadUrl(
        "https://test-project.supabase.co/storage/v1/object/public/ai-uploads/user-a/%2e%2e/user-b/file.png",
        "user-a"
      )
    ).toBe(false);
  });
});
