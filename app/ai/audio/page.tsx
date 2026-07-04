"use client";

import { useArenaAuth } from "../ArenaAuthContext";
import AudioStudioView from "../AudioStudioView";

export default function AudioStudioPage() {
  const { plan, setCredits } = useArenaAuth();

  return <AudioStudioView plan={plan} onCreditsChange={setCredits} />;
}
