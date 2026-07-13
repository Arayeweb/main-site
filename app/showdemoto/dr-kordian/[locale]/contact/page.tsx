import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KordianContactPage from "@/components/showdemoto/dr-kordian/KordianContactPage";
import { buildKordianMetadata } from "@/lib/showdemoto/dr-kordian/metadata";
import { isKordianLocale, type KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isKordianLocale(locale)) return {};
  return buildKordianMetadata(locale, "contact");
}

export default async function DrKordianContact({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isKordianLocale(locale)) notFound();
  return <KordianContactPage locale={locale as KordianLocale} />;
}
