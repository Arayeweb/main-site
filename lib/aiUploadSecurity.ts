/** Server-side ownership check for Supabase Storage URLs accepted by AI tools. */
export function isOwnedAiUploadUrl(rawUrl: string, userId: string): boolean {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl || !rawUrl || !userId) return false;

  try {
    const candidate = new URL(rawUrl);
    const expected = new URL(supabaseUrl);
    if (candidate.origin !== expected.origin) return false;

    const pathname = decodeURIComponent(candidate.pathname);
    if (pathname.includes("..")) return false;
    const marker = "/ai-uploads/";
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex < 0) return false;
    const objectPath = pathname.slice(markerIndex + marker.length);
    return objectPath.startsWith(`${userId}/`) && objectPath.length > userId.length + 1;
  } catch {
    return false;
  }
}
