import Link from "next/link";
import type { AraayePrompt } from "@/lib/prompts/promptTypes";
import { getCategoryLabel } from "@/lib/prompts/promptTypes";
import RunInAraayeButton from "./RunInAraayeButton";

type Props = {
  prompt: AraayePrompt;
};

export default function PromptCard({ prompt }: Props) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition-all duration-200 hover:border-navy-200 hover:shadow-card">
      <div className="mb-3">
        <span className="badge bg-navy-50 text-navy-600">
          {getCategoryLabel(prompt.category)}
        </span>
      </div>
      <h2 className="text-lg font-extrabold text-navy-900">
        <Link
          href={prompt.canonicalPath}
          className="hover:text-brand-600 transition-colors"
        >
          {prompt.title}
        </Link>
      </h2>
      <p className="mt-2 flex-1 text-sm leading-7 text-navy-500">
        {prompt.shortDescription}
      </p>
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
