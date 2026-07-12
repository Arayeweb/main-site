import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { ok: false, error: "feature_disabled", message: "video generation is not publicly available yet" },
    { status: 503 }
  );
}
