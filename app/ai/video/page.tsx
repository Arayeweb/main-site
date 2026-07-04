"use client";

import { useArenaAuth } from "../ArenaAuthContext";
import VideoStudioView from "../VideoStudioView";

export default function VideoStudioPage() {
  const { plan, setCredits } = useArenaAuth();

  return <VideoStudioView plan={plan} onCreditsChange={setCredits} />;
}
