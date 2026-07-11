import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getOutputSample } from "@/lib/outputSamples";
import { ShowcaseFull } from "@/components/showcase/ShowcasePreview";

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const sample = getOutputSample(params.slug);
  if (!sample) return { title: "نمونه یافت نشد" };

  return {
    title: `${sample.name} | نمونه خروجی آرایه`,
    description: sample.goal,
    robots: { index: false, follow: false },
  };
}

export default function ShowcasePage({ params }: { params: { slug: string } }) {
  const sample = getOutputSample(params.slug);
  if (!sample) notFound();

  if (sample.isDesignSample || sample.showcasePath.startsWith("http")) {
    redirect(sample.showcasePath);
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mt-8">
          <ShowcaseFull sampleKey={sample.key as "google-shoope" | "google-pourdast"} />
        </div>
      </div>
    </main>
  );
}
