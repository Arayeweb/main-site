import {
  LegacyMigratedBlogArticlePage,
  legacyMigratedArticleMetadata,
} from "@/lib/blog/legacyMigratedArticles";
import { LEGACY_MIGRATED_ARTICLES } from "@/lib/blog/legacyArticleData";

const ARTICLE = LEGACY_MIGRATED_ARTICLES["website-speed-core-web-vitals"];

export const metadata = legacyMigratedArticleMetadata(ARTICLE);

export default function WebsiteSpeedCoreWebVitalsPage() {
  return <LegacyMigratedBlogArticlePage article={ARTICLE} />;
}
