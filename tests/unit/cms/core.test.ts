import { describe, it, expect } from 'vitest';
import { toPersianSafeSlug, wouldCreateRedirectLoop, blogArticlePath } from '@/lib/cms/slugUtils';
import { canTransition } from '@/lib/cms/articleStatus';
import { hasCmsCapability } from '@/lib/cms/permissions';
import { validateArticleForPublish, hasCriticalIssues } from '@/lib/cms/articleValidation';
import { verifyPreviewToken, signPreviewToken } from '@/lib/cms/previewToken';
import { tiptapJsonToHtml, countWordsFromDoc } from '@/lib/cms/renderTiptap';
import { EMPTY_DOC } from '@/lib/cms/types';

describe('cms slugUtils', () => {
  it('generates persian-safe slug', () => {
    const slug = toPersianSafeSlug('چک‌لیست سئو سایت');
    expect(slug.length).toBeGreaterThan(0);
    expect(slug).not.toMatch(/\s/);
  });

  it('detects redirect loops', () => {
    expect(wouldCreateRedirectLoop('/blog/foo', '/blog/foo')).toBe(true);
    expect(wouldCreateRedirectLoop('/blog/foo', '/blog/bar')).toBe(false);
  });

  it('builds blog path', () => {
    expect(blogArticlePath('test-slug')).toBe('/blog/test-slug');
  });
});

describe('cms articleStatus', () => {
  it('allows draft to in_review with submit cap', () => {
    expect(canTransition('DRAFT', 'IN_REVIEW', (c) => c === 'cms.submit_review')).toBe(true);
  });

  it('blocks publish from draft without cap', () => {
    expect(canTransition('DRAFT', 'PUBLISHED', () => false)).toBe(false);
  });
});

describe('cms permissions', () => {
  it('admin has publish', () => {
    expect(hasCmsCapability('admin', 'cms.publish')).toBe(true);
  });

  it('sales only read', () => {
    expect(hasCmsCapability('sales', 'cms.read')).toBe(true);
    expect(hasCmsCapability('sales', 'cms.publish')).toBe(false);
  });
});

describe('cms articleValidation', () => {
  it('flags missing title as critical', () => {
    const issues = validateArticleForPublish({ slug: 'x', content_json: EMPTY_DOC, author_id: 'a' });
    expect(hasCriticalIssues(issues)).toBe(true);
  });
});

describe('cms previewToken', () => {
  it('signs and verifies token', () => {
    process.env.CMS_PREVIEW_SECRET = 'test-preview-secret-32chars-min';
    const token = signPreviewToken('article-1', 'user-1');
    const payload = verifyPreviewToken(token);
    expect(payload?.articleId).toBe('article-1');
  });
});

describe('cms renderTiptap', () => {
  it('renders paragraph to html', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'سلام' }] }],
    };
    const html = tiptapJsonToHtml(doc);
    expect(html).toContain('سلام');
    expect(countWordsFromDoc(doc)).toBe(1);
  });
});
