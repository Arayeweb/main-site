import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Dev-only endpoint — throws the Sentry docs ReferenceError snippet. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "NEXT_PUBLIC_SENTRY_DSN is not set. Add your DSN from Sentry → Settings → Client Keys, then retry.",
      },
      { status: 503 },
    );
  }

  // Sentry Next.js setup verification snippet (intentional ReferenceError).
  new Function("myUndefinedFunction()")();
}
