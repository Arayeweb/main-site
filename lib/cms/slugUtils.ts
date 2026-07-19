import slugify from 'slugify';

export function toPersianSafeSlug(input: string): string {
  const base = slugify(input, {
    lower: true,
    strict: false,
    locale: 'fa',
    trim: true,
  });
  const cleaned = base
    .replace(/[^\w\u0600-\u06FF-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || `post-${Date.now()}`;
}

export function blogArticlePath(slug: string): string {
  return `/blog/${slug}`;
}

export function normalizeRedirectPath(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return p.replace(/\/+$/, '') || '/';
}

export function wouldCreateRedirectLoop(source: string, destination: string): boolean {
  return normalizeRedirectPath(source) === normalizeRedirectPath(destination);
}
