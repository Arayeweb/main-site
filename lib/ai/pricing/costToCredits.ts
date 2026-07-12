import { getModel, modelRouteId, type AIModelInfo } from "@/lib/aiModels";

export type PricingConfig = {
  usdToToman: number;
  multiplier: number;
  creditValueToman: number;
  minGrossMargin: number;
};

export type PricingSnapshot = PricingConfig & {
  providerCostUsd: number;
  toolCostUsd: number;
  creditsCharged: number;
  revenueToman: number;
  providerCostToman: number;
  grossProfitToman: number;
  grossMarginPercent: number;
};

const DEFAULT_USD_TO_TOMAN = 220_000;
const DEFAULT_COST_MULTIPLIER = 2.2;
const DEFAULT_CREDIT_VALUE_TOMAN = 1_000;
const DEFAULT_MIN_GROSS_MARGIN = 0.45;

const MODEL_MIN_CREDITS: Record<string, number> = {
  economy: 1,
  "cmp-deepseek-v4": 1,
  "cmp-gemini-flash": 1,
  "cmp-llama-70b": 1,
  fast: 2,
  "cmp-gpt-4o-mini": 2,
  "cmp-grok-4": 2,
  "cmp-mistral-medium": 2,
  "cmp-claude-haiku": 2,
  creative: 6,
  "cmp-gemini-pro": 6,
  precise: 7,
  "cmp-gpt-55": 7,
  critic: 10,
  "cmp-claude-opus": 10,
};

export const IMAGE_MIN_CREDITS: Record<string, number> = {
  "image-lite": 20,
  "image-nano": 35,
  "image-gpt": 60,
};

export const WEB_SEARCH_MIN_CREDITS = 5;

function readPositiveNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid AI pricing configuration");
  }
  return value;
}

export function getPricingConfig(): PricingConfig {
  const usdToToman = readPositiveNumber("AI_USD_TO_TOMAN", DEFAULT_USD_TO_TOMAN);
  const multiplier = readPositiveNumber("AI_COST_MULTIPLIER", DEFAULT_COST_MULTIPLIER);
  const creditValueToman = readPositiveNumber(
    "AI_CREDIT_VALUE_TOMAN",
    DEFAULT_CREDIT_VALUE_TOMAN
  );
  const minGrossMargin = readPositiveNumber("AI_MIN_GROSS_MARGIN", DEFAULT_MIN_GROSS_MARGIN);

  if (multiplier <= 1) {
    throw new Error("Invalid AI pricing configuration");
  }

  return { usdToToman, multiplier, creditValueToman, minGrossMargin };
}

export function providerCostToCredits(
  providerCostUsd: number,
  config: PricingConfig = getPricingConfig()
): number {
  if (!Number.isFinite(providerCostUsd) || providerCostUsd < 0) {
    throw new Error("Invalid provider cost");
  }

  const salePriceToman = providerCostUsd * config.usdToToman * config.multiplier;
  return Math.max(1, Math.ceil(salePriceToman / config.creditValueToman));
}

export function minCreditsForModel(modelId: string): number {
  const m = getModel(modelId);
  if (m?.kind === "image") {
    return IMAGE_MIN_CREDITS[m.id] ?? 20;
  }
  if (m?.routeId.includes("opus")) return 16;
  if (m?.routeId.includes("sonnet")) return 10;
  return MODEL_MIN_CREDITS[m?.id ?? modelId] ?? 1;
}

export function estimateProviderCostUsd(
  modelOrId: AIModelInfo | string,
  inputTokens: number,
  outputTokens: number,
  tokenSafetyMultiplier = 1.25
): number {
  const model = typeof modelOrId === "string" ? getModel(modelOrId) : modelOrId;
  const per1k = model?.estCostPer1kTokens ?? 0.005;
  const tokens = Math.max(1, inputTokens + outputTokens);
  return (tokens / 1_000) * per1k * tokenSafetyMultiplier;
}

export function estimatedCreditsForModel(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  config: PricingConfig = getPricingConfig()
): number {
  const estimatedUsd = estimateProviderCostUsd(modelId, inputTokens, outputTokens, 1.5);
  return Math.max(minCreditsForModel(modelId), providerCostToCredits(estimatedUsd, config));
}

export function creditsForProviderCost(
  modelId: string,
  providerCostUsd: number,
  inputTokens: number,
  outputTokens: number,
  config: PricingConfig = getPricingConfig()
): number {
  const costUsd =
    Number.isFinite(providerCostUsd) && providerCostUsd > 0
      ? providerCostUsd
      : estimateProviderCostUsd(modelId, inputTokens, outputTokens);
  return Math.max(minCreditsForModel(modelId), providerCostToCredits(costUsd, config));
}

export function buildPricingSnapshot(input: {
  modelId: string;
  providerCostUsd: number;
  toolCostUsd?: number;
  creditsCharged: number;
  config?: PricingConfig;
}): PricingSnapshot & { displayedModel: string; actualModel: string } {
  const config = input.config ?? getPricingConfig();
  const providerCostUsd = Math.max(0, Number(input.providerCostUsd) || 0);
  const toolCostUsd = Math.max(0, Number(input.toolCostUsd) || 0);
  const totalCostUsd = providerCostUsd + toolCostUsd;
  const providerCostToman = Math.round(totalCostUsd * config.usdToToman);
  const revenueToman = input.creditsCharged * config.creditValueToman;
  const grossProfitToman = revenueToman - providerCostToman;
  const grossMarginPercent =
    revenueToman > 0 ? Number(((grossProfitToman / revenueToman) * 100).toFixed(2)) : 0;
  const model = getModel(input.modelId);

  return {
    ...config,
    providerCostUsd,
    toolCostUsd,
    creditsCharged: input.creditsCharged,
    revenueToman,
    providerCostToman,
    grossProfitToman,
    grossMarginPercent,
    displayedModel: model?.name ?? input.modelId,
    actualModel: modelRouteId(input.modelId),
  };
}
