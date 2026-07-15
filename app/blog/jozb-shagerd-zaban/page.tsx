import {
  ModaresBlogArticlePage,
  modaresArticleMetadata,
} from "@/lib/blog/modaresArticles";
import { JOZB_SHAGERD_ZABAN_ARTICLE } from "@/lib/blog/modaresArticleData";

export const metadata = modaresArticleMetadata(JOZB_SHAGERD_ZABAN_ARTICLE);

export default function JozbShagerdZabanPage() {
  return <ModaresBlogArticlePage article={JOZB_SHAGERD_ZABAN_ARTICLE} />;
}
