import { describe, it, expect } from "vitest";
import { splitTelegramText, TELEGRAM_MAX_MESSAGE_LENGTH } from "@/lib/telegram/messages";
import { telegramSystemPrompt, TELEGRAM_SYSTEM_PROMPT } from "@/lib/telegram/prompts";

describe("telegram messages helpers", () => {
  it("splitTelegramText keeps short text in one chunk", () => {
    expect(splitTelegramText("سلام")).toEqual(["سلام"]);
  });

  it("splitTelegramText splits very long answers", () => {
    const long = "الف".repeat(TELEGRAM_MAX_MESSAGE_LENGTH + 500);
    const chunks = splitTelegramText(long);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= TELEGRAM_MAX_MESSAGE_LENGTH)).toBe(true);
    expect(chunks.join("")).toBe(long);
  });
});

describe("telegram system prompt", () => {
  it("uses Persian mobile-friendly rules", () => {
    const prompt = telegramSystemPrompt();
    expect(prompt).toBe(TELEGRAM_SYSTEM_PROMPT);
    expect(prompt).toContain("Persian Telegram AI assistant");
    expect(prompt).toContain("3 to 6 lines maximum");
    expect(prompt).not.toContain("markdown table");
  });
});
