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
  it("reuses the Persian direct prompt with a mobile-brevity suffix", () => {
    const prompt = telegramSystemPrompt();
    expect(prompt).toBe(TELEGRAM_SYSTEM_PROMPT);
    // همان لحن فارسی نسخه وب
    expect(prompt).toContain("دستیار هوشمند فارسی‌زبان");
    // قید کوتاهی موبایل
    expect(prompt).toContain("۳ تا ۶ خط");
    expect(prompt).toContain("موبایل");
  });
});
