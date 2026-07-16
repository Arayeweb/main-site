import {
  LegacyMigratedBlogArticlePage,
  legacyMigratedArticleMetadata,
} from "@/lib/blog/legacyMigratedArticles";
import { LEGACY_MIGRATED_ARTICLES } from "@/lib/blog/legacyArticleData";

const ARTICLE = LEGACY_MIGRATED_ARTICLES["conversion-rate-optimization"];

export const metadata = legacyMigratedArticleMetadata(ARTICLE);

export default function ConversionRateOptimizationPage() {
  return <LegacyMigratedBlogArticlePage article={ARTICLE} />;
}
