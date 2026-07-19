import { z } from 'zod';

export const ContentBriefSchema = z.object({
  primaryKeyword: z.string(),
  searchIntent: z.string(),
  audience: z.string(),
  userQuestions: z.array(z.string()),
  recommendedSections: z.array(z.string()),
  evidenceNeeded: z.array(z.string()),
  internalLinkTargets: z.array(z.string()),
  risks: z.array(z.string()),
});

export const SeoAnalysisSchema = z.object({
  criticalIssues: z.array(z.string()),
  warnings: z.array(z.string()),
  opportunities: z.array(z.string()),
  suggestedTitle: z.array(z.string()),
  suggestedDescriptions: z.array(z.string()),
  headingIssues: z.array(z.string()),
  unsupportedClaims: z.array(z.string()),
  cannibalizationRisks: z.array(z.string()),
  internalLinkSuggestions: z.array(z.string()),
});

export const FaqSuggestionSchema = z.object({
  items: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      sourceNeeded: z.boolean().optional(),
      confidence: z.number().min(0).max(1).optional(),
    })
  ),
});

export const OutlineSchema = z.object({
  sections: z.array(
    z.object({
      heading: z.string(),
      purpose: z.string(),
      keyPoints: z.array(z.string()),
    })
  ),
});

export const TextResultSchema = z.object({
  text: z.string(),
});

export const TitleVariantsSchema = z.object({
  variants: z.array(z.string()).min(1).max(5),
});

export const DescriptionVariantsSchema = z.object({
  variants: z.array(z.string()).min(1).max(5),
});

export function parseAiJson<T>(raw: string, schema: z.ZodSchema<T>): T | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
