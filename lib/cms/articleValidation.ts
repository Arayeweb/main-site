import type { CmsArticleRow } from './types';
import { countWordsFromDoc } from './renderTiptap';

export type SeoIssue = { level: 'critical' | 'warning' | 'opportunity'; code: string; message: string };

export function validateArticleForPublish(article: Partial<CmsArticleRow>): SeoIssue[] {
  const issues: SeoIssue[] = [];

  if (!article.title?.trim()) {
    issues.push({ level: 'critical', code: 'missing_title', message: 'عنوان مقاله الزامی است' });
  }
  if (!article.slug?.trim()) {
    issues.push({ level: 'critical', code: 'missing_slug', message: 'اسلاگ الزامی است' });
  }
  if (!article.author_id) {
    issues.push({ level: 'critical', code: 'missing_author', message: 'نویسنده الزامی است' });
  }

  const content = article.content_json ?? {};
  const wordCount = article.word_count ?? countWordsFromDoc(content as Record<string, unknown>);
  if (wordCount < 50) {
    issues.push({ level: 'critical', code: 'empty_body', message: 'متن مقاله خیلی کوتاه است' });
  }

  if (article.robots_index === false && article.status === 'PUBLISHED') {
    issues.push({
      level: 'warning',
      code: 'noindex_published',
      message: 'مقاله منتشرشده noindex است',
    });
  }

  if (!article.seo_description?.trim()) {
    issues.push({ level: 'warning', code: 'missing_meta', message: 'توضیح متا خالی است' });
  }
  if (!article.excerpt?.trim()) {
    issues.push({ level: 'warning', code: 'missing_excerpt', message: 'خلاصه مقاله خالی است' });
  }

  if (article.canonical_url) {
    try {
      const u = new URL(article.canonical_url);
      if (!u.protocol.startsWith('http')) {
        issues.push({ level: 'critical', code: 'invalid_canonical', message: 'canonical نامعتبر است' });
      }
    } catch {
      issues.push({ level: 'critical', code: 'invalid_canonical', message: 'canonical نامعتبر است' });
    }
  }

  return issues;
}

export function hasCriticalIssues(issues: SeoIssue[]): boolean {
  return issues.some((i) => i.level === 'critical');
}

export function seoHealthLabel(issues: SeoIssue[]): 'ok' | 'warning' | 'critical' {
  if (issues.some((i) => i.level === 'critical')) return 'critical';
  if (issues.some((i) => i.level === 'warning')) return 'warning';
  return 'ok';
}
