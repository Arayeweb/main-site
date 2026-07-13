import { notFound } from "next/navigation";
import KordianShell from "@/components/showdemoto/dr-kordian/KordianShell";
import { isKordianLocale, type KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

export default async function DrKordianLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isKordianLocale(locale)) notFound();

  return <KordianShell locale={locale as KordianLocale}>{children}</KordianShell>;
}
