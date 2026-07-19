# طرح پیاده‌سازی CMS بلاگ آرایه

**فاز:** ۱ — بررسی Repository و طراحی معماری  
**تاریخ:** ۱۹ تیر ۱۴۰۵  
**وضعیت:** فاز ۲ و ۳ پیاده‌سازی شده

---

## خلاصه اجرایی

بلاگ آرایه امروز **کاملاً استاتیک** است: کاتالوگ در `lib/blog/posts.ts`، بدنه مقالات در فایل‌های TypeScript/React جداگانه، و ۶ فایل HTML قدیمی در `public/blog/`. هیچ جدول `blog_posts` در Supabase وجود ندارد. پنل ادمین با نشست HMAC (`ary_admin`)، Supabase Auth + جدول `admin_users`، و Route Handlerهای `{ ok, error }` کار می‌کند. **Server Action وجود ندارد.**

هدف فاز ۲: ساخت CMS داخل پنل **مدیریت** (`/admin/manager/blog`) با محتوای JSON (Tiptap)، انتشار از طریق Supabase، و یک مسیر عمومی داینامیک `[slug]` بدون شکستن URLهای فعلی.

---

## ۱. خلاصه استک فعلی

| لایه | فناوری | نسخه / جزئیات |
|------|--------|----------------|
| Framework | Next.js App Router | `^14.2.5` |
| UI | React | `^18.3.1` |
| زبان | TypeScript | `^5.5.3` |
| استایل | Tailwind CSS | `^3.4.19` |
| کامپوننت UI | Radix UI (dialog, dropdown) | `^1–2.x` |
| آیکون | lucide-react | `^1.23.0` |
| انیمیشن | framer-motion, gsap | — |
| دیتابیس | Supabase (Postgres) | `@supabase/supabase-js ^2.45.0` |
| ORM | **ندارد** — کوئری مستقیم Supabase client | `lib/supabase.ts` → `getSupabaseAdmin()` |
| احراز هویت ادمین | Supabase Auth + HMAC cookie | `lib/auth.ts`, `lib/adminLogin.ts` |
| اعتبارسنجی | **دستی** (`str`, `num`, `bool` در `lib/adminRouteHelpers.ts`) | Zod/Yup **وجود ندارد** |
| ویرایشگر | **ندارد** (فقط CodeMirror برای JSON/CSS در بخش‌های دیگر) | Tiptap باید اضافه شود |
| AI | OpenRouter via `OpenRouterProvider` | `lib/ai/providers/openrouter.ts` |
| آنالیتیکس | GTM + Supabase `analytics_events` + `page_views` + PostHog (فقط `/ai`) + Vercel Analytics | — |
| تست | Vitest (unit/integration) + Playwright (e2e) | — |
| مانیتورینگ | Sentry | `@sentry/nextjs` |
| ایمیل | Resend | — |
| Markdown عمومی | react-markdown + remark-gfm | فقط رندر، نه CMS |

### فرض‌های مستندسازی‌شده

- منطقه زمانی اپلیکیشن: **`Asia/Tehran`** (برای زمان‌بندی انتشار).
- زبان پیش‌فرض محتوا: **`fa`** (RTL).
- URL پایه: **`https://araaye.com`** (`lib/siteUrl.ts`).

---

## ۲. معماری فعلی بلاگ

### منبع داده

مقالات از **۴ الگوی جداگانه** تغذیه می‌شوند:

| الگو | فایل(ها) | تعداد | رندر |
|------|----------|-------|------|
| Legacy migrated | `lib/blog/legacyArticleData.ts` | ۵ زنده (+ ۱ استفاده‌نشده) | `LegacyMigratedBlogArticlePage` |
| SEO template | `lib/blog/articles/onlineBookingArticle.ts` | ۱ | `SeoBlogArticlePage` |
| Modares (معلم خصوصی) | `lib/blog/modaresArticleData.ts` | ۳ | `modaresArticles.tsx` |
| Inline JSX | `app/blog/<slug>/page.tsx` | ۶ | خود صفحه |

**کاتالوگ مرکزی:** `lib/blog/posts.ts` — ۱۵ مقاله + ۱ تیزر (`clinic-solution` → `/doctors`).

**هاب‌ها:** `/blog/doctors`, `/blog/ai` — از `lib/blog/clusters.ts`.

### مسیرهای عمومی

```
/blog                          → app/blog/page.tsx
/blog/doctors                  → app/blog/doctors/page.tsx
/blog/ai                       → app/blog/ai/page.tsx
/blog/[slug]                   → app/blog/<slug>/page.tsx (۱۵ صفحه جدا)
```

**هنوز وجود ندارد:** `app/blog/[slug]/page.tsx` داینامیک.

### کامپوننت‌های بلاگ

- `components/blog/BlogIndexContent.tsx` — فهرست با فیلتر موضوع
- `components/blog/BlogClusterHub.tsx` — هاب خوشه
- `components/blog/SeoBlogArticlePage.tsx` — قالب SEO کامل + JSON-LD
- `components/blog/BlogClusterAnalytics.tsx` — GTM `blog_cluster_view`

### Sitemap و SEO

- Sitemap اصلی: `app/sitemap.ts` → `lib/sitemapRoutes.ts` — مسیرهای بلاگ به‌صورت **هاردکد** در `STATIC_SITEMAP_PATHS`.
- `lastmod`: `lib/blog/postUpdatedAt.ts`.
- Canonical: `lib/siteUrl.ts` → `canonicalUrl(path)`.
- JSON-LD: `BlogPosting` + `BreadcrumbList` (+ گاهی `FAQPage`) در کامپوننت‌های مقاله.
- **RSS وجود ندارد.**
- **ISR/revalidate روی بلاگ وجود ندارد** — صفحات در build استاتیک می‌شوند.

---

## ۳. معماری فعلی پنل ادمین

### ساختار پنل‌ها

| پنل | مسیر | Layout |
|-----|------|--------|
| مدیریت | `/admin/manager/*` | `AdminLayout panel="manager"` |
| فروش | `/admin/sales/*` | `AdminLayout panel="sales"` |
| پشتیبانی | `/admin/support/*` | `AdminLayout panel="support"` |
| عملیات AI | `/admin/ai-ops/*` | `AiOpsLayout` |

**سایدبار:** `components/admin/layout/sidebarConfig.ts` — **هیچ آیتم بلاگ/CMS وجود ندارد.**

### الگوی API

```ts
// الگوی استاندارد (مثال: app/api/admin/clients/route.ts)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: requireSession → { ok: true, data }
// POST/PATCH: requireAdmin / requireRoles → validate → supabase → { ok, error? }
```

- کلاینت: `lib/adminApi.ts` + `hooks/useAdminFetch`.
- **Server Actions (`"use server"`) وجود ندارد.**

### نزدیک‌ترین الگوی CMS موجود

`ai_content_blocks` در Supabase + UI در `app/admin/ai-ops/content/page.tsx` + API در `app/api/admin/ai-ops/content/route.ts`.

فیلدها: `id`, `title`, `body` (text), `kind` (markdown|html|json), `is_published`, `updated_by`.

این الگو **ساده‌تر از نیاز بلاگ** است ولی الگوی audit (`logAiAdminAction`) و upsert را نشان می‌دهد.

---

## ۴. احراز هویت و سیستم نقش

### جریان ورود

1. `POST /api/admin/auth/login` → Supabase `signInWithPassword`
2. Lookup `admin_users` با UUID احراز Supabase
3. بررسی `is_active`
4. `signUserToken(userId, role)` → کوکی httpOnly `ary_admin` (۱۲ ساعت)
5. Rate limit: ۸ تلاش/دقیقه/IP

### نقش‌های فعلی (`lib/auth.ts`)

**پنل آژانس:**
- `admin` — دسترسی کامل همه `/admin`
- `sales` — فقط `/admin/sales` + مسیرهای مشترک
- `support` — فقط `/admin/support` + مسیرهای مشترک

**پنل AI-ops:**
- `ai_superadmin`, `ai_finance`, `ai_support`, `ai_ops`

### Middleware (`middleware.ts`)

- `ROLE_ALLOWED_PREFIXES` — ACL بر اساس prefix مسیر
- Gate اختیاری: `ADMIN_PANEL_ACCESS_SECRET` + کوکی `ary_admin_gate`
- `X-Robots-Tag: noindex, nofollow` روی پاسخ‌های ادمین
- ریدایرکت `blog.araaye.com` → `araaye.com/blog`

### جدول کاربران

```sql
admin_users (
  id uuid PK,           -- همان UUID Supabase Auth
  email unique, name, role text default 'sales',
  password_hash text,    -- legacy؛ auth واقعی Supabase است
  is_active boolean, last_login_at
)
```

**نکته:** در `lib/adminTypes.ts` توضیح نقش `content` در تنظیمات شرکت آمده، ولی **`content` یک `AdminRole` واقعی نیست.**

---

## ۵. رویکرد دیتابیس

- **Supabase Postgres** با RLS فعال روی همه جداول.
- اپلیکیشن از **service role** (`SUPABASE_SERVICE_ROLE_KEY`) استفاده می‌کند — RLS در عمل bypass می‌شود؛ امنیت در لایه API است.
- Migrationها: `supabase/migrations/YYYYMMDD_description.sql` (۳۳ فایل فعلی).
- Schema dump: `supabase/schema.sql`.
- **بدون** `database.types.ts` تولیدشده — تایپ‌ها دستی در `lib/`.

### جداول مرتبط موجود

| جدول | ارتباط با CMS |
|------|----------------|
| `admin_users` | نویسنده/ویرایشگر/بازبین |
| `ai_content_blocks` | الگوی ساده محتوا |
| `ai_admin_audit_log` | الگوی audit |
| `analytics_events` | رویدادهای CMS |
| `page_views` | بازدید مقالات |

---

## ۶. ریسک‌ها و تداخل‌های Legacy

### بحرانی

| # | ریسک | جزئیات | راه‌حل پیشنهادی |
|---|------|--------|-----------------|
| 1 | **دوگانگی محتوا** | ۶ فایل `public/blog/posts/*.html` با canonical روی `blog.araaye.com` | migration به DB؛ حذف یا noindex فایل‌های static پس از تأیید |
| 2 | **سه‌گانگی `online-booking`** | صفحه زنده ≠ legacy data ≠ HTML static | migration از نسخه زنده (SeoBlogArticle) |
| 3 | **Sitemap/robots قدیمی** | `public/blog/sitemap.xml` و `public/blog/robots.txt` هنوز سرو می‌شوند | حذف یا redirect به sitemap اصلی |
| 4 | **۴ پیاده‌سازی مقاله** | ناسازگاری schema/metadata | یکسان‌سازی با `CmsBlogArticlePage` + Tiptap renderer |
| 5 | **Canonical نسبی Modares** | `alternates.canonical: "/blog/..."` vs مطلق | یکسان‌سازی با `canonicalUrl()` |
| 6 | **بدون revalidation** | انتشار CMS نیاز به invalidation دارد | `revalidatePath` + `revalidateTag` + cron |

### متوسط

| # | ریسک | راه‌حل |
|---|------|--------|
| 7 | ریدایرکت `/blog/posts/*` موجود است ولی static files روی دیسک مانده | نگه‌داشتن redirect + پاکسازی static |
| 8 | `LEGACY_MIGRATED_SLUGS` در sitemap جدا enumerate شده | sitemap از DB بخواند |
| 9 | نبود Zod برای validation پیچیده CMS | افزودن Zod فقط برای لایه CMS (توصیه‌شده) |
| 10 | نبود نقش `editor` | permission matrix روی نقش‌های موجود + capability flags |

### URLهای Legacy

```
/blog/posts/:slug          → 308 → /blog/:slug     (next.config.js)
/blog/posts/:slug.html     → 308 → /blog/:slug
blog.araaye.com/*          → 301 → araaye.com/blog/*
public/blog/index.html     → ممکن است با app/blog تداخل داشته باشد
public/blog/sitemap.xml    → فقط ۳ URL قدیمی
```

---

## ۷. نقشه مسیرهای پیشنهادی (Admin)

CMS داخل **پنل مدیریت** (`manager`) — چون `admin` دسترسی کامل دارد و محتوا عملیات آژانس است، نه AI-ops.

```
/admin/manager/blog                          → فهرست مقالات + داشبورد CMS
/admin/manager/blog/new                      → ایجاد مقاله
/admin/manager/blog/[id]                     → ویرایشگر مقاله
/admin/manager/blog/categories               → مدیریت دسته‌ها
/admin/manager/blog/tags                     → مدیریت تگ‌ها
/admin/manager/blog/authors                  → مدیریت نویسندگان
/admin/manager/blog/media                    → کتابخانه رسانه
/admin/manager/blog/settings                 → تنظیمات CMS + AI
/admin/manager/blog/audit                    → لاگ audit (اختیاری، فاز ۳)
```

### API Routes پیشنهادی

```
GET/POST        /api/admin/blog/articles
GET/PATCH/DELETE /api/admin/blog/articles/[id]
POST            /api/admin/blog/articles/[id]/autosave
POST            /api/admin/blog/articles/[id]/publish
POST            /api/admin/blog/articles/[id]/schedule
POST            /api/admin/blog/articles/[id]/archive
POST            /api/admin/blog/articles/[id]/submit-review
POST            /api/admin/blog/articles/[id]/approve
GET             /api/admin/blog/articles/[id]/revisions
POST            /api/admin/blog/articles/[id]/revisions/[revId]/restore
GET             /api/admin/blog/articles/[id]/preview-token
GET/POST        /api/admin/blog/categories
GET/POST        /api/admin/blog/tags
GET/POST        /api/admin/blog/authors
GET/POST        /api/admin/blog/media
POST            /api/admin/blog/media/upload
GET             /api/admin/blog/slug-check
POST            /api/admin/blog/ai/[action]          → فاز ۳
GET             /api/admin/blog/seo/analyze           → فاز ۳
GET             /api/admin/blog/dashboard             → ویجت‌ها
GET             /api/cron/blog-publish?secret=        → انتشار زمان‌بندی‌شده
```

### مسیرهای عمومی (تغییر)

```
/blog                              → فهرست (داده از DB + fallback استاتیک در migration)
/blog/doctors                      → هاب (دسته/cluster از DB)
/blog/ai                           → هاب
/blog/[slug]                       → مقاله داینامیک (جدید)
/blog/preview/[token]              → پیش‌نمایش امن draft
```

**استراتژی URL:** صفحات استاتیک فعلی (`app/blog/<slug>/page.tsx`) تا پایان migration باقی بمانند؛ پس از migration هر slug، صفحه استاتیک حذف و به `[slug]` داینامیک واگذار شود. ریدایرکت slug از جدول `cms_slug_redirects`.

---

## ۸. طرح دیتابیس پیشنهادی

### Enum: `cms_article_status`

```sql
CREATE TYPE cms_article_status AS ENUM (
  'DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'
);
```

### `cms_articles`

```sql
CREATE TABLE cms_articles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL DEFAULT '',
  slug                  text NOT NULL UNIQUE,
  excerpt               text NOT NULL DEFAULT '',
  content_json          jsonb NOT NULL DEFAULT '{}',
  rendered_html         text,                    -- cache اختیاری، تولید سمت سرور
  status                cms_article_status NOT NULL DEFAULT 'DRAFT',
  locale                text NOT NULL DEFAULT 'fa',
  category_id           uuid REFERENCES cms_categories(id) ON DELETE SET NULL,
  author_id             uuid REFERENCES cms_authors(id) ON DELETE SET NULL,
  reviewer_id           uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  featured_image_id     uuid REFERENCES cms_media_assets(id) ON DELETE SET NULL,
  primary_keyword       text NOT NULL DEFAULT '',
  secondary_keywords    text[] NOT NULL DEFAULT '{}',
  search_intent         text NOT NULL DEFAULT '',
  seo_title             text NOT NULL DEFAULT '',
  seo_description       text NOT NULL DEFAULT '',
  canonical_url         text,
  robots_index          boolean NOT NULL DEFAULT true,
  robots_follow         boolean NOT NULL DEFAULT true,
  og_title              text NOT NULL DEFAULT '',
  og_description        text NOT NULL DEFAULT '',
  og_image_id           uuid REFERENCES cms_media_assets(id) ON DELETE SET NULL,
  schema_type           text NOT NULL DEFAULT 'BlogPosting',
  primary_cta_label     text NOT NULL DEFAULT '',
  primary_cta_url       text NOT NULL DEFAULT '',
  primary_landing_page  text NOT NULL DEFAULT '',
  published_at          timestamptz,
  scheduled_at          timestamptz,
  reading_time          int NOT NULL DEFAULT 0,
  word_count            int NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by            uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  -- optimistic concurrency
  version               int NOT NULL DEFAULT 1
);

CREATE INDEX idx_cms_articles_status ON cms_articles(status);
CREATE INDEX idx_cms_articles_slug ON cms_articles(slug);
CREATE INDEX idx_cms_articles_published_at ON cms_articles(published_at) WHERE status = 'PUBLISHED';
CREATE INDEX idx_cms_articles_scheduled_at ON cms_articles(scheduled_at) WHERE status = 'SCHEDULED';
```

### `cms_article_revisions`

```sql
CREATE TABLE cms_article_revisions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      uuid NOT NULL REFERENCES cms_articles(id) ON DELETE CASCADE,
  version         int NOT NULL,
  snapshot_json   jsonb NOT NULL,
  change_summary  text NOT NULL DEFAULT '',
  created_by      uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, version)
);
```

### `cms_categories`

```sql
CREATE TABLE cms_categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  description     text NOT NULL DEFAULT '',
  seo_title       text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  hub_url         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
```

### `cms_tags`

```sql
CREATE TABLE cms_tags (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name  text NOT NULL,
  slug  text NOT NULL UNIQUE
);

CREATE TABLE cms_article_tags (
  article_id uuid REFERENCES cms_articles(id) ON DELETE CASCADE,
  tag_id     uuid REFERENCES cms_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);
```

### `cms_authors`

```sql
CREATE TABLE cms_authors (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  slug         text NOT NULL UNIQUE,
  bio          text NOT NULL DEFAULT '',
  avatar_id    uuid REFERENCES cms_media_assets(id) ON DELETE SET NULL,
  job_title    text NOT NULL DEFAULT '',
  profile_url  text,
  social_urls  jsonb NOT NULL DEFAULT '{}',
  active       boolean NOT NULL DEFAULT true,
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL  -- ارتباط اختیاری
);
```

### `cms_media_assets`

```sql
CREATE TABLE cms_media_assets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url          text NOT NULL,
  storage_key  text NOT NULL,
  file_name    text NOT NULL,
  mime_type    text NOT NULL,
  file_size    int NOT NULL,
  width        int,
  height       int,
  alt_text     text NOT NULL DEFAULT '',
  caption      text NOT NULL DEFAULT '',
  uploaded_by  uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

**Bucket Supabase Storage:** `blog-uploads` (public read، upload فقط از API ادمین).

### `cms_slug_redirects`

```sql
CREATE TABLE cms_slug_redirects (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path      text NOT NULL UNIQUE,
  destination_path text NOT NULL,
  status_code      int NOT NULL DEFAULT 301,
  article_id       uuid REFERENCES cms_articles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
```

### `cms_audit_logs`

```sql
CREATE TABLE cms_audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   text NOT NULL,
  metadata    jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cms_audit_entity ON cms_audit_logs(entity_type, entity_id);
```

### `cms_ai_usage_logs` (فاز ۳)

```sql
CREATE TABLE cms_ai_usage_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      uuid REFERENCES cms_articles(id) ON DELETE SET NULL,
  user_id         uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action          text NOT NULL,
  provider        text NOT NULL DEFAULT 'openrouter',
  model           text NOT NULL,
  prompt_version  text NOT NULL DEFAULT 'v1',
  input_tokens    int NOT NULL DEFAULT 0,
  output_tokens   int NOT NULL DEFAULT 0,
  estimated_cost  numeric(12,6) NOT NULL DEFAULT 0,
  latency_ms      int,
  success         boolean NOT NULL DEFAULT true,
  error_code      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

### `cms_settings` (فاز ۳)

```sql
CREATE TABLE cms_settings (
  id         int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  updated_at timestamptz NOT NULL DEFAULT now(),
  data       jsonb NOT NULL DEFAULT '{}'
);
```

### جدول migration tracking

```sql
CREATE TABLE cms_migration_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_slug  text NOT NULL,
  article_id   uuid REFERENCES cms_articles(id),
  source_type  text NOT NULL,  -- legacy|seo|modares|inline
  ran_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_slug)
);
```

---

## ۹. ماتریس دسترسی پیشنهادی

به‌جای نقش جدید، از **capability flags** در `lib/cmsPermissions.ts` استفاده شود که روی نقش‌های موجود map می‌شوند.

| Capability | admin | sales | support | ai_superadmin | ai_ops |
|------------|:-----:|:-----:|:-------:|:-------------:|:------:|
| `cms.read` | ✓ | ✓ (فقط خواندن) | — | — | — |
| `cms.create` | ✓ | — | — | — | — |
| `cms.edit_own` | ✓ | — | — | — | — |
| `cms.edit_all` | ✓ | — | — | — | — |
| `cms.submit_review` | ✓ | — | — | — | — |
| `cms.approve` | ✓ | — | — | — | — |
| `cms.publish` | ✓ | — | — | — | — |
| `cms.schedule` | ✓ | — | — | — | — |
| `cms.archive` | ✓ | — | — | — | — |
| `cms.manage_categories` | ✓ | — | — | — | — |
| `cms.manage_authors` | ✓ | — | — | — | — |
| `cms.manage_media` | ✓ | — | — | — | — |
| `cms.restore_revision` | ✓ | — | — | — | — |
| `cms.view_audit_log` | ✓ | — | — | — | — |
| `cms.ai_use` | ✓ | — | — | — | — |
| `cms.ai_settings` | ✓ | — | — | — | — |

### تغییرات middleware

افزودن `/admin/manager/blog` به prefixهای مجاز `admin`. نقش `sales` فقط `GET` API با `cms.read` (بدون mutation).

### قوانین workflow

| انتقال | شرط |
|--------|-----|
| DRAFT → IN_REVIEW | `cms.submit_review` |
| IN_REVIEW → APPROVED | `cms.approve` |
| APPROVED → PUBLISHED | `cms.publish` + validation SEO بحرانی |
| APPROVED → SCHEDULED | `cms.schedule` + `scheduled_at` |
| SCHEDULED → PUBLISHED | cron idempotent |
| * → ARCHIVED | `cms.archive` |
| PUBLISHED + ویرایش | ایجاد draft جدید روی همان article بدون overwrite نسخه live تا publish |

---

## ۱۰. ساختار فایل/پوشه پیشنهادی

```
app/
  admin/manager/blog/
    page.tsx                          # فهرست + داشبورد
    new/page.tsx
    [id]/page.tsx                     # ویرایشگر
    categories/page.tsx
    tags/page.tsx
    authors/page.tsx
    media/page.tsx
    settings/page.tsx
  blog/
    [slug]/page.tsx                   # رندر داینامیک CMS (جدید)
    preview/[token]/page.tsx          # پیش‌نمایش امن
  api/admin/blog/
    articles/route.ts
    articles/[id]/route.ts
    articles/[id]/autosave/route.ts
    articles/[id]/publish/route.ts
    articles/[id]/schedule/route.ts
    articles/[id]/archive/route.ts
    articles/[id]/submit-review/route.ts
    articles/[id]/approve/route.ts
    articles/[id]/revisions/route.ts
    articles/[id]/revisions/[revId]/restore/route.ts
    articles/[id]/preview-token/route.ts
    categories/route.ts
    tags/route.ts
    authors/route.ts
    media/route.ts
    media/upload/route.ts
    slug-check/route.ts
    dashboard/route.ts
    ai/[action]/route.ts              # فاز ۳
    seo/analyze/route.ts              # فاز ۳
  api/cron/blog-publish/route.ts

components/
  admin/blog/
    BlogArticleList.tsx
    BlogArticleFilters.tsx
    BlogArticleEditor.tsx
    BlogEditorTopbar.tsx
    BlogEditorSidebar.tsx
    BlogPublishPanel.tsx
    BlogSeoPanel.tsx
    BlogOrganizationPanel.tsx
    BlogAiAssistantPanel.tsx          # فاز ۳
    BlogMediaLibrary.tsx
    BlogMediaPicker.tsx
    BlogRevisionHistory.tsx
    BlogDashboardWidgets.tsx
  blog/
    CmsBlogArticlePage.tsx            # قالب عمومی یکپارچه
    TiptapRenderer.tsx                # رندر JSON → HTML امن
    BlogIndexContent.tsx              # به‌روز برای خواندن از DB

lib/
  cms/
    permissions.ts
    articleValidation.ts
    articleStatus.ts
    slugUtils.ts
    previewToken.ts
    renderTiptap.ts
    sanitizeHtml.ts
    revalidateBlog.ts
    auditLog.ts
    types.ts
    queries/
      articles.ts
      categories.ts
      tags.ts
      authors.ts
      media.ts
    ai/                                 # فاز ۳
      actions.ts
      prompts/
      schemas.ts
      router.ts
    seo/                                # فاز ۳
      guard.ts
      cannibalization.ts
      internalLinks.ts
    migration/
      migrateArticles.ts
      converters/
        legacyConverter.ts
        seoConverter.ts
        modaresConverter.ts
        inlineConverter.ts

supabase/migrations/
  20260719_cms_blog_core.sql
  20260720_cms_blog_ai.sql              # فاز ۳

tests/
  unit/cms/
  integration/cms/
  e2e/cms/

docs/
  admin-blog-cms-plan.md                # این سند
  admin-blog-cms.md                     # فاز ۲
  blog-content-model.md                 # فاز ۲
  blog-publishing-workflow.md           # فاز ۲
  cms-ai-assistant.md                   # فاز ۳
  cms-seo-guard.md                      # فاز ۳
  cms-editor-guide-fa.md                # فاز ۳
  cms-admin-permissions.md              # فاز ۳
```

---

## ۱۱. Migrationهای مورد نیاز

### Migration ۱: `20260719_cms_blog_core.sql`

- ایجاد enum `cms_article_status`
- ایجاد همه جداول بخش ۸
- RLS enable (بدون policy عمومی — service role only)
- Seed دسته‌های اولیه از `blogTopics` موجود
- Seed نویسنده پیش‌فرض «آرایه»
- ایجاد bucket `blog-uploads` (در migration SQL یا Supabase dashboard)

### Migration ۲: `20260720_cms_blog_ai.sql` (فاز ۳)

- `cms_ai_usage_logs`
- `cms_settings` با defaults

### Migration داده (اسکریپت)

`scripts/migrate-blog-to-cms.ts`:

```
--dry-run     گزارش بدون نوشتن
--slug=X      فقط یک مقاله
--force       بازنویسی (با احتیاط)
```

**منابع migration:**

| منبع | Converter | Slugها |
|------|-----------|--------|
| `legacyArticleData.ts` | HTML → Tiptap JSON | ۵ slug |
| `onlineBookingArticle.ts` | SeoBlogArticle → JSON | ۱ |
| `modaresArticleData.ts` | sections → JSON | ۳ |
| Inline pages | scrape metadata + JSX body | ۶ |

**قوانین:**
- `cms_migration_runs` برای idempotency
- حفظ `slug`, `published_at`, canonical
- تصاویر: کپی URL موجود (بدون re-upload اجباری)
- **هرگز** فایل‌های منبع را خودکار حذف نکند

---

## ۱۲. پکیج‌های مورد نیاز

### فاز ۲ (هسته CMS)

```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-link": "^2.x",
  "@tiptap/extension-image": "^2.x",
  "@tiptap/extension-table": "^2.x",
  "@tiptap/extension-table-row": "^2.x",
  "@tiptap/extension-table-cell": "^2.x",
  "@tiptap/extension-table-header": "^2.x",
  "@tiptap/extension-placeholder": "^2.x",
  "@tiptap/extension-underline": "^2.x",
  "@tiptap/extension-character-count": "^2.x",
  "zod": "^3.x",
  "sanitize-html": "^2.x",
  "slugify": "^1.x"
}
```

**توضیح Zod:** پروژه فعلاً validation دستی دارد؛ برای schemaهای پیچیده CMS (content JSON, SEO, AI output) افزودن Zod توصیه می‌شود — scope محدود به `lib/cms/`.

### فاز ۳ (AI — بدون پکیج جدید)

از `openRouterProvider` موجود استفاده شود.

---

## ۱۳. متغیرهای محیطی

### موجود (بدون تغییر)

| متغیر | کاربرد |
|-------|--------|
| `SUPABASE_URL` | دیتابیس + storage |
| `SUPABASE_SERVICE_ROLE_KEY` | عملیات سرور |
| `ADMIN_SESSION_SECRET` | نشست ادمین |
| `ADMIN_PANEL_ACCESS_SECRET` | gate اختیاری |
| `OPENROUTER_API_KEY` | AI assistant (فاز ۳) |
| `OPENROUTER_CONNECT_TIMEOUT_MS` | timeout AI |
| `OPENROUTER_HEADERS_TIMEOUT_MS` | timeout AI |

### جدید پیشنهادی

| متغیر | پیش‌فرض | کاربرد |
|-------|---------|--------|
| `CMS_PREVIEW_SECRET` | (الزامی، ≥32 char) | امضای توکن preview |
| `CMS_CRON_SECRET` | (الزامی) | احراز cron انتشار |
| `CMS_UPLOAD_MAX_MB` | `10` | حداکثر حجم آپلود |
| `CMS_APP_TIMEZONE` | `Asia/Tehran` | زمان‌بندی |
| `CMS_AI_DAILY_BUDGET_USD` | `5` | سقف هزینه AI (فاز ۳) |
| `CMS_AI_RATE_LIMIT_PER_MIN` | `20` | rate limit AI (فاز ۳) |

---

## ۱۴. توالی پیاده‌سازی

### فاز ۲ — هسته CMS (هفته ۱–۳)

```
۲.۱  Schema + migration + types + permissions
     ↓
۲.۲  API CRUD articles/categories/tags/authors/media
     ↓
۲.۳  Media upload (bucket blog-uploads)
     ↓
۲.۴  Admin UI: list + filters + bulk actions
     ↓
۲.۵  Tiptap editor + autosave + conflict detection
     ↓
۲.۶  Preview token + preview page
     ↓
۲.۷  Publish workflow + revisions + audit log
     ↓
۲.۸  Slug management + redirects
     ↓
۲.۹  Public [slug] page + CmsBlogArticlePage + JSON-LD
     ↓
۲.۱۰ Migration script (dry-run → migrate 15 articles)
     ↓
۲.۱۱ Sitemap از DB + revalidate hooks
     ↓
۲.۱۲ Cron scheduled publish
     ↓
۲.۱۳ Tests (unit + integration + Playwright)
     ↓
۲.۱۴ Docs: admin-blog-cms.md, blog-content-model.md, blog-publishing-workflow.md
```

### فاز ۳ — AI + SEO Guard (هفته ۴–۵)

```
۳.۱  AI action endpoints + prompt versioning
     ↓
۳.۲  AI Assistant UI tab + diff accept/reject
     ↓
۳.۳  SEO Guard panel + publish validation
     ↓
۳.۴  Cannibalization check + internal link assistant
     ↓
۳.۵  CMS dashboard widgets + analytics events
     ↓
۳.۶  AI settings page + usage logging
     ↓
۳.۷  Tests + docs
```

### ترتیب حذف legacy (پس از migration موفق)

1. حذف `app/blog/<slug>/page.tsx` استاتیک (یکی‌یکی per slug)
2. حذف `public/blog/posts/*.html`
3. حذف `public/blog/sitemap.xml` و `public/blog/robots.txt`
4. ساده‌سازی `lib/blog/posts.ts` → wrapper روی DB query
5. حذف converters پس از تأیید QA

---

## ۱۵. برنامه تست

### Unit Tests (`tests/unit/cms/`)

| تست | فایل |
|-----|------|
| slug uniqueness + Persian-safe generation | `slugUtils.test.ts` |
| redirect creation + loop prevention | `slugRedirect.test.ts` |
| status transition rules | `articleStatus.test.ts` |
| permission matrix | `permissions.test.ts` |
| autosave conflict (version mismatch) | `autosave.test.ts` |
| article validation (critical SEO) | `articleValidation.test.ts` |
| HTML sanitization | `sanitizeHtml.test.ts` |
| Tiptap JSON → HTML render | `renderTiptap.test.ts` |
| preview token expiry | `previewToken.test.ts` |
| migration idempotency | `migration.test.ts` |

### Integration Tests (`tests/integration/cms/`)

| تست | توضیح |
|-----|--------|
| CRUD article API | create → read → update → archive |
| Publish creates revision | snapshot در `cms_article_revisions` |
| Restore revision as draft | live unchanged |
| Scheduled publish cron | APPROVED+scheduled_at → PUBLISHED |
| Slug change creates redirect | 301 از مسیر قدیم |
| Media upload validation | MIME + size |
| Unauthorized mutation | 401/403 |

### Playwright E2E (`tests/e2e/cms/`)

1. Admin creates draft
2. Admin edits article (autosave visible)
3. Draft preview opens (signed token)
4. Submit for review
5. Authorized user approves
6. Article publishes
7. Public URL loads with correct title
8. Metadata + JSON-LD present (`BlogPosting`, `BreadcrumbList`)
9. Published slug changed → old URL redirects
10. Revision restored as new draft
11. Bulk archive works
12. Media library upload + select

### SEO / Metadata Tests

- canonical self-reference on published articles
- `noindex` when `robots_index=false`
- sitemap includes only PUBLISHED articles
- sitemap excludes ARCHIVED/DRAFT
- OG tags match CMS fields
- author in schema matches `cms_authors`

### Migration QA

```bash
npx tsx scripts/migrate-blog-to-cms.ts --dry-run
# بررسی: ۱۵ slug، بدون duplicate، dates preserved
npx tsx scripts/migrate-blog-to-cms.ts
# اجرای مجدد: ۰ insert جدید
```

### دستورات CI

```bash
npm run lint
npx tsc --noEmit
npm run test:unit
npm run test:integration
npm run test:e2e -- tests/e2e/cms
```

---

## ضمیمه A: مدل محتوای Tiptap (JSON)

```ts
// lib/cms/types.ts — ساختار content_json
interface CmsDocument {
  type: 'doc';
  content: CmsNode[];
}

type CmsNode =
  | { type: 'paragraph'; content?: CmsInline[] }
  | { type: 'heading'; attrs: { level: 2 | 3 | 4 }; content?: CmsInline[] }
  | { type: 'bulletList' | 'orderedList'; content: CmsNode[] }
  | { type: 'blockquote'; content: CmsNode[] }
  | { type: 'codeBlock'; attrs?: { language?: string }; content?: { type: 'text'; text: string }[] }
  | { type: 'horizontalRule' }
  | { type: 'image'; attrs: { src: string; alt?: string; title?: string } }
  | { type: 'table'; content: CmsNode[] }
  | { type: 'callout'; attrs: { variant: 'info' | 'warning' | 'tip' }; content: CmsNode[] }
  | { type: 'cta'; attrs: { label: string; url: string; style?: string } }
  | { type: 'faq'; attrs: { items: { question: string; answer: string }[] } }
  | { type: 'comparisonTable'; attrs: { headers: string[]; rows: string[][] } }
  | { type: 'productDemo'; attrs: { product: string; demoUrl?: string } };

type CmsInline =
  | { type: 'text'; text: string; marks?: CmsMark[] }
  | { type: 'hardBreak' };

type CmsMark =
  | { type: 'bold' }
  | { type: 'italic' }
  | { type: 'underline' }
  | { type: 'strike' }
  | { type: 'code' }
  | { type: 'link'; attrs: { href: string; target?: string; rel?: string } };
```

Custom extensions برای `callout`, `cta`, `faq`, `comparisonTable`, `productDemo` در فاز ۲ ساخته می‌شوند.

---

## ضمیمه B: Revalidation پس از انتشار

```ts
// lib/cms/revalidateBlog.ts
import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateArticle(slug: string, categorySlug?: string) {
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  if (categorySlug) {
    revalidatePath(`/blog/${categorySlug}`); // hub
  }
  revalidateTag(`blog-article-${slug}`);
  revalidateTag('blog-index');
}
```

---

## ضمیمه C: Preview Token

```ts
// HMAC-signed, 15 min TTL, payload: { articleId, exp, mode: 'preview' }
// URL: /blog/preview/[token]
// Headers: X-Robots-Tag: noindex, Cache-Control: no-store
```

---

## ضمیمه D: نگاشت دسته‌های فعلی → CMS Categories

| topic فعلی (`posts.ts`) | slug پیشنهادی |
|-------------------------|---------------|
| سئو | `seo` |
| نرخ تبدیل | `conversion` |
| چت‌بات | `chatbot` |
| طراحی سایت | `web-design` |
| راهکار صنفی | `industry` |
| جذب شاگرد | `tutoring` |

---

## چک‌لیست پذیرش نهایی (هر سه فاز)

- [ ] ساخت مقاله → Brief AI → Outline → نوشتن بخش‌ها
- [ ] آپلود تصویر + Alt
- [ ] بررسی SEO (critical block publish)
- [ ] پیشنهاد لینک داخلی
- [ ] Preview امن
- [ ] Submit → Approve → Schedule/Publish
- [ ] Schema از داده واقعی CMS
- [ ] Sitemap + Revalidate
- [ ] Revision + Audit Log
- [ ] Slug change → 301 redirect
- [ ] Draft/Published جدا
- [ ] AI فقط پیشنهاد می‌دهد، publish نمی‌کند

---

*این سند خروجی فاز ۱ است. پیاده‌سازی در فاز ۲ طبق این طرح آغاز شود.*
