import type { Metadata } from "next";
import "@/app/ai/intent/intent-landing.css";
import AiIntentLanding from "@/components/ai/intent/AiIntentLanding";
import {
  getIntentLanding,
  intentLandingMetadata,
} from "@/lib/aiIntentLandings";

const def = getIntentLanding("programming");

export const metadata: Metadata = intentLandingMetadata(def);

export default function ProgrammingIntentPage() {
  return <AiIntentLanding def={def} />;
}
