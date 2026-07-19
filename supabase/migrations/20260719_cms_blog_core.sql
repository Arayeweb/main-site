-- CMS Blog core tables for Araaye admin panel

DO $$ BEGIN
  CREATE TYPE cms_article_status AS ENUM (
    'DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.cms_media_assets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url          text NOT NULL,
  storage_key  text NOT NULL,
  file_name    text NOT NULL,
  mime_type    text NOT NULL,
  file_size    int NOT NULL DEFAULT 0,
  width        int,
  height       int,
  alt_text     text NOT NULL DEFAULT '',
  caption      text NOT NULL DEFAULT '',
  uploaded_by  uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_categories (
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

CREATE TABLE IF NOT EXISTS public.cms_authors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name  text NOT NULL,
  slug          text NOT NULL UNIQUE,
  bio           text NOT NULL DEFAULT '',
  avatar_id     uuid REFERENCES public.cms_media_assets(id) ON DELETE SET NULL,
  job_title     text NOT NULL DEFAULT '',
  profile_url   text,
  social_urls   jsonb NOT NULL DEFAULT '{}',
  active        boolean NOT NULL DEFAULT true,
  admin_user_id uuid REFERENCES public.admin_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.cms_tags (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.cms_articles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL DEFAULT '',
  slug                  text NOT NULL UNIQUE,
  excerpt               text NOT NULL DEFAULT '',
  content_json          jsonb NOT NULL DEFAULT '{}',
  rendered_html         text,
  status                cms_article_status NOT NULL DEFAULT 'DRAFT',
  locale                text NOT NULL DEFAULT 'fa',
  category_id           uuid REFERENCES public.cms_categories(id) ON DELETE SET NULL,
  author_id             uuid REFERENCES public.cms_authors(id) ON DELETE SET NULL,
  reviewer_id           uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  featured_image_id     uuid REFERENCES public.cms_media_assets(id) ON DELETE SET NULL,
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
  og_image_id           uuid REFERENCES public.cms_media_assets(id) ON DELETE SET NULL,
  schema_type           text NOT NULL DEFAULT 'BlogPosting',
  primary_cta_label     text NOT NULL DEFAULT '',
  primary_cta_url       text NOT NULL DEFAULT '',
  primary_landing_page  text NOT NULL DEFAULT '',
  published_at          timestamptz,
  scheduled_at          timestamptz,
  reading_time          int NOT NULL DEFAULT 0,
  word_count            int NOT NULL DEFAULT 0,
  version               int NOT NULL DEFAULT 1,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  updated_by            uuid REFERENCES public.admin_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_articles_status ON public.cms_articles(status);
CREATE INDEX IF NOT EXISTS idx_cms_articles_slug ON public.cms_articles(slug);
CREATE INDEX IF NOT EXISTS idx_cms_articles_published_at ON public.cms_articles(published_at) WHERE status = 'PUBLISHED';
CREATE INDEX IF NOT EXISTS idx_cms_articles_scheduled_at ON public.cms_articles(scheduled_at) WHERE status = 'SCHEDULED';

CREATE TABLE IF NOT EXISTS public.cms_article_tags (
  article_id uuid NOT NULL REFERENCES public.cms_articles(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES public.cms_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.cms_article_revisions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      uuid NOT NULL REFERENCES public.cms_articles(id) ON DELETE CASCADE,
  version         int NOT NULL,
  snapshot_json   jsonb NOT NULL,
  change_summary  text NOT NULL DEFAULT '',
  created_by      uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, version)
);

CREATE TABLE IF NOT EXISTS public.cms_slug_redirects (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path      text NOT NULL UNIQUE,
  destination_path text NOT NULL,
  status_code      int NOT NULL DEFAULT 301,
  article_id       uuid REFERENCES public.cms_articles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cms_audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   text NOT NULL,
  metadata    jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_audit_entity ON public.cms_audit_logs(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS public.cms_migration_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_slug  text NOT NULL UNIQUE,
  article_id   uuid REFERENCES public.cms_articles(id) ON DELETE SET NULL,
  source_type  text NOT NULL,
  ran_at       timestamptz NOT NULL DEFAULT now()
);

-- Seed categories from existing blog topics
INSERT INTO public.cms_categories (name, slug, description) VALUES
  ('سئو', 'seo', 'مقالات سئو و بهینه‌سازی'),
  ('نرخ تبدیل', 'conversion', 'بهینه‌سازی نرخ تبدیل'),
  ('چت‌بات', 'chatbot', 'چت‌بات و پشتیبانی هوشمند'),
  ('طراحی سایت', 'web-design', 'طراحی و ساخت وب‌سایت'),
  ('راهکار صنفی', 'industry', 'راهکارهای تخصصی صنایع'),
  ('جذب شاگرد', 'tutoring', 'بازاریابی معلمان خصوصی')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_authors (display_name, slug, bio, job_title, active) VALUES
  ('تیم آرایه', 'araaye', 'تیم محتوا و سئو آرایه', 'آرایه', true)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.cms_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_article_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_slug_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_migration_runs ENABLE ROW LEVEL SECURITY;
