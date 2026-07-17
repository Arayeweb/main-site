import type { Metadata } from "next";
import CompareHub from "@/components/ai/CompareHub";
import {
  getIntentLanding,
  intentLandingMetadata,
} from "@/lib/aiIntentLandings";

const def = getIntentLanding("compare");

export const metadata: Metadata = intentLandingMetadata(def);

export default function CompareHubPage() {
  return <CompareHub />;
}
