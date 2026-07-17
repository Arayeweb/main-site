"use client";

import Link from "next/link";
import { trackAiPromptExampleClick } from "@/lib/aiTracking";

export default function AiIntentPromptList({
  landingType,
  items,
}: {
  landingType: string;
  items: string[];
}) {
  return (
    <ul className="ail-prompts">
      {items.map((prompt, index) => (
        <li key={prompt}>
          <Link
            href={`/ai?prompt=${encodeURIComponent(prompt)}`}
            className="ail-prompt-link"
            onClick={() =>
              trackAiPromptExampleClick({
                landing_type: landingType,
                prompt_index: index,
              })
            }
          >
            {prompt}
          </Link>
        </li>
      ))}
    </ul>
  );
}
