import { useCallback, useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, Mail, X, Save } from "lucide-react";
import pb from "../../lib/pocketbase";
import { logCreate, logUpdate, logDelete } from "../../lib/logger";
import { useTranslation } from "react-i18next";

/**
 * SSO 白名单管理页面
 * 管理允许通过 SSO 登录的邮箱地址
 */
export default function WhitelistPage() {
  const { t } = useTranslation("admin");
  const [whitelists, setWhitelists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    description: "",
  });
  const [toast, setToast] = useState(null);

  // 获取白名单列表
  const fetchWhitelists = useCallback(async () => {
    try {
      setLoading(true);

      // 检查用户是否已登录
      if (!pb.authStore.isValid) {
        throw new Error(t("whitelist.error.login"));
      }

      const result = await pb.collection("whitelists").getList(1, 100, {
        sort: "-created",
      });
      setWhitelists(result.items);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch whitelists:", error);
      console.error("Error details:", {
        status: error?.status,
        response: error?.response,
        data: error?.data,
        message: error?.message,
      });

      // 提供更详细的错误信息 - 支持 PocketBase 错误格式
      let errorMessage = t("whitelist.toast.fetchError");

      // PocketBase 错误 usually via status or response.data
      if (error?.status === 401 || error?.status === 403) {
        errorMessage = t("whitelist.error.permission");
      } else if (error?.status === 404) {
        errorMessage = t("whitelist.error.notFound");
      } else if (error?.response?.data?.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      } else if (error?.response?.message) {
        errorMessage = `Error: ${error.response.message}`;
      } else if (error?.data?.message) {
        errorMessage = `Error: ${error.data.message}`;
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchWhitelists();
  }, [fetchWhitelists]);

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

  // 打开新建表单
  const handleNew = () => {
    setEditingId(null);
    setFormData({ email: "", description: "" });
    setShowForm(true);
  };

  // 打开编辑表单
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      email: item.email,
      description: item.description || "",
    });
    setShowForm(true);
  };

  // 保存（新建或更新）
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // 更新
        await pb.collection("whitelists").update(editingId, formData);
        await logUpdate("白名单", `更新了白名单：${formData.email}`);
        setToast({ type: "success", message: t("whitelist.toast.updated") });
      } else {
        // 创建
        await pb.collection("whitelists").create(formData);
        await logCreate("白名单", `添加了白名单：${formData.email}`);
        setToast({ type: "success", message: t("whitelist.toast.added") });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ email: "", description: "" });
      await fetchWhitelists();
    } catch (error) {
      console.error("Failed to save whitelist:", error);
      const errorMsg =
        error?.response?.message || error?.message || t("whitelist.toast.saveError");
      setToast({ type: "error", message: errorMsg });
    }
  };

  // 删除白名单
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);

      // 先获取白名单信息用于日志记录
      let email = "Unknown";
      try {
        const item = await pb.collection("whitelists").getOne(id);
        email = item.email || "Unknown";
      } catch {
        console.warn("Failed to fetch whitelist info for log");
      }

      await pb.collection("whitelists").delete(id);

      // 记录删除日志
      await logDelete("Whitelist", `Removed whitelist: ${email}`);

      await fetchWhitelists();
      setDeleteConfirmId(null);
      setToast({ type: "success", message: t("whitelist.toast.deleted", { email }) });
    } catch (error) {
      console.error("Failed to delete whitelist:", error);
      setToast({ type: "error", message: t("whitelist.toast.deleteError") });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
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
            className="text-[11px] font-medium opacity-80 hover:opacity-100"
          >
            {t("whitelist.buttons.close")}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
              {t("whitelist.title")}
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              {t("whitelist.subtitle")}
            </p>
          </div>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--color-brand-blue)] text-xs md:text-sm font-semibold text-slate-950 shadow-[0_0_18px_rgba(142,209,252,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <Plus className="w-5 h-5" />
            {t("whitelist.buttons.add")}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs md:text-sm">
            <p className="font-semibold mb-1">Error</p>
            <p>{error}</p>
            <button
              onClick={fetchWhitelists}
              className="mt-2 text-sm underline hover:no-underline"
            >
              {t("whitelist.buttons.retry")}
            </button>
          </div>
        )}

        {/* 表单弹窗 */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingId ? t("whitelist.buttons.edit") : t("whitelist.buttons.add")}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ email: "", description: "" });
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("whitelist.form.email")} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40 focus:border-transparent"
                    placeholder="user@example.com"
                    required
                    disabled={!!editingId}
                  />
                  {editingId && (
                    <p className="mt-1 text-xs text-slate-500">
                      {t("whitelist.form.emailDisabled")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("whitelist.form.desc")}
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40 focus:border-transparent"
                    placeholder={t("whitelist.form.descPlaceholder")}
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ email: "", description: "" });
                    }}
                    className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                  >
                    {t("whitelist.buttons.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-blue)] hover:bg-sky-400 text-slate-950 rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? t("auditLogs.actions.update") : t("auditLogs.actions.create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 白名单列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t("auditLogs.loading", "Loading...")}</p>
            </div>
          ) : whitelists.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">{t("whitelist.empty.title")}</p>
              <p className="text-gray-400 text-sm mb-6">
                {t("whitelist.empty.desc")}
              </p>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t("whitelist.buttons.add")}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("whitelist.table.email")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("whitelist.table.desc")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("whitelist.table.time")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("whitelist.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {whitelists.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {item.description || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title={t("whitelist.buttons.edit")}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            disabled={deletingId === item.id}
                            title={t("whitelist.buttons.delete")}
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("whitelist.delete.title")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("whitelist.delete.desc")}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                {t("whitelist.buttons.cancel")}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingId === deleteConfirmId && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {t("whitelist.buttons.confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
