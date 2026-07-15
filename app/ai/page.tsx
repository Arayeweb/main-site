import type { Metadata } from "next";
import ArenaHomePage from "./ArenaHomePage";
import { canonicalUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/ai") },
  openGraph: {
    url: canonicalUrl("/ai"),
  },
};

export default function AIPage() {
  return <ArenaHomePage />;
}
