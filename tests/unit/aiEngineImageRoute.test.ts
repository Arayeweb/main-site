import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

import { runImageGen } from "@/lib/aiEngine";

describe("runImageGen — API routing", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    process.env.OPENROUTER_API_KEY = "test-key";
  });

  it("routes Gemini image models to dedicated images API", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ b64_json: "abc123" }],
        usage: { total_tokens: 10, cost: 0.001 },
      }),
    });

    await runImageGen("a red apple", "image-lite");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/images");
    const body = JSON.parse(String(init.body));
    expect(body.model).toBe("google/gemini-3.1-flash-lite-image");
    expect(body.prompt).toBe("a red apple");
    expect(body.output_format).toBe("png");
  });

  it("passes reference images via input_references", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ b64_json: "abc123" }],
        usage: { total_tokens: 10, cost: 0.001 },
      }),
    });

    await runImageGen("edit this", "image-lite", {
      referenceImageUrl: "https://cdn.example.com/ref.png",
    });

    const body = JSON.parse(String((mockFetch.mock.calls[0] as [string, RequestInit])[1].body));
    expect(body.input_references).toEqual([
      { type: "image_url", image_url: { url: "https://cdn.example.com/ref.png" } },
    ]);
  });

  it("routes GPT Image models to dedicated images API", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ b64_json: "abc123", media_type: "image/png" }],
        usage: { total_tokens: 10, cost: 0.01 },
      }),
    });

    await runImageGen("a logo", "image-gpt");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/images");
  });
});
