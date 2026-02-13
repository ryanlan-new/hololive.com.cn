import { FileText } from "lucide-react";
import PostCategoryListPage from "../components/docs/PostCategoryListPage";
import { POST_CATEGORIES } from "../constants/postCategories";

export default function OtherDocuments() {
  return (
    <PostCategoryListPage
      category={POST_CATEGORIES.DOCUMENT}
      icon={FileText}
      iconClassName="text-yellow-500"
      titleKey="cards.documents.title"
      descriptionKey="cards.documents.description"
      emptyKey="otherDocuments.empty"
      loadErrorKey="otherDocuments.loadError"
      loggerScope="OtherDocuments"
    />
  );
}
