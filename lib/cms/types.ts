export type CmsArticleStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export const CMS_STATUSES: CmsArticleStatus[] = [
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHED',
  'ARCHIVED',
];

export type CmsArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_json: Record<string, unknown>;
  rendered_html: string | null;
  status: CmsArticleStatus;
  locale: string;
  category_id: string | null;
  author_id: string | null;
  reviewer_id: string | null;
  featured_image_id: string | null;
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: string;
  seo_title: string;
  seo_description: string;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  og_title: string;
  og_description: string;
  og_image_id: string | null;
  schema_type: string;
  primary_cta_label: string;
  primary_cta_url: string;
  primary_landing_page: string;
  published_at: string | null;
  scheduled_at: string | null;
  reading_time: number;
  word_count: number;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type CmsCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  seo_title: string;
  seo_description: string;
  hub_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CmsAuthorRow = {
  id: string;
  display_name: string;
  slug: string;
  bio: string;
  avatar_id: string | null;
  job_title: string;
  profile_url: string | null;
  social_urls: Record<string, string>;
  active: boolean;
  admin_user_id: string | null;
};

export type CmsTagRow = {
  id: string;
  name: string;
  slug: string;
};

export type CmsMediaRow = {
  id: string;
  url: string;
  storage_key: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  caption: string;
  uploaded_by: string | null;
  created_at: string;
};

export type CmsRevisionRow = {
  id: string;
  article_id: string;
  version: number;
  snapshot_json: Record<string, unknown>;
  change_summary: string;
  created_by: string | null;
  created_at: string;
};

export const EMPTY_DOC = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [] }],
};
