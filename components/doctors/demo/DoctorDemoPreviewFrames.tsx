import Link from "next/link";
import type { ReactNode } from "react";
import { BrowserChrome } from "@/components/showcase/ShowcaseFrames";
import type { DoctorSpecialtySample } from "@/lib/doctorsData";
import { getDoctorDemo } from "@/lib/doctorsDemoData";
import DoctorDemoLandingPreview from "./DoctorDemoLandingPreview";

function PreviewLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  const className = "block transition-transform duration-200 hover:-translate-y-0.5";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function EmptyDemoPreview({ label }: { label: string }) {
  return (
    <div className="flex aspect-[16/12] items-center justify-center bg-gradient-to-br from-navy-50 to-white px-6 text-center">
      <p className="text-sm font-bold text-navy-500">پیش‌نمایش دموی {label}</p>
    </div>
  );
}

export default function DoctorDemoPreviewFrames({ sample }: { sample: DoctorSpecialtySample }) {
  const demo = getDoctorDemo(sample.key);
  const previewUrl = demo?.previewUrl ?? sample.demoUrl.replace(/^https?:\/\//, "");

  const desktopPreview = demo ? (
    <DoctorDemoLandingPreview content={demo} />
  ) : (
    <EmptyDemoPreview label={sample.label} />
  );

  return (
    <PreviewLink href={sample.demoUrl} external={sample.demoExternal}>
      <BrowserChrome url={previewUrl}>{desktopPreview}</BrowserChrome>
    </PreviewLink>
  );
}
