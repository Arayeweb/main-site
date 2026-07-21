import Link from "next/link";
import type { AraayePrompt } from "@/lib/prompts/promptTypes";
import { getCategoryLabel } from "@/lib/prompts/promptTypes";
import RunInAraayeButton from "./RunInAraayeButton";

type Props = {
  prompt: AraayePrompt;
};

export default function PromptCard({ prompt }: Props) {
  const preview = prompt.basePrompt.replace(/\s+/g, " ").trim().slice(0, 140);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition-all duration-200 hover:border-navy-200 hover:shadow-card">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link
          href={`/prompts/category/${prompt.category}`}
          className="badge bg-navy-50 text-navy-600 hover:bg-navy-100"
        >
          {getCategoryLabel(prompt.category)}
        </Link>
        {prompt.tags?.includes("image") ? (
          <span className="badge bg-cyan-50 text-cyan-700">تصویر</span>
        ) : null}
      </div>
      <h2 className="text-lg font-extrabold text-navy-900">
        <Link
          href={prompt.canonicalPath}
          className="transition-colors hover:text-brand-600"
        >
          {prompt.title}
        </Link>
      </h2>
      <p className="mt-2 text-sm leading-7 text-navy-500">{prompt.shortDescription}</p>
      <pre
        className="mt-3 line-clamp-2 flex-1 overflow-hidden rounded-xl bg-navy-950 px-3 py-2 text-[11px] leading-5 text-navy-200"
        dir="auto"
      >
        {preview}
        {prompt.basePrompt.length > 140 ? "…" : ""}
      </pre>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={prompt.canonicalPath} className="btn-secondary !px-4 !py-2 text-xs">
          مشاهده پرامپت
        </Link>
        <RunInAraayeButton
          prompt={prompt.basePrompt}
          slug={prompt.slug}
          className="!px-4 !py-2 text-xs"
          label="اجرا در Araaye AI"
        />
      </div>
    </article>
  );
}
