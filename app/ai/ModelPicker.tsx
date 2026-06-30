"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ModelAvatar,
  IconCheck,
  IconLock,
} from "./icons";
import {
  MODELS,
  PRESETS,
  modelName,
} from "@/lib/aiModels";

export interface ModelPickerProps {
  open: boolean;
  plan: string;
  initial: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
  mode?: "single" | "multi";
}

export default function ModelPicker({
  open,
  plan,
  initial,
  onClose,
  onSave,
  mode = "multi",
}: ModelPickerProps) {
  const [tab, setTab] = useState<"presets" | "custom">("presets");
  const [sel, setSel] = useState<string[]>(initial);

  useEffect(() => {
    if (open) setSel(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  const allowAll = plan === "pro" || plan === "business";
  const single = mode === "single";

  const sameSet = (a: string[], b: string[]) =>
    a.length === b.length && a.every((x) => b.includes(x));

  function toggleModel(id: string, locked: boolean) {
    if (locked) return;
    setSel((prev) => {
      if (single) {
        return prev.includes(id) ? prev : [id];
      }
      if (prev.includes(id)) {
        return prev.length <= 2 ? prev : prev.filter((x) => x !== id);
      }
      return prev.length >= 4 ? prev : [...prev, id];
    });
  }

  return (
    <>
      <div className="ai-picker-overlay" onClick={onClose} />
      <div className="ai-picker-sheet" role="dialog" aria-modal="true">
        <div className="ai-picker-head">
          <div className="ai-picker-head-row">
            <div>
              <div className="ai-picker-title">انتخاب هوش‌ها</div>
              <div className="ai-picker-sub">
                {single
                  ? "یک هوش مصنوعی انتخاب کن که پاسخ سریع را بدهد."
                  : "۲ تا ۴ هوش مصنوعی انتخاب کن تا هم‌زمان به سؤالت جواب بدهند."}
              </div>
            </div>
            <button className="ai-picker-close" onClick={onClose} aria-label="بستن">
              ✕
            </button>
          </div>
          {!single && (
            <div className="ai-picker-tabs">
              <button
                className={`ai-picker-tab${tab === "presets" ? " active" : ""}`}
                onClick={() => setTab("presets")}
              >
                پریست‌های آماده
              </button>
              <button
                className={`ai-picker-tab${tab === "custom" ? " active" : ""}`}
                onClick={() => setTab("custom")}
              >
                انتخاب دستی
              </button>
            </div>
          )}
        </div>

        <div className="ai-picker-body">
          {!single && tab === "presets" &&
            PRESETS.map((p) => {
              const locked = p.pro && !allowAll;
              const active = sameSet(sel, p.models);
              return (
                <button
                  key={p.id}
                  className={`ai-preset${active ? " active" : ""}${locked ? " locked" : ""}`}
                  onClick={() => !locked && setSel(p.models)}
                >
                  <div className="ai-preset-top">
                    <span className="ai-preset-name">{p.name}</span>
                    {locked && (
                      <span className="ai-pro-pill">
                        <IconLock size={12} /> Pro
                      </span>
                    )}
                  </div>
                  <div className="ai-preset-models">
                    {p.models.map((id) => (
                      <div key={id} className="ai-preset-model">
                        <ModelAvatar modelId={id} size={36} />
                        <span className="ai-preset-model-name">{modelName(id)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ai-preset-blurb">{p.blurb}</div>
                </button>
              );
            })}

          {(single || tab === "custom") && (
            <>
              <div className="ai-custom-hint">
                {single
                  ? `${sel.length} هوش انتخاب شده`
                  : `${sel.length} هوش انتخاب شده — حداقل ۲، حداکثر ۴.`}
              </div>
              {MODELS.map((m) => {
                const locked = !m.free && !allowAll;
                const selected = sel.includes(m.id);
                return (
                  <button
                    key={m.id}
                    className={`ai-model-row${selected ? " selected" : ""}${locked ? " locked" : ""}`}
                    onClick={() => toggleModel(m.id, locked)}
                  >
                    <ModelAvatar modelId={m.id} size={36} />
                    <div className="ai-model-row-info">
                      <div className="ai-model-row-name">{m.name}</div>
                      <div className="ai-model-row-blurb">{m.blurb}</div>
                    </div>
                    {locked ? (
                      <span className="ai-pro-pill">
                        <IconLock size={12} /> Pro
                      </span>
                    ) : (
                      <span className="ai-model-check">
                        {selected && <IconCheck size={13} />}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div className="ai-picker-foot">
          {!allowAll ? (
            <Link href="/ai/pricing" className="ai-gopro-btn">
              <IconLock size={12} /> باز کردن همه‌ی هوش‌ها
            </Link>
          ) : (
            <span className="ai-custom-hint">دسترسی کامل فعال است</span>
          )}
          <button
            className="ai-btn ai-btn-primary ai-btn-sm"
            onClick={() => onSave(sel)}
          >
            ذخیره
          </button>
        </div>
      </div>
    </>
  );
}
