import {
  LegacyMigratedBlogArticlePage,
  legacyMigratedArticleMetadata,
} from "@/lib/blog/legacyMigratedArticles";
import { LEGACY_MIGRATED_ARTICLES } from "@/lib/blog/legacyArticleData";

const ARTICLE = LEGACY_MIGRATED_ARTICLES["online-booking-system-for-clinics"];

export const metadata = legacyMigratedArticleMetadata(ARTICLE);

export default function OnlineBookingSystemForClinicsPage() {
  return <LegacyMigratedBlogArticlePage article={ARTICLE} />;
}
