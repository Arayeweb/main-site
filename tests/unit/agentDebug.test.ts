import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentDebugLog } from "@/lib/agentDebug";

describe("agentDebugLog", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response())));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("does not fetch in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AGENT_DEBUG", "1");
    agentDebugLog("loc", "msg", {}, "H1");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not fetch when AGENT_DEBUG is not 1", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AGENT_DEBUG", "0");
    agentDebugLog("loc", "msg", {}, "H1");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches when development and AGENT_DEBUG=1", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AGENT_DEBUG", "1");
    agentDebugLog("loc", "msg", { foo: "bar" }, "H1");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
