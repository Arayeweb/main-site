import Link from "next/link";
import type { ReactNode } from "react";
import type { OutputSample } from "@/lib/outputSamples";
import {
  googleOutputSamples,
  portfolioOutputSamples,
} from "@/lib/outputSamples";
import { ShowcaseHomePreview } from "@/components/home/ShowcaseHomePreview";
import { ShowcasePreview } from "@/components/showcase/ShowcasePreview";
import CustomerQuotes from "@/components/home/CustomerQuotes";

function isExternalSamplePath(path: string) {
  return path.startsWith("http");
}

function SampleCaption({ sample }: { sample: OutputSample }) {
  const linkClassName =
    "mt-3 inline-flex items-center text-sm font-bold text-brand-600 transition-colors hover:text-brand-700";

  return (
    <div className="mt-4 text-right">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-extrabold text-navy-900 sm:text-lg">{sample.name}</h3>
        {sample.isDesignSample ? (
          <span className="rounded-md bg-navy-100/80 px-2 py-0.5 text-[10px] font-bold text-navy-500">
            نمونه طراحی
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{sample.goal}</p>
      {isExternalSamplePath(sample.showcasePath) ? (
        <a
          href={sample.showcasePath}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          مشاهده صفحه
          <span aria-hidden="true" className="mr-1.5">
            ←
          </span>
        </a>
      ) : (
        <Link href={sample.showcasePath} className={linkClassName}>
          مشاهده صفحه
          <span aria-hidden="true" className="mr-1.5">
            ←
          </span>
        </Link>
      )}
    </div>
  );
}

function SamplePreviewLink({
  sample,
  children,
}: {
  sample: OutputSample;
  children: ReactNode;
}) {
  const className =
    "block overflow-hidden rounded-2xl transition-transform duration-200 hover:-translate-y-0.5";

  if (isExternalSamplePath(sample.showcasePath)) {
    return (
      <a
        href={sample.showcasePath}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={sample.showcasePath} className={className}>
      {children}
    </Link>
  );
}

export default function OutputSamples() {
  return (
    <section id="real-portfolio" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
            نتیجه را در نمونه‌های واقعی ببینید
          </h2>
        </div>

        <div className="mt-10 sm:mt-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {portfolioOutputSamples.map((sample) => (
              <article key={sample.key} className="group">
                <SamplePreviewLink sample={sample}>
                  <ShowcaseHomePreview sampleKey={sample.key} />
                </SamplePreviewLink>
                <SampleCaption sample={sample} />
              </article>
            ))}
          </div>

          {googleOutputSamples.length > 0 ? (
            <div className="mt-12">
              <p className="mb-6 text-center text-sm font-semibold text-navy-400">
                نمونه‌های واقعی ثبت و بهینه‌سازی گوگل
              </p>
              <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
                {googleOutputSamples.map((sample) => (
                  <article key={sample.key} className="group">
                    <SamplePreviewLink sample={sample}>
                      <ShowcasePreview
                        sampleKey={sample.key as "google-shoope" | "google-emdad-ahan"}
                      />
                    </SamplePreviewLink>
                    <SampleCaption sample={sample} />
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <CustomerQuotes />
        </div>
      </div>
    </section>
  );
}
