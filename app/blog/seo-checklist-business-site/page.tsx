import {
  LegacyMigratedBlogArticlePage,
  legacyMigratedArticleMetadata,
} from "@/lib/blog/legacyMigratedArticles";
import { LEGACY_MIGRATED_ARTICLES } from "@/lib/blog/legacyArticleData";

const ARTICLE = LEGACY_MIGRATED_ARTICLES["seo-checklist-business-site"];

export const metadata = legacyMigratedArticleMetadata(ARTICLE);

export default function SeoChecklistBusinessSitePage() {
  return <LegacyMigratedBlogArticlePage article={ARTICLE} />;
}
