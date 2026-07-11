export function looksLikeWebsite(value: string): boolean {
  const v = value.trim();
  return v.includes(".") || v.includes("://") || v.startsWith("www");
}

export function parseBusinessInput(value: string): { name?: string; website?: string } {
  const trimmed = value.trim();
  if (!trimmed) return {};
  if (looksLikeWebsite(trimmed)) {
    return { website: trimmed };
  }
  return { name: trimmed };
}

export function formatBusinessLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (looksLikeWebsite(trimmed)) {
    return `آدرس سایت: ${trimmed}`;
  }
  return `نام کسب‌وکار: ${trimmed}`;
}
