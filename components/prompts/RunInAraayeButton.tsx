"use client";

import Link from "next/link";
import { buildAraayePromptUrl } from "@/lib/prompts/buildAraayeUrl";
import { pushGtmEvent } from "@/lib/gtm";

type Props = {
  prompt: string;
  slug: string;
  label?: string;
  className?: string;
  variant?: "primary" | "secondary";
};

export default function RunInAraayeButton({
  prompt,
  slug,
  label = "اجرا در Araaye AI",
  className = "",
  variant = "primary",
}: Props) {
  const href = buildAraayePromptUrl(prompt, slug);
  const base = variant === "primary" ? "btn-primary" : "btn-secondary";

  return (
    <Link
      href={href}
      className={`${base} ${className}`}
      data-event="prompt_run_in_ai"
      data-prompt-slug={slug}
      onClick={() => {
        pushGtmEvent("prompt_run_in_ai", { promptSlug: slug, page: "prompts" });
      }}
    >
      {label}
    </Link>
  );
}
