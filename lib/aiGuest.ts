// =========================================================
// مهمان — نبرد + چت مستقیم + ۱ پیام per persona بدون login
// cookie: ary_ai_guest = { token, remaining, directRemaining, personaTrials }
// =========================================================

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const GUEST_COOKIE = "ary_ai_guest";
export const MAX_GUEST_BATTLES = 2;
export const MAX_GUEST_DIRECT = 5;
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // ۳۰ روز

export interface GuestState {
  token: string;
  remaining: number;
  directRemaining: number;
  personaTrials: string[];
}

function parseGuest(raw: string | undefined | null): GuestState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<GuestState>;
    if (typeof data.token !== "string") return null;
    return {
      token: data.token,
      remaining: Math.max(0, typeof data.remaining === "number" ? data.remaining : MAX_GUEST_BATTLES),
      directRemaining: Math.max(
        0,
        typeof data.directRemaining === "number" ? data.directRemaining : MAX_GUEST_DIRECT
      ),
      personaTrials: Array.isArray(data.personaTrials)
        ? data.personaTrials.filter((x): x is string => typeof x === "string")
        : [],
    };
  } catch {
    return null;
  }
}

export function getGuestState(req: NextRequest): GuestState | null {
  return parseGuest(req.cookies.get(GUEST_COOKIE)?.value);
}

export function createGuestState(): GuestState {
  return {
    token: randomUUID(),
    remaining: MAX_GUEST_BATTLES,
    directRemaining: MAX_GUEST_DIRECT,
    personaTrials: [],
  };
}

export function decrementGuestBattle(state: GuestState): GuestState {
  return { ...state, remaining: Math.max(0, state.remaining - 1) };
}

export function decrementGuestDirect(state: GuestState): GuestState {
  return { ...state, directRemaining: Math.max(0, state.directRemaining - 1) };
}

export function markPersonaTrial(state: GuestState, personaId: string): GuestState {
  if (state.personaTrials.includes(personaId)) return state;
  return { ...state, personaTrials: [...state.personaTrials, personaId] };
}

export function canGuestPersonaMessage(state: GuestState, personaId: string): boolean {
  return !state.personaTrials.includes(personaId);
}

export function setGuestCookie(res: NextResponse, state: GuestState) {
  res.cookies.set(GUEST_COOKIE, JSON.stringify(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function guestOwnsBattle(req: NextRequest, guestToken: string | null | undefined): boolean {
  if (!guestToken) return false;
  const state = getGuestState(req);
  return !!state && state.token === guestToken;
}
