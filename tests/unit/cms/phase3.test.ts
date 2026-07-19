import { describe, it, expect } from 'vitest';
import { checkCannibalization } from '@/lib/cms/seo/cannibalization';
import { suggestInternalLinks } from '@/lib/cms/seo/internalLinks';
import { runSeoGuard, publishReadiness } from '@/lib/cms/seo/guard';
import { parseAiJson, ContentBriefSchema } from '@/lib/cms/ai/schemas';
import { hasCmsCapability } from '@/lib/cms/permissions';

describe('cms seo guard phase 3', () => {
  it('blocks publish when critical issues exist', () => {
    const issues = runSeoGuard({ title: '', slug: '', content_json: {} });
    const r = publishReadiness(issues);
    expect(r.canPublish).toBe(false);
    expect(r.critical.length).toBeGreaterThan(0);
  });

  it('warnings do not block publish alone', () => {
    const issues = runSeoGuard({
      title: 'عنوان کافی برای تست',
      slug: 'test-slug',
      author_id: 'a1',
      content_json: {
        type: 'doc',
        content: Array.from({ length: 60 }, () => ({
          type: 'paragraph',
          content: [{ type: 'text', text: 'کلمه تست محتوای مقاله برای رسیدن به حد نصاب' }],
        })),
      },
      word_count: 400,
      seo_description: '',
      excerpt: '',
    });
    const r = publishReadiness(issues);
    expect(r.critical.length).toBe(0);
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.canPublish).toBe(true);
  });

  it('detects cannibalization for similar keyword', () => {
    const hits = checkCannibalization({
      primaryKeyword: 'سایت پزشک',
      title: 'راهنمای سایت پزشک',
      slug: 'doctor-site-guide',
      searchIntent: 'informational',
      excludeArticleId: 'x',
      articles: [
        {
          id: 'y',
          title: 'سایت پزشکان حرفه‌ای',
          slug: 'doctor-website',
          primary_keyword: 'سایت پزشک',
          search_intent: 'informational',
        },
      ],
    });
    expect(hits.length).toBeGreaterThan(0);
  });

  it('suggests internal links for doctor content', () => {
    const links = suggestInternalLinks({
      articleText: 'برای پزشکان و کلینیک‌ها ساخت سایت مهم است',
      headings: ['مقدمه'],
      publishedArticles: [],
    });
    expect(links.some((l) => l.destinationUrl === '/doctors')).toBe(true);
  });
});

describe('cms ai schemas', () => {
  it('parses valid content brief json', () => {
    const raw = `{"primaryKeyword":"سئو","searchIntent":"informational","audience":"پزشکان","userQuestions":[],"recommendedSections":[],"evidenceNeeded":[],"internalLinkTargets":[],"risks":[]}`;
    const parsed = parseAiJson(raw, ContentBriefSchema);
    expect(parsed?.primaryKeyword).toBe('سئو');
  });

  it('rejects malformed json', () => {
    expect(parseAiJson('not json', ContentBriefSchema)).toBeNull();
  });
});

describe('cms ai permissions', () => {
  it('admin has ai_use', () => {
    expect(hasCmsCapability('admin', 'cms.ai_use')).toBe(true);
  });

  it('sales cannot use ai', () => {
    expect(hasCmsCapability('sales', 'cms.ai_use')).toBe(false);
  });
});
