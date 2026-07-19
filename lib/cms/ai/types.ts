export type CmsAiAction =
  | 'content_brief'
  | 'outline'
  | 'search_intent'
  | 'audience'
  | 'secondary_keywords'
  | 'user_questions'
  | 'continue_writing'
  | 'expand_text'
  | 'shorten_text'
  | 'simplify_text'
  | 'rewrite_persian'
  | 'generate_excerpt'
  | 'generate_faq'
  | 'generate_cta'
  | 'seo_titles'
  | 'seo_descriptions'
  | 'seo_analysis'
  | 'heading_analysis'
  | 'alt_text'
  | 'seo_polish_inline'
  | 'araaye_voice';

/** Actions shown in the inline bubble menu (Notion-style) */
export type CmsInlineAiAction =
  | 'rewrite_persian'
  | 'continue_writing'
  | 'shorten_text'
  | 'expand_text'
  | 'seo_polish_inline'
  | 'araaye_voice';

export const INLINE_AI_ACTIONS: { id: CmsInlineAiAction; label: string }[] = [
  { id: 'rewrite_persian', label: 'بهبود نوشتار' },
  { id: 'continue_writing', label: 'ادامه بده' },
  { id: 'shorten_text', label: 'کوتاه‌تر' },
  { id: 'expand_text', label: 'گسترش' },
  { id: 'seo_polish_inline', label: 'سئو کن' },
  { id: 'araaye_voice', label: 'لحن آرایه' },
];

export type CmsAiMode = 'selection' | 'section' | 'article' | 'brief';

export type CmsAiSettings = {
  ai_enabled: boolean;
  research_mode: boolean;
  daily_budget_usd: number;
  rate_limit_per_minute: number;
  max_tokens_per_action: number;
  fallback_model: string;
  logging_enabled: boolean;
  prompt_version: string;
  models: { short: string; long: string; analysis: string };
  enabled_actions: CmsAiAction[];
};

export const DEFAULT_CMS_AI_SETTINGS: CmsAiSettings = {
  ai_enabled: true,
  research_mode: false,
  daily_budget_usd: 5,
  rate_limit_per_minute: 20,
  max_tokens_per_action: 2000,
  fallback_model: 'economy',
  logging_enabled: true,
  prompt_version: 'v1',
  models: { short: 'economy', long: 'mid', analysis: 'mid' },
  enabled_actions: [
    'content_brief',
    'outline',
    'search_intent',
    'seo_titles',
    'seo_descriptions',
    'continue_writing',
    'expand_text',
    'shorten_text',
    'rewrite_persian',
    'generate_excerpt',
    'generate_faq',
    'generate_cta',
    'seo_analysis',
    'alt_text',
    'seo_polish_inline',
    'araaye_voice',
  ],
};

export const SHORT_ACTIONS = new Set<CmsAiAction>([
  'seo_titles',
  'seo_descriptions',
  'alt_text',
  'shorten_text',
  'search_intent',
  'secondary_keywords',
]);

export const ANALYSIS_ACTIONS = new Set<CmsAiAction>([
  'content_brief',
  'seo_analysis',
  'heading_analysis',
  'outline',
]);
