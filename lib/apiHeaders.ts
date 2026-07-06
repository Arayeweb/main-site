import { NextResponse } from "next/server";

export const NO_STORE_HEADER = "no-store, no-cache, must-revalidate, private";

/** Attach a strict no-store Cache-Control header to a response (sensitive/user-specific APIs). */
export function noStore<T extends Response>(res: T): T {
  res.headers.set("Cache-Control", NO_STORE_HEADER);
  return res;
}

/** Convenience: NextResponse.json with the no-store header applied. */
export function jsonNoStore(body: unknown, init?: ResponseInit) {
  return noStore(NextResponse.json(body, init));
}
