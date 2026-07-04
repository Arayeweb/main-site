"use client";

import { useArenaAuth } from "../ArenaAuthContext";
import MusicStudioView from "../MusicStudioView";

export default function MusicStudioPage() {
  const { plan, setCredits } = useArenaAuth();
  return <MusicStudioView plan={plan} onCreditsChange={setCredits} />;
}
