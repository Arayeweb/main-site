import "@/app/ai/intent/intent-landing.css";
import AiIntentLanding from "@/components/ai/intent/AiIntentLanding";
import { getIntentLanding } from "@/lib/aiIntentLandings";

/** هاب مقایسه — لندینگ CRO کامل؛ صفحات pair در /ai/compare/[slug] باقی می‌مانند */
export default function CompareHub() {
  return <AiIntentLanding def={getIntentLanding("compare")} />;
}
