import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Plus, Edit, Trash2, Loader2, FileText, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import pb from "../../lib/pocketbase";
import { getLocalizedContent } from "../../utils/postHelpers";
import { logDelete } from "../../lib/logger";

/**
 * 文章管理列表页面
 * 使用卡片视图展示文章列表
 */
export default function Posts() {
  const { adminKey } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // 获取文章列表
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const result = await pb.collection("posts").getList(1, 100, {
        sort: "-updated",
      });
      setPosts(result.items);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      alert("Error fetching posts: " + (error?.message || "unknown error"));
      setToast({
        type: "error",
        message: "获取文章列表失败，请稍后重试。",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      // 处理多语言标题（向后兼容）
      const title = typeof post.title === "string" 
        ? post.title 
        : (post.title?.zh || post.title?.en || post.title?.ja || "");
      const slug = post.slug || "";
      const category = post.category || "";
      return (
        title.toLowerCase().includes(q) ||
        slug.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q)
      );
    });
  }, [posts, search]);

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 删除文章
  const handleDelete = async (postId) => {
    try {
      console.log("Deleting post:", { postId });
      setDeletingId(postId);
      
      // 先获取文章信息用于日志记录
      let postTitle = "未知文章";
      try {
        const post = await pb.collection("posts").getOne(postId);
        if (post.title) {
          if (typeof post.title === "object") {
            postTitle = post.title.zh || post.title.en || post.title.ja || "未知文章";
          } else {
            postTitle = post.title;
          }
        }
      } catch (err) {
        console.warn("获取文章信息失败，将使用默认标题记录日志");
      }
      
      await pb.collection("posts").delete(postId);
      
      // 记录删除日志
      await logDelete("文章管理", `删除了文章《${postTitle}》`);
      
      await fetchPosts();
      setDeleteConfirmId(null);
      setToast({ type: "success", message: "文章已删除。" });
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Error deleting post: " + (error?.message || "unknown error"));
      setToast({
        type: "error",
        message: "删除文章失败，请稍后重试。",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // 分类颜色映射
  const getCategoryColor = (category) => {
    const colors = {
      公告: "bg-sky-100 text-sky-800",
      文档: "bg-emerald-100 text-emerald-800",
      更新日志: "bg-amber-100 text-amber-800",
    };
    return colors[category] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`rounded-2xl px-4 py-2.5 text-xs md:text-sm flex items-center justify-between gap-3 shadow-sm ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[11px] font-medium opacity-80 hover:opacity-100"
          >
            关闭
          </button>
        </div>
      )}

      {/* 头部：标题 + 搜索 + 新建 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            文章管理
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            管理公告、文档及更新日志内容。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索标题、分类或 slug..."
              className="w-full sm:w-60 rounded-full border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/30"
            />
          </div>
          <Link
            to={`/${adminKey}/webadmin/posts/new`}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-brand-blue)] px-4 py-1.5 text-xs md:text-sm font-semibold text-slate-950 shadow-[0_0_18px_rgba(142,209,252,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <Plus className="w-4 h-4" />
            新建文章
          </Link>
        </div>
      </div>

      {/* 列表内容 */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Loader2 className="w-7 h-7 animate-spin text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500">正在加载文章列表...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm flex flex-col items-center gap-3">
          <FileText className="w-12 h-12 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">
            {posts.length === 0 ? "当前还没有文章" : "没有符合搜索条件的文章"}
          </p>
          <p className="text-xs text-slate-500">
            {posts.length === 0
              ? "点击下面的按钮开始创建你的第一篇文章。"
              : "尝试调整关键词或清空搜索条件。"}
          </p>
          <Link
            to={`/${adminKey}/webadmin/posts/new`}
            className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-brand-blue)] px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-[0_0_18px_rgba(142,209,252,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <Plus className="w-4 h-4" />
            新建文章
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm flex flex-col gap-2 hover:border-[var(--color-brand-blue)]/70 hover:shadow-[0_10px_35px_rgba(15,23,42,0.14)] transition-all"
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <h2 className="text-sm md:text-base font-semibold text-slate-900 line-clamp-2">
                    {getLocalizedContent(post, "title", i18n.language) || "无标题"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {post.category ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${getCategoryColor(
                          post.category,
                        )}`}
                      >
                        {post.category}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                        未分类
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                        post.is_public
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {post.is_public ? "已发布" : "草稿"}
                    </span>
                    {post.slug && (
                      <span className="rounded-full bg-slate-50 px-2 py-0.5 font-mono text-[10px] text-slate-500 border border-slate-200">
                        {post.slug}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/${adminKey}/webadmin/posts/${post.id}`)
                    }
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-[var(--color-brand-blue)] hover:border-[var(--color-brand-blue)]/60 transition-colors"
                    title="编辑"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(post.id)}
                    disabled={deletingId === post.id}
                    className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    title="删除"
                  >
                    {deletingId === post.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </header>

              <p className="text-xs text-slate-500">
                最后更新：{formatDate(post.updated || post.created)}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* 删除确认弹窗 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">
              确认删除文章
            </h3>
            <p className="text-xs md:text-sm text-slate-600 mb-5">
              删除后该文章将无法恢复，且对应内容将不再对前台展示。确认要继续吗？
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {deletingId === deleteConfirmId && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
