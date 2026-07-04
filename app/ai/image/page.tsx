"use client";

import { useArenaAuth } from "../ArenaAuthContext";
import ImageStudioView from "../ImageStudioView";

export default function ImageStudioPage() {
  const { plan, setCredits } = useArenaAuth();

  return <ImageStudioView plan={plan} onCreditsChange={setCredits} />;
}
