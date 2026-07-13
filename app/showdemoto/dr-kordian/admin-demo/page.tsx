import type { Metadata } from "next";
import KordianAdminDemo from "@/components/showdemoto/dr-kordian/admin/KordianAdminDemo";
import { KordianArticlesProvider } from "@/components/showdemoto/dr-kordian/KordianArticlesProvider";
import { buildKordianAdminMetadata } from "@/lib/showdemoto/dr-kordian/metadata";

export const metadata: Metadata = buildKordianAdminMetadata();

export default function DrKordianAdminDemoPage() {
  return (
    <KordianArticlesProvider>
      <KordianAdminDemo />
    </KordianArticlesProvider>
  );
}
