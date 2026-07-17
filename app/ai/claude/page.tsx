import type { Metadata } from "next";
import "@/app/ai/intent/intent-landing.css";
import AiIntentLanding from "@/components/ai/intent/AiIntentLanding";
import {
  getIntentLanding,
  intentLandingMetadata,
} from "@/lib/aiIntentLandings";

const def = getIntentLanding("claude");

export const metadata: Metadata = intentLandingMetadata(def);

export default function ClaudeIntentPage() {
  return <AiIntentLanding def={def} />;
}
