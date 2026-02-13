import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import parse from "html-react-parser";
import pb from "../lib/pocketbase";
import { getLocalizedContent } from "../utils/postHelpers";
import { createAppLogger } from "../lib/appLogger";
import { formatLocalizedDate } from "../utils/localeFormat";
import { POST_CATEGORIES } from "../constants/postCategories";

const logger = createAppLogger("ArticleDetail");

const sanitizeRichText = (html) => {
  if (!html || typeof window === "undefined") return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc
    .querySelectorAll("script, style, iframe, object, embed, link, meta")
    .forEach((node) => node.remove());

  doc.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value || "";

      if (name.startsWith("on") || name === "style") {
        element.removeAttribute(attribute.name);
        return;
      }

      if (
        (name === "href" || name === "src") &&
        /^\s*javascript:/i.test(value)
      ) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return doc.body.innerHTML;
};

export default function ArticleDetail() {
  const { id } = useParams();
  const { i18n, t } = useTranslation("docs");
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = import.meta.env.VITE_POCKETBASE_URL?.replace(/\/$/, "") || "";

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const result = await pb.collection("posts").getOne(id, {
          expand: "cover_ref",
        });
        setPost(result);
        setError(null);
      } catch (err) {
        logger.error("Failed to fetch article:", err);
        setError(t("articleDetail.loadError"));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, t]);

  // Determine back link based on category
  const getBackLink = () => {
    if (!post) return "/docs";
    if (post.category === POST_CATEGORIES.ANNOUNCEMENT) return "/docs/announcements";
    if (post.category === POST_CATEGORIES.DOCUMENT) return "/docs/documents";
    return "/docs";
  };

  // Get cover image URL
  const getCoverUrl = () => {
    if (post?.expand?.cover_ref?.file) {
      return `${baseUrl}/api/files/media/${post.expand.cover_ref.id}/${post.expand.cover_ref.file}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full pt-20 pb-10 flex flex-col items-center bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
            <p className="text-slate-600">{t("common.loading")}</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : !post ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <p className="text-slate-900">{t("articleDetail.notFound")}</p>
            <Link
              to="/docs"
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={16} />
              {t("common.backToDocs")}
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Link
                to={getBackLink()}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>{t("articleDetail.back")}</span>
              </Link>
            </motion.div>

            {/* Article Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
            >
              {/* Cover Image */}
              {getCoverUrl() && (
                <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  <img
                    src={getCoverUrl()}
                    alt={getLocalizedContent(post, "title", i18n.language)}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Header */}
              <header className="p-6 md:p-8 border-b border-slate-200">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                  {getLocalizedContent(post, "title", i18n.language)}
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} />
                  <span>
                    {t("articleDetail.updatedAt", {
                      date: formatLocalizedDate(post.updated, i18n.language),
                    })}
                  </span>
                </div>
              </header>

              {/* Article Body */}
              <div className="p-6 md:p-8">
                <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:w-full prose-img:max-w-full prose-blockquote:border-l-slate-300 prose-blockquote:text-slate-700 prose-strong:text-slate-900">
                  {parse(
                    sanitizeRichText(
                      getLocalizedContent(post, "content", i18n.language) || ""
                    )
                  )}
                </div>
              </div>
            </motion.article>
          </>
        )}
      </main>
    </div>
  );
}
