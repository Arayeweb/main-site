/** Priority landing pages for internal linking and cannibalization checks. */
export const INDEXABLE_LANDING_PAGES: { path: string; title: string; topic: string }[] = [
  { path: '/doctors', title: 'سایت پزشکان', topic: 'doctors website' },
  { path: '/doctors/cost', title: 'هزینه سایت پزشک', topic: 'doctor website cost' },
  { path: '/doctors/examples', title: 'نمونه سایت پزشک', topic: 'doctor website examples' },
  { path: '/doctors/dentist', title: 'سایت دندانپزشک', topic: 'dentist website' },
  { path: '/doctors/gynecologist', title: 'سایت متخصص زنان', topic: 'gynecologist website' },
  { path: '/website/clinic', title: 'سایت کلینیک', topic: 'clinic website' },
  { path: '/seo/doctor', title: 'سئو پزشک', topic: 'doctor seo' },
  { path: '/seo/clinic', title: 'سئو کلینیک', topic: 'clinic seo' },
  { path: '/ai', title: 'هوش مصنوعی آرایه', topic: 'ai platform' },
  { path: '/ai/compare', title: 'مقایسه مدل‌های AI', topic: 'ai compare' },
  { path: '/ai/pricing', title: 'قیمت AI', topic: 'ai pricing' },
  { path: '/prompts', title: 'پرامپت‌ها', topic: 'prompts' },
];

export type CannibalizationHit = {
  url: string;
  title: string;
  reason: string;
  similarity: number;
  sameIntent: boolean;
  suggestedAction: 'merge' | 'differentiate' | 'change_keyword' | 'canonical' | 'add_internal_link' | 'do_nothing';
};

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  return inter / (a.size + b.size - inter);
}

export function checkCannibalization(input: {
  primaryKeyword: string;
  title: string;
  slug: string;
  searchIntent: string;
  excludeArticleId?: string;
  articles: { id: string; title: string; slug: string; primary_keyword: string; search_intent: string }[];
}): CannibalizationHit[] {
  const hits: CannibalizationHit[] = [];
  const kwTokens = tokenize(input.primaryKeyword);
  const titleTokens = tokenize(input.title);

  for (const art of input.articles) {
    if (art.id === input.excludeArticleId) continue;
    const artKw = tokenize(art.primary_keyword);
    const artTitle = tokenize(art.title);
    const sim = Math.max(jaccard(kwTokens, artKw), jaccard(titleTokens, artTitle) * 0.8);
    if (sim < 0.35) continue;

    const sameIntent =
      !input.searchIntent ||
      !art.search_intent ||
      input.searchIntent.trim() === art.search_intent.trim();

    hits.push({
      url: `/blog/${art.slug}`,
      title: art.title,
      reason: `هم‌پوشانی کلمه/عنوان با «${art.title}»`,
      similarity: Math.round(sim * 100) / 100,
      sameIntent,
      suggestedAction: sameIntent ? 'differentiate' : 'add_internal_link',
    });
  }

  for (const page of INDEXABLE_LANDING_PAGES) {
    const pageTokens = tokenize(`${page.title} ${page.topic}`);
    const sim = jaccard(kwTokens, pageTokens);
    if (sim < 0.4) continue;
    hits.push({
      url: page.path,
      title: page.title,
      reason: `هم‌پوشانی با لندینگ «${page.title}»`,
      similarity: Math.round(sim * 100) / 100,
      sameIntent: false,
      suggestedAction: 'add_internal_link',
    });
  }

  return hits.sort((a, b) => b.similarity - a.similarity).slice(0, 8);
}
