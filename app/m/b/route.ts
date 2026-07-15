import { NextRequest, NextResponse } from "next/server";
import { buildModaresRedirectUrl } from "@/lib/modaresRedirects";

export function GET(req: NextRequest) {
  const url = buildModaresRedirectUrl("b", new URL(req.url).searchParams, req.nextUrl.origin);
  return NextResponse.redirect(url, 307);
}
