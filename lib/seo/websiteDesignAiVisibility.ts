/**
 * Monthly AI visibility monitoring for the website-design cluster.
 * Track citation (not just retrieval) across ChatGPT, Perplexity, and Google AI Overviews.
 */

export type AiVisibilityPlatform = "google_ai_overview" | "chatgpt" | "perplexity";

export type AiVisibilityQuery = {
  id: string;
  query: string;
  intent: "definition" | "pricing" | "comparison" | "industry" | "howto";
  priorityPage: string;
};

/** Top 20 queries to check monthly for AI citation / recommendation. */
export const WEBSITE_DESIGN_AI_VISIBILITY_QUERIES: readonly AiVisibilityQuery[] = [
  {
    id: "q01",
    query: "طراحی سایت چیست",
    intent: "definition",
    priorityPage: "/website-design",
  },
  {
    id: "q02",
    query: "قیمت طراحی سایت",
    intent: "pricing",
    priorityPage: "/website-design/cost",
  },
  {
    id: "q03",
    query: "هزینه طراحی سایت در ایران",
    intent: "pricing",
    priorityPage: "/website-design/cost",
  },
  {
    id: "q04",
    query: "طراحی سایت ارزان و فوری",
    intent: "pricing",
    priorityPage: "/fastweb",
  },
  {
    id: "q05",
    query: "تفاوت سایت فوری و طراحی اختصاصی",
    intent: "comparison",
    priorityPage: "/website-design/cost",
  },
  {
    id: "q06",
    query: "طراحی سایت یا وردپرس",
    intent: "comparison",
    priorityPage: "/website-design",
  },
  {
    id: "q07",
    query: "بهترین شرکت طراحی سایت",
    intent: "comparison",
    priorityPage: "/website-design",
  },
  {
    id: "q08",
    query: "طراحی سایت کلینیک",
    intent: "industry",
    priorityPage: "/website/clinic",
  },
  {
    id: "q09",
    query: "طراحی سایت دندانپزشکی",
    intent: "industry",
    priorityPage: "/website/dentist",
  },
  {
    id: "q10",
    query: "طراحی سایت پزشکی",
    intent: "industry",
    priorityPage: "/doctors",
  },
  {
    id: "q11",
    query: "طراحی سایت رستوران",
    intent: "industry",
    priorityPage: "/website-design/restaurant",
  },
  {
    id: "q12",
    query: "طراحی سایت وکیل",
    intent: "industry",
    priorityPage: "/website/lawyer",
  },
  {
    id: "q13",
    query: "طراحی سایت کافه",
    intent: "industry",
    priorityPage: "/website/cafe",
  },
  {
    id: "q14",
    query: "طراحی سایت فروشگاه اینترنتی",
    intent: "industry",
    priorityPage: "/website/online-shop",
  },
  {
    id: "q15",
    query: "طراحی سایت مشاور املاک",
    intent: "industry",
    priorityPage: "/fastweb/real-estate",
  },
  {
    id: "q16",
    query: "سایت فوری آرایه",
    intent: "definition",
    priorityPage: "/fastweb",
  },
  {
    id: "q17",
    query: "چطور سایت کسب و کار بسازم",
    intent: "howto",
    priorityPage: "/blog/website-design-order-checklist",
  },
  {
    id: "q18",
    query: "تبدیل پیج اینستاگرام به سایت",
    intent: "howto",
    priorityPage: "/blog/instagram-page-to-website",
  },
  {
    id: "q19",
    query: "طراحی سایت برای کلینیک زیبایی",
    intent: "industry",
    priorityPage: "/website/beauty-clinic",
  },
  {
    id: "q20",
    query: "آرایه طراحی سایت",
    intent: "definition",
    priorityPage: "/website-design",
  },
] as const;

export type AiVisibilityRow = {
  queryId: string;
  query: string;
  checkedAt: string;
  platforms: Record<
    AiVisibilityPlatform,
    {
      overviewOrAnswer: boolean;
      araayeCited: boolean;
      araayeRecommended: boolean;
      competitorsCited: string[];
      citedUrl?: string;
      notes?: string;
    }
  >;
};

export function createEmptyAiVisibilityLog(checkedAt: string): AiVisibilityRow[] {
  return WEBSITE_DESIGN_AI_VISIBILITY_QUERIES.map((q) => ({
    queryId: q.id,
    query: q.query,
    checkedAt,
    platforms: {
      google_ai_overview: {
        overviewOrAnswer: false,
        araayeCited: false,
        araayeRecommended: false,
        competitorsCited: [],
      },
      chatgpt: {
        overviewOrAnswer: false,
        araayeCited: false,
        araayeRecommended: false,
        competitorsCited: [],
      },
      perplexity: {
        overviewOrAnswer: false,
        araayeCited: false,
        araayeRecommended: false,
        competitorsCited: [],
      },
    },
  }));
}

/** Markdown template for monthly DIY monitoring. */
export function buildAiVisibilityChecklistMarkdown(monthLabel: string): string {
  const header = [
    `# AI Visibility — طراحی سایت (${monthLabel})`,
    "",
    "برای هر کوئری در ChatGPT، Perplexity و Google AI Overview ثبت کنید:",
    "- آیا پاسخ/Overview وجود دارد؟",
    "- آیا آرایه cited شده؟ (لینک به دامنه araaye.com)",
    "- آیا آرایه recommended شده؟ (در shortlist پیشنهاد خرید)",
    "- رقبا چه کسانی cited شده‌اند؟",
    "",
    "| # | Query | G-Overview | ChatGPT | Perplexity | Araaye cited? | Competitors | Notes |",
    "|---|-------|------------|---------|------------|---------------|-------------|-------|",
  ];

  const rows = WEBSITE_DESIGN_AI_VISIBILITY_QUERIES.map(
    (q, i) =>
      `| ${i + 1} | ${q.query} |  |  |  |  |  | priority: ${q.priorityPage} |`,
  );

  return [...header, ...rows, "", `Total queries: ${WEBSITE_DESIGN_AI_VISIBILITY_QUERIES.length}`, ""].join(
    "\n",
  );
}
