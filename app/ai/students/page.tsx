import type { Metadata } from "next";
import "@/app/ai/intent/intent-landing.css";
import AiIntentLanding from "@/components/ai/intent/AiIntentLanding";
import {
  getIntentLanding,
  intentLandingMetadata,
} from "@/lib/aiIntentLandings";

const def = getIntentLanding("students");

export const metadata: Metadata = intentLandingMetadata(def);

export default function StudentsIntentPage() {
  return <AiIntentLanding def={def} />;
}
