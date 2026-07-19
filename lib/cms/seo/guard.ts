import type { CmsArticleRow } from '../types';
import { countWordsFromDoc } from '../renderTiptap';
import type { SeoIssue } from '../articleValidation';
import { validateArticleForPublish } from '../articleValidation';

function extractHeadings(doc: Record<string, unknown>): { level: number; text: string }[] {
  const out: { level: number; text: string }[] = [];
  function walk(n: Record<string, unknown>) {
    if (n.type === 'heading' && typeof n.attrs === 'object' && n.attrs) {
      const level = Number((n.attrs as { level?: number }).level ?? 2);
      const text = ((n.content as Record<string, unknown>[]) ?? [])
        .map((c) => (c.text as string) ?? '')
        .join('');
      if (text) out.push({ level, text });
    }
    ((n.content as Record<string, unknown>[]) ?? []).forEach((c) => walk(c));
  }
  walk(doc);
  return out;
}

export function runSeoGuard(article: Partial<CmsArticleRow>): SeoIssue[] {
  const issues = validateArticleForPublish(article);
  const doc = (article.content_json ?? {}) as Record<string, unknown>;
  const headings = extractHeadings(doc);

  const h1Count = headings.filter((h) => h.level === 1).length;
  if (h1Count > 0) {
    issues.push({
      level: 'warning',
      code: 'h1_in_content',
      message: 'H1 در بدنه مقاله نباید باشد (عنوان صفحه H1 است)',
    });
  }

  let prev = 0;
  for (const h of headings) {
    if (prev && h.level > prev + 1) {
      issues.push({
        level: 'warning',
        code: 'skipped_heading_level',
        message: `سطح عنوان «${h.text}» از سلسله‌مراتب عناوین پرش دارد`,
      });
    }
    prev = h.level;
  }

  if (headings.length < 2 && (article.word_count ?? 0) > 400) {
    issues.push({
      level: 'warning',
      code: 'weak_headings',
      message: 'ساختار عناوین ضعیف است',
    });
  }

  const text = JSON.stringify(doc);
  const internalLinkCount = (text.match(/href="\/[^"]+"/g) ?? []).length;
  if (internalLinkCount === 0 && (article.word_count ?? countWordsFromDoc(doc)) > 300) {
    issues.push({
      level: 'warning',
      code: 'no_internal_links',
      message: 'لینک داخلی در متن نیست',
    });
  }

  if (!article.primary_keyword?.trim()) {
    issues.push({
      level: 'opportunity',
      code: 'missing_primary_keyword',
      message: 'کلمه کلیدی اصلی تعیین نشده',
    });
  }

  if (article.status === 'PUBLISHED' && !article.published_at) {
    issues.push({
      level: 'critical',
      code: 'missing_published_date',
      message: 'تاریخ انتشار برای مقاله منتشرشده الزامی است',
    });
  }

  return issues;
}

export function publishReadiness(issues: SeoIssue[]): {
  critical: SeoIssue[];
  warnings: SeoIssue[];
  opportunities: SeoIssue[];
  canPublish: boolean;
} {
  const critical = issues.filter((i) => i.level === 'critical');
  const warnings = issues.filter((i) => i.level === 'warning');
  const opportunities = issues.filter((i) => i.level === 'opportunity');
  return {
    critical,
    warnings,
    opportunities,
    canPublish: critical.length === 0,
  };
}
