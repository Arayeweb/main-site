import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KordianAboutPage from "@/components/showdemoto/dr-kordian/KordianAboutPage";
import { buildKordianMetadata } from "@/lib/showdemoto/dr-kordian/metadata";
import { isKordianLocale, type KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isKordianLocale(locale)) return {};
  return buildKordianMetadata(locale, "about");
}

export default async function DrKordianAbout({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isKordianLocale(locale)) notFound();
  return <KordianAboutPage locale={locale as KordianLocale} />;
}
