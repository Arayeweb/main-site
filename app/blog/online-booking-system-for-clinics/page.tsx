import SeoBlogArticlePage, {
  seoBlogArticleMetadata,
} from "@/components/blog/SeoBlogArticlePage";
import { ONLINE_BOOKING_ARTICLE } from "@/lib/blog/articles/onlineBookingArticle";

export const metadata = seoBlogArticleMetadata(ONLINE_BOOKING_ARTICLE);

export default function OnlineBookingSystemForClinicsPage() {
  return <SeoBlogArticlePage article={ONLINE_BOOKING_ARTICLE} />;
}
