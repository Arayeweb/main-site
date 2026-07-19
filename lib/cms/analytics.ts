'use client';

export function trackCmsEvent(
  event:
    | 'cms_article_created'
    | 'cms_article_saved'
    | 'cms_article_previewed'
    | 'cms_article_submitted'
    | 'cms_article_approved'
    | 'cms_article_published'
    | 'cms_article_scheduled'
    | 'cms_article_archived'
    | 'cms_ai_action_started'
    | 'cms_ai_action_accepted'
    | 'cms_ai_action_rejected'
    | 'cms_ai_action_failed'
    | 'cms_seo_issue_fixed'
    | 'cms_internal_link_accepted',
  payload: Record<string, string | number | boolean | undefined> = {}
) {
  if (typeof window === 'undefined') return;
  import('@/lib/gtm').then(({ pushGtmEvent }) => pushGtmEvent(event, payload));
}
