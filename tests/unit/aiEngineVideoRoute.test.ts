import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

import { submitVideoJob, submitVideoJobWithFallback } from "@/lib/aiEngine";

describe("submitVideoJob", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    process.env.OPENROUTER_API_KEY = "test-key";
  });

  it("posts to OpenRouter videos API without chat usage field", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "vid-abc" }),
    });

    const result = await submitVideoJob("sunset over desert", "video-seedance", {
      duration: 5,
      aspectRatio: "16:9",
    });

    expect(result.jobId).toBe("vid-abc");
    expect(result.pollingUrl).toBe("https://openrouter.ai/api/v1/videos/vid-abc");

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/videos");
    const body = JSON.parse(String(init.body));
    expect(body.model).toBe("bytedance/seedance-1-5-pro");
    expect(body.duration).toBe(5);
    expect(body.resolution).toBe("720p");
    expect(body.aspect_ratio).toBe("16:9");
    expect(body.usage).toBeUndefined();
  });

  it("uses polling_url when provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "vid-abc",
        polling_url: "https://openrouter.ai/api/v1/videos/vid-abc/poll",
      }),
    });

    const result = await submitVideoJob("test", "video-seedance");
    expect(result.pollingUrl).toBe("https://openrouter.ai/api/v1/videos/vid-abc/poll");
  });

  it("sends reference image as first frame", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "vid-ref" }),
    });

    await submitVideoJob("animate", "video-seedance", {
      referenceImageUrl: "https://cdn.example.com/frame.png",
    });

    const body = JSON.parse(String((mockFetch.mock.calls[0] as [string, RequestInit])[1].body));
    expect(body.frame_images).toEqual([
      {
        type: "image_url",
        image_url: { url: "https://cdn.example.com/frame.png" },
        frame_type: "first_frame",
      },
    ]);
  });
});

describe("submitVideoJobWithFallback", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    process.env.OPENROUTER_API_KEY = "test-key";
  });

  it("tries next model when primary submit fails", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        text: async () => "provider down",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "vid-kling" }),
      });

    const result = await submitVideoJobWithFallback(
      "city night",
      ["video-seedance", "video-kling"],
      { duration: 5 }
    );

    expect(result.modelId).toBe("video-kling");
    expect(result.jobId).toBe("vid-kling");
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse(String((mockFetch.mock.calls[1] as [string, RequestInit])[1].body));
    expect(secondBody.model).toBe("kwaivgi/kling-v3.0-pro");
  });
});
