'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Eye, Save, Send, CheckCircle, Calendar, Globe } from 'lucide-react';
import { BlogTiptapEditor } from '@/components/admin/blog/BlogTiptapEditor';
import { BlogSeoGuardPanel } from '@/components/admin/blog/BlogSeoGuardPanel';
import { AdminLoadingState } from '@/hooks/useAdminFetch';
import {
  fetchCmsArticle,
  autosaveCmsArticle,
  publishCmsArticle,
  submitCmsReview,
  approveCmsArticle,
  scheduleCmsArticle,
  getCmsPreviewToken,
  fetchCmsCategories,
  fetchCmsAuthors,
} from '@/lib/cmsAdminApi';
import { STATUS_LABELS } from '@/lib/cms/articleStatus';
import { EMPTY_DOC } from '@/lib/cms/types';
import { toPersianSafeSlug } from '@/lib/cms/slugUtils';
import { trackCmsEvent } from '@/lib/cms/analytics';

type SaveState = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

type ArticleState = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_json: Record<string, unknown>;
  status: string;
  version: number;
  seo_title: string;
  seo_description: string;
  primary_keyword: string;
  robots_index: boolean;
  category_id: string | null;
  author_id: string | null;
  scheduled_at: string | null;
};

export function BlogArticleEditorPage({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<ArticleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [tab, setTab] = useState<'publish' | 'seo' | 'org'>('publish');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; display_name: string }[]>([]);
  const [actionMsg, setActionMsg] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const articleRef = useRef<ArticleState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [artRes, catRes, authRes] = await Promise.all([
      fetchCmsArticle(articleId),
      fetchCmsCategories(),
      fetchCmsAuthors(),
    ]);
    if (artRes.ok) {
      const a = artRes.data.article as ArticleState;
      setArticle(a);
      articleRef.current = a;
    }
    if (catRes.ok) setCategories(catRes.data.categories);
    if (authRes.ok) setAuthors(authRes.data.authors);
    setLoading(false);
  }, [articleId]);

  useEffect(() => {
    load();
  }, [load]);

  const doAutosave = useCallback(async (snapshot: ArticleState) => {
    setSaveState('saving');
    const res = await autosaveCmsArticle(snapshot.id, {
      title: snapshot.title,
      slug: snapshot.slug,
      excerpt: snapshot.excerpt,
      content_json: snapshot.content_json,
      seo_title: snapshot.seo_title,
      seo_description: snapshot.seo_description,
      primary_keyword: snapshot.primary_keyword,
      robots_index: snapshot.robots_index,
      category_id: snapshot.category_id,
      author_id: snapshot.author_id,
      version: snapshot.version,
    });
    if (res.ok) {
      const updated = res.data.article as ArticleState;
      setArticle(updated);
      articleRef.current = updated;
      setSaveState('saved');
    } else if (res.error === 'version_conflict') {
      setSaveState('conflict');
    } else {
      setSaveState('error');
    }
  }, []);

  function scheduleAutosave(next: ArticleState) {
    setArticle(next);
    articleRef.current = next;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doAutosave(next), 2500);
  }

  function updateField<K extends keyof ArticleState>(key: K, value: ArticleState[K]) {
    if (!article) return;
    const next = { ...article, [key]: value };
    if (key === 'title' && !article.slug) {
      next.slug = toPersianSafeSlug(String(value));
    }
    scheduleAutosave(next);
  }

  async function handlePreview() {
    const res = await getCmsPreviewToken(articleId);
    if (res.ok) {
      trackCmsEvent('cms_article_previewed', { article_id: articleId });
      window.open(res.data.preview_url, '_blank');
    }
  }

  const aiContext = {
    articleId,
    title: article?.title ?? '',
    excerpt: article?.excerpt ?? '',
    primaryKeyword: article?.primary_keyword ?? '',
    contentJson: article?.content_json ?? EMPTY_DOC,
  };

  async function handlePublish() {
    await doAutosave(article!);
    const res = await publishCmsArticle(articleId);
    if (res.ok) {
      setActionMsg('منتشر شد');
      load();
    } else {
      setActionMsg(res.error === 'validation_failed' ? 'خطاهای SEO بحرانی وجود دارد' : res.error);
    }
  }

  if (loading || !article) return <AdminLoadingState />;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]" dir="rtl">
      <div className="flex items-center justify-between gap-4 px-1 py-3 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin/manager/blog" className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-sm font-semibold text-slate-900">{article.title || 'بدون عنوان'}</div>
            <div className="text-xs text-slate-400">
              {STATUS_LABELS[article.status as keyof typeof STATUS_LABELS] ?? article.status}
              {' · '}
              {saveState === 'saving' && 'در حال ذخیره…'}
              {saveState === 'saved' && 'ذخیره شد'}
              {saveState === 'error' && 'خطا در ذخیره'}
              {saveState === 'conflict' && 'تداخل نسخه — صفحه را رفرش کنید'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => doAutosave(article)} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg">
            <Save className="w-3.5 h-3.5" /> ذخیره
          </button>
          <button type="button" onClick={handlePreview} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg">
            <Eye className="w-3.5 h-3.5" /> پیش‌نمایش
          </button>
          <button type="button" onClick={async () => { await submitCmsReview(articleId); load(); }} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg">
            <Send className="w-3.5 h-3.5" /> ارسال بررسی
          </button>
          <button type="button" onClick={async () => { await approveCmsArticle(articleId); load(); }} className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg">
            <CheckCircle className="w-3.5 h-3.5" /> تأیید
          </button>
          <button
            type="button"
            onClick={async () => {
              const at = window.prompt('زمان انتشار (ISO):', new Date(Date.now() + 86400000).toISOString());
              if (at) { await scheduleCmsArticle(articleId, at); load(); }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg"
          >
            <Calendar className="w-3.5 h-3.5" /> زمان‌بندی
          </button>
          <button type="button" onClick={handlePublish} className="flex items-center gap-1 px-4 py-1.5 text-sm bg-slate-900 text-white rounded-lg">
            <Globe className="w-3.5 h-3.5" /> انتشار
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="mx-4 mt-2 text-sm text-slate-600 bg-slate-50 border rounded-lg px-3 py-2">{actionMsg}</div>
      )}

      <div className="flex flex-1 gap-4 p-4">
        <div className="flex-1 min-w-0 space-y-4">
          <input
            type="text"
            value={article.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="عنوان مقاله"
            className="w-full text-2xl font-bold border-0 border-b border-slate-200 pb-2 focus:outline-none focus:border-slate-400 bg-transparent"
          />
          <BlogTiptapEditor
            content={article.content_json ?? EMPTY_DOC}
            onChange={(json) => updateField('content_json', json)}
            aiContext={aiContext}
          />
        </div>

        <aside className="w-96 shrink-0 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div className="flex border-b border-slate-200 mb-3">
            {(['publish', 'seo', 'org'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-medium ${tab === t ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-400'}`}
              >
                {t === 'publish' ? 'انتشار' : t === 'seo' ? 'SEO' : 'سازماندهی'}
              </button>
            ))}
          </div>

          {tab === 'publish' && (
            <div className="space-y-3 text-sm">
              <Field label="اسلاگ">
                <input
                  value={article.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  className="w-full border rounded-lg px-2 py-1.5"
                />
              </Field>
              <Field label="خلاصه">
                <textarea
                  value={article.excerpt}
                  onChange={(e) => updateField('excerpt', e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-2 py-1.5"
                />
              </Field>
            </div>
          )}

          {tab === 'seo' && (
            <div className="space-y-4">
              <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 border rounded-lg p-2">
                برای ویرایش متن: بخشی را انتخاب کنید → منوی AI → «سئو کن» یا «لحن آرایه». سپس Review و Push.
              </p>
              <div className="space-y-3">
                <Field label="کلمه کلیدی">
                  <input value={article.primary_keyword} onChange={(e) => updateField('primary_keyword', e.target.value)} className="w-full border rounded-lg px-2 py-1.5" />
                </Field>
                <Field label="عنوان SEO">
                  <input value={article.seo_title} onChange={(e) => updateField('seo_title', e.target.value)} className="w-full border rounded-lg px-2 py-1.5" />
                </Field>
                <Field label="توضیح متا">
                  <textarea value={article.seo_description} onChange={(e) => updateField('seo_description', e.target.value)} rows={3} className="w-full border rounded-lg px-2 py-1.5" />
                </Field>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={article.robots_index} onChange={(e) => updateField('robots_index', e.target.checked)} />
                  index در گوگل
                </label>
              </div>
              <BlogSeoGuardPanel
                articleId={articleId}
                title={article.title}
                slug={article.slug}
                seoTitle={article.seo_title}
                seoDescription={article.seo_description}
                excerpt={article.excerpt}
                robotsIndex={article.robots_index}
                onApplySeoTitle={(v) => updateField('seo_title', v)}
                onApplySeoDescription={(v) => updateField('seo_description', v)}
              />
            </div>
          )}

          {tab === 'org' && (
            <div className="space-y-3 text-sm">
              <Field label="دسته">
                <select
                  value={article.category_id ?? ''}
                  onChange={(e) => updateField('category_id', e.target.value || null)}
                  className="w-full border rounded-lg px-2 py-1.5"
                >
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="نویسنده">
                <select
                  value={article.author_id ?? ''}
                  onChange={(e) => updateField('author_id', e.target.value || null)}
                  className="w-full border rounded-lg px-2 py-1.5"
                >
                  <option value="">—</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>{a.display_name}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
