"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type HomeDropdownOption<T extends string> = {
  id: T;
  label: string;
  desc?: string;
  glyph?: ReactNode;
  locked?: boolean;
  disabled?: boolean;
};

export default function HomeCompactDropdown<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  onLocked,
}: {
  value: T;
  options: HomeDropdownOption<T>[];
  onChange: (id: T) => void;
  ariaLabel: string;
  onLocked?: (id: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="ar-home-dd" ref={rootRef} role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className={`ar-home-dd-trigger${open ? " open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {selected?.glyph ? <span className="ar-home-dd-glyph">{selected.glyph}</span> : null}
        <span className="ar-home-dd-trigger-label">{selected?.label}</span>
        <span className="ar-home-dd-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="ar-home-dd-pop" role="listbox" aria-label={ariaLabel}>
          {options.map((opt) => {
            const inactive = opt.disabled || opt.locked;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={opt.id === value}
                className={`ar-home-dd-item${opt.id === value ? " selected" : ""}${inactive ? " disabled" : ""}`}
                onClick={() => {
                  if (opt.locked) {
                    onLocked?.(opt.id);
                    setOpen(false);
                    return;
                  }
                  if (inactive) return;
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                {opt.glyph ? <span className="ar-home-dd-glyph">{opt.glyph}</span> : null}
                <span className="ar-home-dd-copy">
                  <b>{opt.label}</b>
                  {opt.desc ? <small>{opt.desc}</small> : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
