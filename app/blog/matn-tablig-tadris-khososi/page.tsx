import {
  ModaresBlogArticlePage,
  modaresArticleMetadata,
} from "@/lib/blog/modaresArticles";
import { MATN_TABLIG_ARTICLE } from "@/lib/blog/modaresArticleData";

export const metadata = modaresArticleMetadata(MATN_TABLIG_ARTICLE);

export default function MatnTabligTadrisPage() {
  return <ModaresBlogArticlePage article={MATN_TABLIG_ARTICLE} />;
}
