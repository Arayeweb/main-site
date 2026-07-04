import { describe, it, expect } from "vitest";
import {
  createGuestState,
  decrementGuestBattle,
  MAX_GUEST_BATTLES,
  guestOwnsBattle,
} from "@/lib/aiGuest";
import { makeRequest } from "../helpers/request";

describe("aiGuest — guest battle limits", () => {
  it("creates guest state with max battles", () => {
    const state = createGuestState();
    expect(state.remaining).toBe(MAX_GUEST_BATTLES);
    expect(state.token).toBeTruthy();
  });

  it("decrements guest battles without going below zero", () => {
    let state = createGuestState();
    state = decrementGuestBattle(state);
    expect(state.remaining).toBe(MAX_GUEST_BATTLES - 1);
    state = decrementGuestBattle(state);
    state = decrementGuestBattle(state);
    expect(state.remaining).toBe(0);
  });

  it("guestOwnsBattle matches cookie token", () => {
    const state = createGuestState();
    const req = makeRequest("/ai", {
      cookies: { ary_ai_guest: JSON.stringify(state) },
    });
    expect(guestOwnsBattle(req, state.token)).toBe(true);
    expect(guestOwnsBattle(req, "wrong-token")).toBe(false);
  });
});
