"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { getLanguageCoverage, slugify, type ArticleStatus, type KordianArticle } from "@/lib/showdemoto/dr-kordian/articles/types";
import { getKordianMessages } from "@/lib/showdemoto/dr-kordian/i18n";
import { kordianPath } from "@/lib/showdemoto/dr-kordian/routes";
import { useKordianArticles } from "../KordianArticlesProvider";

const EMPTY_FORM = {
  id: undefined as string | undefined,
  slug: "",
  status: "draft" as ArticleStatus,
  title: { en: "", ru: "" },
  excerpt: { en: "", ru: "" },
  content: { en: "", ru: "" },
  coverImageUrl: "",
  author: "Dr. Kordian",
  category: "Patient Guide",
  publishDate: new Date().toISOString().slice(0, 10),
};

export default function KordianAdminDemo() {
  const t = getKordianMessages("en").admin;
  const { articles, save, remove } = useKordianArticles();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const coverageLabel = useCallback(
    (article: KordianArticle) => {
      const cov = getLanguageCoverage(article);
      if (cov === "both") return t.bothLanguages;
      if (cov === "en") return t.enOnly;
      return t.ruOnly;
    },
    [t]
  );

  const sorted = useMemo(
    () => [...articles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [articles]
  );

  function startNew() {
    setForm({ ...EMPTY_FORM, publishDate: new Date().toISOString().slice(0, 10) });
    setEditing(true);
  }

  function startEdit(article: KordianArticle) {
    setForm({
      id: article.id,
      slug: article.slug,
      status: article.status,
      title: { ...article.title },
      excerpt: { ...article.excerpt },
      content: { ...article.content },
      coverImageUrl: article.coverImageUrl,
      author: article.author,
      category: article.category,
      publishDate: article.publishDate,
    });
    setEditing(true);
  }

  function handleSave(status: ArticleStatus) {
    const slug = form.slug.trim() || slugify(form.title.en || form.title.ru);
    if (!slug) return;
    save({
      ...form,
      slug,
      status,
      coverImageUrl:
        form.coverImageUrl ||
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    });
    setNotice(t.saved);
    setEditing(false);
    setForm(EMPTY_FORM);
    setTimeout(() => setNotice(null), 3000);
  }

  function handleDelete(id: string) {
    if (!window.confirm(t.deleteConfirm)) return;
    remove(id);
    setNotice(t.deleted);
    setTimeout(() => setNotice(null), 3000);
  }

  return (
    <div className="min-h-screen bg-slate-100 [font-family:Inter,system-ui,sans-serif]">
      <div className="border-b border-amber-300 bg-amber-100 px-4 py-3 text-center text-sm font-medium text-amber-950">
        {t.previewBanner}
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">{t.title}</h1>
            <p className="mt-1 text-sm text-navy-600">{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={kordianPath("en")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-slate-50"
            >
              {t.backToSite}
            </Link>
            <button
              type="button"
              onClick={startNew}
              className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              {t.newArticle}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {notice && (
          <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">{notice}</p>
        )}

        {editing ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-navy-900">{form.id ? t.editArticle : t.newArticle}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-navy-700">{t.slug}</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="my-article-slug"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy-700">{t.titleEn}</span>
                <input
                  value={form.title.en}
                  onChange={(e) => setForm((f) => ({ ...f, title: { ...f.title, en: e.target.value } }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy-700">{t.titleRu}</span>
                <input
                  value={form.title.ru}
                  onChange={(e) => setForm((f) => ({ ...f, title: { ...f.title, ru: e.target.value } }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy-700">{t.excerptEn}</span>
                <textarea
                  value={form.excerpt.en}
                  rows={2}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: { ...f.excerpt, en: e.target.value } }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy-700">{t.excerptRu}</span>
                <textarea
                  value={form.excerpt.ru}
                  rows={2}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: { ...f.excerpt, ru: e.target.value } }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-navy-700">{t.contentEn}</span>
                <textarea
                  value={form.content.en}
                  rows={8}
                  onChange={(e) => setForm((f) => ({ ...f, content: { ...f.content, en: e.target.value } }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-navy-700">{t.contentRu}</span>
                <textarea
                  value={form.content.ru}
                  rows={8}
                  onChange={(e) => setForm((f) => ({ ...f, content: { ...f.content, ru: e.target.value } }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-navy-700">{t.coverUrl}</span>
                <input
                  value={form.coverImageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy-700">{t.author}</span>
                <input
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy-700">{t.category}</span>
                <input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy-700">{t.publishDate}</span>
                <input
                  type="date"
                  value={form.publishDate}
                  onChange={(e) => setForm((f) => ({ ...f, publishDate: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSave("draft")}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-slate-50"
              >
                {t.saveDraft}
              </button>
              <button
                type="button"
                onClick={() => handleSave("published")}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                {t.publish}
              </button>
              {form.slug && (
                <>
                  <Link
                    href={`${kordianPath("en", "articles", form.slug || slugify(form.title.en))}?preview=1`}
                    target="_blank"
                    className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800"
                  >
                    {t.preview} EN
                  </Link>
                  <Link
                    href={`${kordianPath("ru", "articles", form.slug || slugify(form.title.ru))}?preview=1`}
                    target="_blank"
                    className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800"
                  >
                    {t.preview} RU
                  </Link>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm(EMPTY_FORM);
                }}
                className="rounded-xl px-4 py-2 text-sm text-navy-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-navy-900">{t.articles}</h2>
            </div>
            {sorted.length === 0 ? (
              <p className="p-8 text-center text-sm text-navy-600">{t.noArticles}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-navy-500">
                    <tr>
                      <th className="px-5 py-3">{t.titleEn}</th>
                      <th className="px-5 py-3">{t.status}</th>
                      <th className="px-5 py-3">{t.languageCoverage}</th>
                      <th className="px-5 py-3">{t.publishDate}</th>
                      <th className="px-5 py-3">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((article) => (
                      <tr key={article.id} className="border-t border-slate-100">
                        <td className="px-5 py-4">
                          <p className="font-medium text-navy-900">{article.title.en || "—"}</p>
                          <p className="text-xs text-navy-500">{article.title.ru || "—"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              article.status === "published"
                                ? "bg-teal-50 text-teal-800"
                                : "bg-slate-100 text-navy-600"
                            }`}
                          >
                            {article.status === "published" ? t.published : t.draft}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-navy-600">{coverageLabel(article)}</td>
                        <td className="px-5 py-4 text-navy-600">{article.publishDate}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(article)}
                              className="text-teal-700 hover:underline"
                            >
                              Edit
                            </button>
                            {article.status === "published" && (
                              <Link
                                href={kordianPath("en", "articles", article.slug)}
                                target="_blank"
                                className="text-navy-600 hover:underline"
                              >
                                {t.preview}
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(article.id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
