"use client";

import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";

type Props = {
  text: string;
  slug: string;
  label?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
};

export default function CopyPromptButton({
  text,
  slug,
  label = "کپی پرامپت",
  className = "",
  variant = "secondary",
}: Props) {
  const [copied, setCopied] = useState(false);

  const base =
    variant === "primary"
      ? "btn-primary"
      : variant === "ghost"
        ? "btn-ghost"
        : "btn-secondary";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      pushGtmEvent("prompt_copy", { promptSlug: slug, page: "prompts" });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className={`${base} ${className}`}
      onClick={handleCopy}
      data-event="prompt_copy"
      data-prompt-slug={slug}
      aria-live="polite"
    >
      {copied ? "کپی شد ✓" : label}
    </button>
  );
}
