import Link from "next/link";
import type { ReactNode } from "react";
import PourdastClinicHomePreview from "@/components/home/previews/PourdastClinicHomePreview";
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

export default function DoctorDemoPreviewFrames({ sample }: { sample: DoctorSpecialtySample }) {
  const demo = getDoctorDemo(sample.key);
  const previewUrl = demo?.previewUrl ?? sample.demoUrl.replace(/^https?:\/\//, "");

  const desktopPreview = demo ? (
    <DoctorDemoLandingPreview content={demo} />
  ) : (
    <PourdastClinicHomePreview />
  );

  return (
    <PreviewLink href={sample.demoUrl} external={sample.demoExternal}>
      <BrowserChrome url={previewUrl}>{desktopPreview}</BrowserChrome>
    </PreviewLink>
  );
}
