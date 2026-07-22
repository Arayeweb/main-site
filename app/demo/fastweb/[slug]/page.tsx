import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FastWebDemoSite from "@/components/fastweb/demo/FastWebDemoSite";
import {
  FASTWEB_DEMO_SLUGS,
  getFastWebDemo,
  type FastWebDemoSlug,
} from "@/lib/fastwebDemoData";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return FASTWEB_DEMO_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const content = getFastWebDemo(params.slug);
  if (!content) {
    return { title: "دمو یافت نشد" };
  }

  return {
    title: content.seoTitle,
    description: content.seoDescription,
    robots: { index: false, follow: false },
  };
}

export default function FastWebDemoPage({ params }: PageProps) {
  const content = getFastWebDemo(params.slug);
  if (!content) {
    notFound();
  }

  return <FastWebDemoSite content={content} />;
}

export type { FastWebDemoSlug };
