-- CMS AI usage logs and settings (phase 3)

CREATE TABLE IF NOT EXISTS public.cms_ai_usage_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      uuid REFERENCES public.cms_articles(id) ON DELETE SET NULL,
  user_id         uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_cms_ai_usage_user ON public.cms_ai_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_ai_usage_article ON public.cms_ai_usage_logs(article_id);

CREATE TABLE IF NOT EXISTS public.cms_settings (
  id         int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  updated_at timestamptz NOT NULL DEFAULT now(),
  data       jsonb NOT NULL DEFAULT '{}'
);

INSERT INTO public.cms_settings (id, data) VALUES (1, '{
  "ai_enabled": true,
  "research_mode": false,
  "daily_budget_usd": 5,
  "rate_limit_per_minute": 20,
  "max_tokens_per_action": 2000,
  "fallback_model": "economy",
  "logging_enabled": true,
  "prompt_version": "v1",
  "models": {
    "short": "economy",
    "long": "mid",
    "analysis": "mid"
  },
  "enabled_actions": [
    "content_brief", "outline", "search_intent", "seo_titles", "seo_descriptions",
    "continue_writing", "expand_text", "shorten_text", "rewrite_persian",
    "generate_excerpt", "generate_faq", "generate_cta", "seo_analysis", "alt_text"
  ]
}') ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.cms_ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;
