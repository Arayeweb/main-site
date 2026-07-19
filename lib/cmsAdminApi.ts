import type { ApiResult } from '@/lib/adminApi';

async function cmsFetch<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      credentials: 'include',
      cache: 'no-store',
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error ?? `http_${res.status}` };
    }
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export type CmsArticleListItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  seo_health?: string;
  updated_at: string;
  published_at: string | null;
  scheduled_at: string | null;
  cms_categories?: { name: string; slug: string } | null;
  cms_authors?: { display_name: string } | null;
};

export function fetchCmsArticles(params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  return cmsFetch<{ articles: CmsArticleListItem[]; total: number; migration_required?: boolean }>(
    `/api/admin/blog/articles${qs}`
  );
}

export function createCmsArticle(body: Record<string, unknown>) {
  return cmsFetch<{ article: { id: string } }>('/api/admin/blog/articles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchCmsArticle(id: string) {
  return cmsFetch<{ article: Record<string, unknown> }>(`/api/admin/blog/articles/${id}`);
}

export function updateCmsArticle(id: string, body: Record<string, unknown>) {
  return cmsFetch<{ article: Record<string, unknown> }>(`/api/admin/blog/articles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function autosaveCmsArticle(id: string, body: Record<string, unknown>) {
  return cmsFetch<{ article: Record<string, unknown>; saved_at: string }>(
    `/api/admin/blog/articles/${id}/autosave`,
    { method: 'POST', body: JSON.stringify(body) }
  );
}

export function publishCmsArticle(id: string) {
  return cmsFetch<{ article: Record<string, unknown> }>(`/api/admin/blog/articles/${id}/publish`, {
    method: 'POST',
  });
}

export function scheduleCmsArticle(id: string, scheduledAt: string) {
  return cmsFetch<{ article: Record<string, unknown> }>(`/api/admin/blog/articles/${id}/schedule`, {
    method: 'POST',
    body: JSON.stringify({ scheduled_at: scheduledAt }),
  });
}

export function submitCmsReview(id: string) {
  return cmsFetch<{ article: Record<string, unknown> }>(`/api/admin/blog/articles/${id}/submit-review`, {
    method: 'POST',
  });
}

export function approveCmsArticle(id: string) {
  return cmsFetch<{ article: Record<string, unknown> }>(`/api/admin/blog/articles/${id}/approve`, {
    method: 'POST',
  });
}

export function archiveCmsArticle(id: string) {
  return cmsFetch<{ article: Record<string, unknown> }>(`/api/admin/blog/articles/${id}/archive`, {
    method: 'POST',
  });
}

export function getCmsPreviewToken(id: string) {
  return cmsFetch<{ preview_url: string }>(`/api/admin/blog/articles/${id}/preview-token`);
}

export function fetchCmsCategories() {
  return cmsFetch<{ categories: { id: string; name: string; slug: string }[] }>('/api/admin/blog/categories');
}

export function fetchCmsAuthors() {
  return cmsFetch<{ authors: { id: string; display_name: string; slug: string }[] }>('/api/admin/blog/authors');
}

export function fetchCmsMedia(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return cmsFetch<{ media: { id: string; url: string; file_name: string; alt_text: string }[] }>(
    `/api/admin/blog/media${qs}`
  );
}

export function checkCmsSlug(slug: string, excludeId?: string) {
  const params = new URLSearchParams({ slug });
  if (excludeId) params.set('exclude_id', excludeId);
  return cmsFetch<{ available: boolean }>(`/api/admin/blog/slug-check?${params}`);
}

export async function uploadCmsMedia(file: File) {
  const form = new FormData();
  form.append('file', file);
  try {
    const res = await fetch('/api/admin/blog/media/upload', {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    const json = await res.json();
    if (!res.ok || !json.ok) return { ok: false as const, error: json.error ?? 'upload_failed' };
    return { ok: true as const, data: json.media as { id: string; url: string; file_name: string; alt_text: string } };
  } catch {
    return { ok: false as const, error: 'network_error' };
  }
}

export function updateCmsMedia(id: string, patch: { alt_text?: string; caption?: string }) {
  return cmsFetch<{ media: { id: string; url: string; file_name: string; alt_text: string } }>(
    '/api/admin/blog/media',
    { method: 'PATCH', body: JSON.stringify({ id, ...patch }) }
  );
}
