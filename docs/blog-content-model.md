# مدل محتوای بلاگ CMS

## منبع حقیقت

`cms_articles.content_json` — سند Tiptap/ProseMirror JSON.

## رندر

- سرور: `lib/cms/renderTiptap.ts` → HTML سانیتایزشده در `rendered_html`
- عمومی: `components/blog/CmsBlogArticlePage.tsx`

## فیلدهای SEO

| فیلد DB | کاربرد |
|---------|--------|
| `seo_title` | `<title>` |
| `seo_description` | meta description |
| `canonical_url` | canonical (اختیاری) |
| `robots_index` / `robots_follow` | robots |
| `primary_keyword` | keywords schema |
| `og_*` | Open Graph |

## Revision

هر انتشار snapshot در `cms_article_revisions` ذخیره می‌شود.

## Redirect

تغییر slug مقاله منتشرشده → ردیف در `cms_slug_redirects`.
