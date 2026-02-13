import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ArrowLeft, Loader2, Calendar, Image as ImageIcon, Pin } from "lucide-react";
import { useTranslation } from "react-i18next";
import pb from "../lib/pocketbase";
import { getLocalizedContent } from "../utils/postHelpers";
import { createAppLogger } from "../lib/appLogger";

const logger = createAppLogger("OtherDocuments");

export default function OtherDocuments() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = import.meta.env.VITE_POCKETBASE_URL?.replace(/\/$/, "") || "";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // Fetch posts with category "文档" and is_public = true, expand cover_ref
        // Sort by pinned first, then by created date (newest first)
        const result = await pb.collection("posts").getList(1, 100, {
          filter: 'category = "文档" && is_public = true',
          sort: "-is_pinned,-created",
          expand: "cover_ref",
        });
        setPosts(result.items);
        setError(null);
      } catch (err) {
        logger.error("Failed to fetch documents:", err);
        setError("加载文档失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen w-full pt-20 pb-10 flex flex-col items-center bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回文档中心</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <FileText size={32} className="text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
              其他文档
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            浏览其他相关文档
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
            <p className="text-slate-600">加载中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <FileText size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-900">暂无文档</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => {
              // Get cover image URL
              let coverUrl = null;
              if (post.expand?.cover_ref?.file) {
                coverUrl = `${baseUrl}/api/files/media/${post.expand.cover_ref.id}/${post.expand.cover_ref.file}`;
              }

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => navigate(`/docs/article/${post.id}`)}
                  className="bg-white rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden w-full"
                >
                  {/* Wide Horizontal Card Layout */}
                  <div className="flex flex-col md:flex-row">
                    {/* Cover Image - Mobile: Top, Desktop: Left (w-1/3) */}
                    <div className="relative w-full md:w-1/3 h-48 md:h-auto bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex-shrink-0">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={getLocalizedContent(post, "title", i18n.language)}
                          className="w-full h-full object-cover"
                          style={{ aspectRatio: "16/9" }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                          <ImageIcon className="w-16 h-16 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Card Content - Mobile: Bottom, Desktop: Right (w-2/3) */}
                    <div className="w-full md:w-2/3 p-5 md:p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                            {getLocalizedContent(post, "title", i18n.language)}
                          </h2>
                          {post.is_pinned && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              <Pin size={12} className="fill-current" />
                              置顶
                            </span>
                          )}
                        </div>
                        {getLocalizedContent(post, "summary", i18n.language) && (
                          <p className="text-sm md:text-base text-slate-600 line-clamp-2 mb-4">
                            {getLocalizedContent(post, "summary", i18n.language)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 pt-3 border-t border-slate-100">
                        <Calendar size={14} />
                        <span>{formatDate(post.updated)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
