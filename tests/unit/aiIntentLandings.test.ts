import { describe, expect, it } from "vitest";
import {
  INTENT_LANDINGS,
  getAllIntentSlugs,
  getIntentLanding,
} from "@/lib/aiIntentLandings";

const ALLOWED_MODEL_MENTIONS = [
  "GPT",
  "Claude",
  "Gemini",
  "Grok",
  "DeepSeek",
  "ChatGPT",
  "OpenAI",
  "Anthropic",
] as const;

describe("aiIntentLandings", () => {
  it("has six unique intent landings", () => {
    const slugs = getAllIntentSlugs();
    expect(slugs).toHaveLength(6);
    expect(new Set(slugs).size).toBe(6);
  });

  it("each landing has unique SEO title/description and enough FAQ/related links", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const slug of getAllIntentSlugs()) {
      const def = getIntentLanding(slug);
      expect(def.faq.length).toBeGreaterThanOrEqual(2);
      expect(def.related.length).toBeGreaterThanOrEqual(2);
      expect(def.hero.h1.length).toBeGreaterThan(10);
      expect(def.seo.description.length).toBeGreaterThanOrEqual(100);
      expect(def.seo.description.length).toBeLessThanOrEqual(170);
      titles.add(def.seo.title);
      descriptions.add(def.seo.description);
    }

    expect(titles.size).toBe(6);
    expect(descriptions.size).toBe(6);
  });

  it("compare landing includes demo and pair links", () => {
    const compare = INTENT_LANDINGS.compare;
    expect(compare.compareDemo?.answers.length).toBe(3);
    expect(compare.pairLinks?.length).toBeGreaterThanOrEqual(4);
  });

  it("students and brand pages include disclaimers", () => {
    expect(INTENT_LANDINGS.students.disclaimer).toMatch(/اشتباه/);
    expect(INTENT_LANDINGS.chatgpt.disclaimer).toMatch(/نماینده/);
    expect(INTENT_LANDINGS.claude.disclaimer).toMatch(/Anthropic|نماینده/);
  });

  it("does not invent model families outside the allowlist in hero copy", () => {
    const suspicious = /\b(Llama|Mistral|Qwen|Copilot)\b/i;
    for (const def of Object.values(INTENT_LANDINGS)) {
      expect(suspicious.test(def.hero.h1 + def.hero.sub)).toBe(false);
      // sanity: at least one known family appears somewhere in body pages that mention models
      const blob = JSON.stringify(def);
      const mentionsAllowed = ALLOWED_MODEL_MENTIONS.some((name) => blob.includes(name));
      expect(mentionsAllowed).toBe(true);
    }
  });
});
