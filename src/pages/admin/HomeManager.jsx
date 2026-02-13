import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, Edit, Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import pb from "../../lib/pocketbase";
import { useTranslation } from "react-i18next";
import { createAppLogger } from "../../lib/appLogger";

/**
 * 首页分段管理页面
 * 列表展示当前的 Sections，支持新建、编辑、删除和排序
 */
const logger = createAppLogger("HomeManager");

export default function HomeManager() {
  const { t, i18n } = useTranslation();
  const { adminKey } = useParams();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState({});

  // 获取分段列表
  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const result = await pb.collection("cms_sections").getList(1, 100, {
        sort: "sort_order",
      });
      setSections(result.items);
    } catch (error) {
      logger.error("Failed to fetch sections:", error);
      setToast({
        type: "error",
        message: t("admin.homeManager.toast.fetchError"),
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // 删除分段
  const handleDelete = async (sectionId) => {
    try {
      setDeletingId(sectionId);
      await pb.collection("cms_sections").delete(sectionId);
      await fetchSections();
      setDeleteConfirmId(null);
      setToast({ type: "success", message: t("admin.homeManager.toast.deleteSuccess") });
    } catch (error) {
      logger.error("Failed to delete section:", error);
      setToast({
        type: "error",
        message: t("admin.homeManager.toast.deleteError"),
      });
    } finally {
      setDeletingId(null);
    }
  };

  // 调整排序
  const handleMoveOrder = async (sectionId, direction) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const currentIndex = sections.findIndex((s) => s.id === sectionId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= sections.length) return;

    const targetSection = sections[newIndex];
    const newOrder = section.sort_order;
    const targetOrder = targetSection.sort_order;

    try {
      setUpdatingOrder({ [sectionId]: true });
      // 交换排序值
      await pb.collection("cms_sections").update(sectionId, {
        sort_order: targetOrder,
      });
      await pb.collection("cms_sections").update(targetSection.id, {
        sort_order: newOrder,
      });
      await fetchSections();
      setToast({ type: "success", message: t("admin.homeManager.toast.orderSuccess") });
    } catch (error) {
      logger.error("Failed to update order:", error);
      setToast({
        type: "error",
        message: t("admin.homeManager.toast.orderError"),
      });
    } finally {
      setUpdatingOrder({});
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language === 'zh' ? "zh-CN" : (i18n.language === 'ja' ? "ja-JP" : "en-US"), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 获取多语言标题（用于显示）
  const getDisplayTitle = (section) => {
    if (!section.title) return t("admin.homeManager.card.unnamed");
    if (typeof section.title === "string") return section.title;
    return section.title[i18n.language] || section.title.zh || section.title.en || section.title.ja || t("admin.homeManager.card.unnamed");
  };

  // 获取多语言副标题
  const getDisplaySubtitle = (section) => {
    if (!section.subtitle) return "";
    if (typeof section.subtitle === "string") return section.subtitle;
    return section.subtitle[i18n.language] || section.subtitle.zh || section.subtitle.en || section.subtitle.ja || "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast 提示 */}
      {toast && (
        <div
          className={`rounded-2xl px-4 py-2.5 text-xs md:text-sm flex items-center justify-between gap-3 shadow-sm ${toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
            }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>
      )}

      {/* 页面标题和新建按钮 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t("admin.homeManager.title")}</h1>
        <Link
          to={`/${adminKey}/webadmin/home/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("admin.homeManager.new")}
        </Link>
      </div>

      {/* 分段列表 */}
      {sections.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>{t("admin.homeManager.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-slate-500">
                      {t("admin.homeManager.card.sort")}: {section.sort_order}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {getDisplayTitle(section)}
                    </h3>
                  </div>
                  {section.subtitle && (
                    <p className="text-sm text-slate-600 mb-3">
                      {getDisplaySubtitle(section)}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{t("admin.homeManager.card.buttons")}: {section.buttons?.length || 0}</span>
                    <span>{t("admin.homeManager.card.updated")}: {formatDate(section.updated)}</span>
                    {section.background && (
                      <span className="text-emerald-600">{t("admin.homeManager.card.bgSet")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {/* 排序按钮 */}
                  <button
                    onClick={() => handleMoveOrder(section.id, "up")}
                    disabled={index === 0 || updatingOrder[section.id]}
                    className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t("admin.homeManager.actions.up")}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(section.id, "down")}
                    disabled={index === sections.length - 1 || updatingOrder[section.id]}
                    className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t("admin.homeManager.actions.down")}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  {/* 编辑按钮 */}
                  <Link
                    to={`/${adminKey}/webadmin/home/${section.id}`}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t("admin.homeManager.actions.edit")}
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  {/* 删除按钮 */}
                  {deleteConfirmId === section.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(section.id)}
                        disabled={deletingId === section.id}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === section.id ? (
                          <Loader2 className="w-3 h-3 animate-spin inline" />
                        ) : (
                          t("admin.homeManager.actions.confirm")
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                      >
                        {t("admin.homeManager.actions.cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(section.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title={t("admin.homeManager.actions.delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
