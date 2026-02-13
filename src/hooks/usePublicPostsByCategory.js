import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import pb from "../lib/pocketbase";
import { createAppLogger } from "../lib/appLogger";

export function usePublicPostsByCategory({
  category,
  loadErrorKey,
  loggerScope = "usePublicPostsByCategory",
}) {
  const { t } = useTranslation("docs");
  const logger = useMemo(() => createAppLogger(loggerScope), [loggerScope]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const result = await pb.collection("posts").getList(1, 100, {
          filter: `category = "${category}" && is_public = true`,
          sort: "-is_pinned,-created",
          expand: "cover_ref",
        });

        setPosts(result.items);
        setError(null);
      } catch (fetchError) {
        logger.error(`Failed to fetch posts for category: ${category}`, fetchError);
        setError(t(loadErrorKey));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, loadErrorKey, logger, t]);

  return {
    posts,
    loading,
    error,
  };
}
