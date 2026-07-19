import Image from "next/image";
import { getShowcasePortfolioEntry } from "@/lib/showcaseSites/portfolio";
import type { OutputSampleKey } from "@/lib/outputSamples";
import PourdastClinicHomePreview from "./previews/PourdastClinicHomePreview";
import TaherehPourdastHomePreview from "./previews/TaherehPourdastHomePreview";
import DeepinHomePreview from "./previews/DeepinHomePreview";
import EmrozHomePreview from "./previews/EmrozHomePreview";
import KavehIronHomePreview from "./previews/KavehIronHomePreview";
import ShivaClinicHomePreview from "./previews/ShivaClinicHomePreview";

export function ShowcaseHomePreview({ sampleKey }: { sampleKey: OutputSampleKey }) {
  if (sampleKey === "shiva-hearing") {
    return <ShivaClinicHomePreview />;
  }

  if (sampleKey === "kaveh-iron") {
    return <KavehIronHomePreview />;
  }

  if (sampleKey === "emroz") {
    return <EmrozHomePreview />;
  }

  if (sampleKey === "deepinhq") {
    return <DeepinHomePreview />;
  }

  if (sampleKey === "pourdast-clinic") {
    return <PourdastClinicHomePreview />;
  }

  if (sampleKey === "tahereh-pourdast") {
    return <TaherehPourdastHomePreview />;
  }

  if (sampleKey !== "medisa-studio") {
    return null;
  }

  const entry = getShowcasePortfolioEntry("medisa-studio");
  if (!entry) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-[0_16px_48px_rgba(16,42,67,0.10)]">
      <Image
        src={entry.desktopPreview}
        alt={entry.title}
        width={1120}
        height={640}
        className="block aspect-[16/10] h-auto w-full object-cover"
        sizes="(max-width: 900px) 100vw, 50vw"
      />
      <div className="border-t border-stone-100 bg-[#f7f4ef] px-4 py-3 text-right">
        <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400">MEDISA</p>
        <p className="mt-1 text-sm font-extrabold text-navy-900">استودیو معماری مدیسا</p>
      </div>
    </div>
  );
}
