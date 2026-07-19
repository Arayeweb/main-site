import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrowserChrome } from "@/components/showcase/ShowcaseFrames";
import type { DoctorSpecialtySample } from "@/lib/doctorsData";
import { doctorPortfolioProjects } from "@/lib/doctorsData";
import { getDoctorDemo } from "@/lib/doctorsDemoData";
import DoctorDemoLandingPreview from "./DoctorDemoLandingPreview";
import PourdastClinicHomePreview from "@/components/home/previews/PourdastClinicHomePreview";

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

function ExecutedProjectPreview({
  sampleKey,
  name,
}: {
  sampleKey: string;
  name: string;
}) {
  const projectId = sampleKey === "women" ? "pourdast-tahereh" : sampleKey;
  const project = doctorPortfolioProjects.find((p) => p.id === projectId);

  if (project?.desktopImage) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={project.desktopImage}
          alt={`نمای دسکتاپ سایت ${name}`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 480px"
        />
      </div>
    );
  }

  if (sampleKey === "general" || sampleKey === "pourdast") {
    return <PourdastClinicHomePreview />;
  }

  return null;
}

export default function DoctorDemoPreviewFrames({ sample }: { sample: DoctorSpecialtySample }) {
  const projectId = sample.key === "women" ? "pourdast-tahereh" : sample.key;
  const project = sample.kind === "executed" ? doctorPortfolioProjects.find((p) => p.id === projectId) : null;
  const hasScreenshot = Boolean(project?.desktopImage);
  const hasLivePreview =
    sample.kind === "executed" && (hasScreenshot || sample.key === "general" || sample.key === "pourdast");
  const demo = hasLivePreview ? null : getDoctorDemo(sample.key);
  const previewUrl = sample.demoExternal
    ? sample.demoUrl.replace(/^https?:\/\//, "")
    : (demo?.previewUrl ?? sample.demoUrl.replace(/^https?:\/\//, ""));

  const desktopPreview = hasLivePreview ? (
    <ExecutedProjectPreview sampleKey={sample.key} name={project?.name ?? sample.label} />
  ) : demo ? (
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
