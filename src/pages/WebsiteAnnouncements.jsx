import { Megaphone } from "lucide-react";
import PostCategoryListPage from "../components/docs/PostCategoryListPage";
import { POST_CATEGORIES } from "../constants/postCategories";

export default function WebsiteAnnouncements() {
  return (
    <PostCategoryListPage
      category={POST_CATEGORIES.ANNOUNCEMENT}
      icon={Megaphone}
      iconClassName="text-blue-500"
      titleKey="cards.announcements.title"
      descriptionKey="cards.announcements.description"
      emptyKey="websiteAnnouncements.empty"
      loadErrorKey="websiteAnnouncements.loadError"
      loggerScope="WebsiteAnnouncements"
    />
  );
}
