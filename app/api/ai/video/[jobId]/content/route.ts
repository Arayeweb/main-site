import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import {
  isTrustedOpenRouterUrl,
  isTrustedSupabaseStorageUrl,
  openRouterVideoContentUrl,
} from "@/lib/openRouterUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveOpenRouterContentUrl(
  pollingUrl: string | null,
  openrouterJobId: string | null
): string | null {
  if (openrouterJobId) {
    return openRouterVideoContentUrl(openrouterJobId);
  }
  if (!pollingUrl || !isTrustedOpenRouterUrl(pollingUrl)) return null;
  const m = pollingUrl.match(/\/videos\/([^/?#]+)/);
  if (!m) return null;
  return openRouterVideoContentUrl(m[1]);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: job, error: jobErr } = await supabase
    .from("ai_media_jobs")
    .select("id, user_id, status, output_url, polling_url, openrouter_job_id")
    .eq("id", params.jobId)
    .maybeSingle();

  if (jobErr || !job) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (job.user_id !== session.userId) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const jobStatus = job.status as string;
  if (jobStatus === "pending" || jobStatus === "processing") {
    return NextResponse.json({ ok: false, error: "not_ready" }, { status: 404 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const outputUrl = job.output_url as string | null;

  // Only redirect to our Supabase storage — never arbitrary third-party URLs.
  if (outputUrl && isTrustedSupabaseStorageUrl(outputUrl)) {
    return NextResponse.redirect(outputUrl);
  }

  const sourceUrl =
    outputUrl && isTrustedOpenRouterUrl(outputUrl)
      ? outputUrl
      : resolveOpenRouterContentUrl(
          job.polling_url as string | null,
          job.openrouter_job_id as string | null
        );

  if (!sourceUrl || !isTrustedOpenRouterUrl(sourceUrl)) {
    return NextResponse.json({ ok: false, error: "not_ready" }, { status: 404 });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };

  const range = req.headers.get("range");
  if (range) headers.Range = range;

  const upstream = await fetch(sourceUrl, { headers });

  if (!upstream.ok) {
    return NextResponse.json({ ok: false, error: "upstream_error" }, { status: 502 });
  }

  const resHeaders = new Headers();
  const ct = upstream.headers.get("content-type");
  resHeaders.set("Content-Type", ct && !ct.includes("json") ? ct : "video/mp4");
  resHeaders.set("Cache-Control", "private, max-age=3600");
  resHeaders.set("Accept-Ranges", "bytes");

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) resHeaders.set("Content-Length", contentLength);
  const contentRange = upstream.headers.get("content-range");
  if (contentRange) resHeaders.set("Content-Range", contentRange);

  return new NextResponse(upstream.body, {
    status: upstream.status === 206 ? 206 : 200,
    headers: resHeaders,
  });
}
