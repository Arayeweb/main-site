import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

import { runImageGen } from "@/lib/aiEngine";

describe("runImageGen — API routing", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    process.env.OPENROUTER_API_KEY = "test-key";
  });

  it("routes Gemini image models to chat completions", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              images: [{ image_url: { url: "https://cdn.example.com/img.png" } }],
            },
          },
        ],
        usage: { total_tokens: 10, cost: 0.001 },
      }),
    });

    await runImageGen("a red apple", "image-lite");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    const body = JSON.parse(String(init.body));
    expect(body.model).toBe("google/gemini-3.1-flash-lite-image");
    expect(body.modalities).toEqual(["image", "text"]);
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
