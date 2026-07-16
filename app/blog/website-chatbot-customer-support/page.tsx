import {
  LegacyMigratedBlogArticlePage,
  legacyMigratedArticleMetadata,
} from "@/lib/blog/legacyMigratedArticles";
import { LEGACY_MIGRATED_ARTICLES } from "@/lib/blog/legacyArticleData";

const ARTICLE = LEGACY_MIGRATED_ARTICLES["website-chatbot-customer-support"];

export const metadata = legacyMigratedArticleMetadata(ARTICLE);

export default function WebsiteChatbotCustomerSupportPage() {
  return <LegacyMigratedBlogArticlePage article={ARTICLE} />;
}
