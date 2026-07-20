import "server-only";

import type { NextRequest } from "next/server";
import {
  BIZCARD_BASE_SELECT,
  BIZCARD_NAV_SELECT,
} from "@/lib/bizcardDb";
import type { BizcardOwnerRow } from "@/lib/bizcardOwner";
import {
  getBizcardOwnerSession,
  type BizcardOwnerSession,
} from "@/lib/bizcardOwnerSession";
import { getSupabaseAdmin } from "@/lib/supabase";

export const BIZCARD_OWNER_SELECT = `id,${BIZCARD_BASE_SELECT},${BIZCARD_NAV_SELECT},is_active,access_token`;

export type OwnerAuthOk = {
  ok: true;
  card: BizcardOwnerRow;
  accessToken: string;
  session: BizcardOwnerSession | null;
};

export type OwnerAuthFail = {
  ok: false;
  status: number;
  error: string;
};

function normSlug(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 48);
  return s || null;
}

/** استخراج توکن خام از هدر یا query (علاوه بر کوکی سشن) */
export function extractOwnerRawToken(req: NextRequest): string {
  return (
    req.headers.get("x-bizcard-token")?.trim() ||
    req.nextUrl.searchParams.get("token")?.trim() ||
    ""
  );
}

export async function requireBizcardOwner(
  req: NextRequest,
  slugParam: string
): Promise<OwnerAuthOk | OwnerAuthFail> {
  const slug = normSlug(slugParam);
  if (!slug) return { ok: false, status: 400, error: "bad_slug" };

  const session = getBizcardOwnerSession(req);
  const rawToken = extractOwnerRawToken(req);
  const supabase = getSupabaseAdmin();

  if (session && session.slug === slug) {
    const { data, error } = await supabase
      .from("bizcards")
      .select(BIZCARD_OWNER_SELECT)
      .eq("slug", slug)
      .eq("access_token", session.accessToken)
      .maybeSingle();

    if (!error && data) {
      const row = data as unknown as BizcardOwnerRow;
      if (!row.access_token) {
        return { ok: false, status: 401, error: "unauthorized" };
      }
      return {
        ok: true,
        card: row,
        accessToken: session.accessToken,
        session,
      };
    }
  }

  if (!rawToken) return { ok: false, status: 401, error: "unauthorized" };

  const { data, error } = await supabase
    .from("bizcards")
    .select(BIZCARD_OWNER_SELECT)
    .eq("slug", slug)
    .eq("access_token", rawToken)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, status: 404, error: "not_found" };
  }

  const row = data as unknown as BizcardOwnerRow;
  if (!row.access_token) {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  return {
    ok: true,
    card: row,
    accessToken: rawToken,
    session: null,
  };
}

// Re-export pure helpers for server route convenience
export {
  buildOwnerPatch,
  ownerPanelUrl,
  strField,
  toOwnerPublicCard,
} from "@/lib/bizcardOwner";
