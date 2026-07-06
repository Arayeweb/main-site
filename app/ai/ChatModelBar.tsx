"use client";

import { canUseModel } from "@/lib/aiCredits";
import { getModel } from "@/lib/aiModels";
import { BrandGlyph, IconLock } from "./icons";

export type ModelPick = "auto" | "precise" | "critic" | "creative" | "economy";

const MODELS: {
  id: ModelPick;
  label: string;
  desc: string;
  brand?: "openai" | "claude" | "gemini" | "deepseek";
}[] = [
  { id: "auto", label: "خودکار", desc: "انتخاب هوشمند" },
  { id: "precise", label: "GPT", desc: "سریع و عمومی", brand: "openai" },
  { id: "critic", label: "Claude", desc: "تحلیل و نوشتار", brand: "claude" },
  { id: "creative", label: "Gemini", desc: "چندمنظوره", brand: "gemini" },
  { id: "economy", label: "DeepSeek", desc: "اقتصادی و سریع", brand: "deepseek" },
];

export function resolvePickedModel(
  pick: ModelPick,
  deepMode: boolean,
  plan: string,
  fallback: string
): string {
  if (pick === "auto") {
    if (!deepMode) {
      const economy = getModel("economy");
      if (economy && canUseModel(plan, economy)) return "economy";
    } else {
      const precise = getModel("precise");
      if (precise && canUseModel(plan, precise)) return "precise";
    }
    return fallback;
  }
  const m = getModel(pick);
  if (m && canUseModel(plan, m)) return pick;
  return fallback;
}

export default function ChatModelBar({
  value,
  onChange,
  plan,
  onPlanLocked,
}: {
  value: ModelPick;
  onChange: (id: ModelPick) => void;
  plan: string;
  onPlanLocked?: () => void;
}) {
  return (
    <div className="ar-model-bar-scroll">
      <div className="ar-model-bar" role="group" aria-label="انتخاب مدل">
      {MODELS.map((m) => {
        const locked =
          m.id !== "auto" &&
          (() => {
            const model = getModel(m.id);
            return model ? !canUseModel(plan, model) : false;
          })();
        return (
          <button
            key={m.id}
            type="button"
            className={`ar-model-card${value === m.id ? " active" : ""}${locked ? " needs-plan" : ""}`}
            aria-pressed={value === m.id}
            title={locked ? "برای این مدل پلن بالاتر لازم است" : m.desc}
            onClick={() => {
              if (locked) {
                onPlanLocked?.();
                return;
              }
              onChange(m.id);
            }}
          >
            {locked ? (
              <span className="ar-model-card-pro" aria-hidden>
                <IconLock size={8} />
                <span className="ar-model-card-pro-label">Pro</span>
              </span>
            ) : null}
            <span className="ar-model-card-head">
              {m.brand ? (
                <span className="ar-model-card-glyph" aria-hidden>
                  <BrandGlyph brand={m.brand} size={14} />
                </span>
              ) : null}
              <span className="ar-model-card-name">{m.label}</span>
            </span>
            <span className="ar-model-card-desc">{m.desc}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
