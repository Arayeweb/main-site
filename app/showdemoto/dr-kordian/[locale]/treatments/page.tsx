import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KordianTreatmentsPage from "@/components/showdemoto/dr-kordian/KordianTreatmentsPage";
import { buildKordianMetadata } from "@/lib/showdemoto/dr-kordian/metadata";
import { isKordianLocale, type KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isKordianLocale(locale)) return {};
  return buildKordianMetadata(locale, "treatments");
}

export default async function DrKordianTreatments({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isKordianLocale(locale)) notFound();
  return <KordianTreatmentsPage locale={locale as KordianLocale} />;
}
