import {
  ModaresBlogArticlePage,
  modaresArticleMetadata,
} from "@/lib/blog/modaresArticles";
import { JOZB_SHAGERD_ARTICLE } from "@/lib/blog/modaresArticleData";

export const metadata = modaresArticleMetadata(JOZB_SHAGERD_ARTICLE);

export default function JozbShagerdKhososiPage() {
  return <ModaresBlogArticlePage article={JOZB_SHAGERD_ARTICLE} />;
}
