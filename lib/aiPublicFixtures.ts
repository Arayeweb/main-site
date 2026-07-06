// =========================================================
// E2E_MODE fixtures for non-critical public widget routes.
// Kept empty on purpose — existing Playwright specs assert the
// empty-state fallback (tests/e2e/ai-routes.spec.ts).
// =========================================================

import type { LeaderboardEntry } from "./aiLeaderboard";
import type { AIChallenge } from "./aiChallenges";

export const E2E_LEADERBOARD_FIXTURE: LeaderboardEntry[] = [];

export const E2E_CHALLENGE_FIXTURE: AIChallenge | null = null;
