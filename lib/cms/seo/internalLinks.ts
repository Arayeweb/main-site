import { INDEXABLE_LANDING_PAGES } from './cannibalization';

export type InternalLinkSuggestion = {
  sourceSection: string;
  destinationUrl: string;
  suggestedAnchor: string;
  reason: string;
  destinationType: 'blog' | 'landing' | 'product';
  confidence: number;
};

const KEYWORD_MAP: { keywords: string[]; url: string; anchor: string; type: InternalLinkSuggestion['destinationType'] }[] = [
  { keywords: ['پزشک', 'دکتر', 'کلینیک', 'بیمار'], url: '/doctors', anchor: 'سایت پزشکان', type: 'landing' },
  { keywords: ['هزینه', 'قیمت', 'تعرفه'], url: '/doctors/cost', anchor: 'هزینه سایت پزشک', type: 'landing' },
  { keywords: ['نمونه', 'مثال', 'نمونه کار'], url: '/doctors/examples', anchor: 'نمونه سایت پزشک', type: 'landing' },
  { keywords: ['دندان', 'دندانپزشک'], url: '/doctors/dentist', anchor: 'سایت دندانپزشک', type: 'landing' },
  { keywords: ['زنان', 'زایمان', 'ناباروری'], url: '/doctors/gynecologist', anchor: 'سایت متخصص زنان', type: 'landing' },
  { keywords: ['سئو', 'گوگل', 'رتبه'], url: '/seo/doctor', anchor: 'سئو سایت پزشک', type: 'landing' },
  { keywords: ['هوش مصنوعی', 'چت‌بات', 'chatgpt', 'کلود'], url: '/ai', anchor: 'پلتفرم هوش مصنوعی آرایه', type: 'product' },
  { keywords: ['مقایسه مدل', 'جمینی', 'deepseek'], url: '/ai/compare', anchor: 'مقایسه مدل‌های AI', type: 'product' },
  { keywords: ['پرامپت', 'prompt'], url: '/prompts', anchor: 'کتابخانه پرامپت', type: 'product' },
];

export function suggestInternalLinks(input: {
  articleText: string;
  headings: string[];
  publishedArticles: { slug: string; title: string; primary_keyword: string }[];
}): InternalLinkSuggestion[] {
  const suggestions: InternalLinkSuggestion[] = [];
  const textLower = input.articleText.toLowerCase();

  for (const map of KEYWORD_MAP) {
    const hit = map.keywords.find((k) => textLower.includes(k.toLowerCase()));
    if (!hit) continue;
    suggestions.push({
      sourceSection: input.headings[0] ?? 'بدنه مقاله',
      destinationUrl: map.url,
      suggestedAnchor: map.anchor,
      reason: `کلمه «${hit}» در متن دیده شد`,
      destinationType: map.type,
      confidence: 0.75,
    });
  }

  for (const art of input.publishedArticles.slice(0, 20)) {
    const kw = art.primary_keyword?.trim();
    if (!kw || kw.length < 3) continue;
    if (!textLower.includes(kw.toLowerCase().slice(0, Math.min(kw.length, 8)))) continue;
    suggestions.push({
      sourceSection: 'بدنه مقاله',
      destinationUrl: `/blog/${art.slug}`,
      suggestedAnchor: art.title.slice(0, 40),
      reason: `مرتبط با کلمه «${kw}»`,
      destinationType: 'blog',
      confidence: 0.6,
    });
  }

  const seen = new Set<string>();
  return suggestions
    .filter((s) => {
      const key = `${s.destinationUrl}:${s.suggestedAnchor}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}

export function listIndexableTargets() {
  return INDEXABLE_LANDING_PAGES;
}
