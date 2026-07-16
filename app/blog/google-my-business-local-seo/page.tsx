import {
  LegacyMigratedBlogArticlePage,
  legacyMigratedArticleMetadata,
} from "@/lib/blog/legacyMigratedArticles";
import { LEGACY_MIGRATED_ARTICLES } from "@/lib/blog/legacyArticleData";

const ARTICLE = LEGACY_MIGRATED_ARTICLES["google-my-business-local-seo"];

export const metadata = legacyMigratedArticleMetadata(ARTICLE);

export default function GoogleMyBusinessLocalSeoPage() {
  return <LegacyMigratedBlogArticlePage article={ARTICLE} />;
}
