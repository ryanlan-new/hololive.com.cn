import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Bell,
  X,
  Save,
  Eye,
  Calendar,
  Clock,
} from "lucide-react";
import pb from "../../lib/pocketbase";

/**
 * 公告管理页面
 * 管理网站横幅公告
 */
export default function AnnouncementPage() {
  const { adminKey } = useParams();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    content: { zh: "", en: "", ja: "" },
    link: "",
    is_active: false,
    start_time: "",
    end_time: "",
    type: "info",
  });
  const [toast, setToast] = useState(null);

  // 获取公告列表
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const result = await pb.collection("announcements").getList(1, 100, {
        sort: "-created",
      });
      setAnnouncements(result.items);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      const detail =
        error?.response?.data ||
        error?.data ||
        error?.response ||
        error?.message ||
        error;
      alert("Error fetching announcements: " + JSON.stringify(detail));
      setToast({
        type: "error",
        message: "获取公告列表失败，请稍后重试。",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // 格式化日期时间
  const formatDateTime = (dateString) => {
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
    setFormData({
      content: { zh: "", en: "", ja: "" },
      link: "",
      is_active: false,
      start_time: "",
      end_time: "",
      type: "info",
    });
    setShowForm(true);
  };

  // 打开编辑表单
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      content: item.content || { zh: "", en: "", ja: "" },
      link: item.link || "",
      is_active: item.is_active || false,
      start_time: item.start_time
        ? new Date(item.start_time).toISOString().slice(0, 16)
        : "",
      end_time: item.end_time
        ? new Date(item.end_time).toISOString().slice(0, 16)
        : "",
      type: item.type || "info",
    });
    setShowForm(true);
  };

  // 切换公告状态
  const handleToggleActive = async (id, currentStatus) => {
    try {
      console.log("Toggling announcement active:", {
        id,
        currentStatus,
        nextStatus: !currentStatus,
      });
      await pb.collection("announcements").update(id, {
        is_active: !currentStatus,
      });
      await fetchAnnouncements();
    } catch (error) {
      console.error("Failed to toggle announcement:", error);
      const detail =
        error?.response?.data ||
        error?.data ||
        error?.response ||
        error?.message ||
        error;
      alert(
        "Error updating announcement status: " + JSON.stringify(detail),
      );
    }
  };

  // 保存（新建或更新）
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const saveData = {
        content: formData.content,
        link: formData.link.trim() || "",
        is_active: formData.is_active,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        type: formData.type || "info",
      };

      console.log("Submitting announcement data:", {
        editingId,
        saveData,
      });

      let saved;
      if (editingId) {
        saved = await pb.collection("announcements").update(editingId, saveData);
        setToast({ type: "success", message: "公告已更新。" });
      } else {
        saved = await pb.collection("announcements").create(saveData);
        setToast({ type: "success", message: "公告已创建。" });
      }

      // 本地更新列表，避免依赖立即重新请求列表导致的瞬时错误
      setAnnouncements((prev) => {
        if (!prev || prev.length === 0) {
          return [saved];
        }
        if (editingId) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        // 新建时插入到列表头部
        return [saved, ...prev];
      });

      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save announcement:", error);
      const detail =
        error?.response?.data ||
        error?.data ||
        error?.response ||
        error?.message ||
        error;
      const errorMsg =
        error?.response?.message || error?.message || "保存失败，请重试";
      setToast({ type: "error", message: errorMsg });
      alert("Error saving announcement: " + JSON.stringify(detail));
    }
  };

  // 删除公告
  const handleDelete = async (id) => {
    try {
      console.log("Deleting announcement:", { id });
      setDeletingId(id);
      await pb.collection("announcements").delete(id);
      await fetchAnnouncements();
      setDeleteConfirmId(null);
      setToast({ type: "success", message: "公告已删除。" });
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      setToast({ type: "error", message: "删除失败，请重试。" });
      alert("Error deleting announcement: " + (error?.message || "unknown error"));
    } finally {
      setDeletingId(null);
    }
  };

  // 预览文本（根据当前语言显示）
  const getPreviewText = () => {
    const lang = "zh"; // 默认使用中文预览
    return (
      formData.content[lang] ||
      formData.content.en ||
      formData.content.zh ||
      "（预览内容）"
    );
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

      <div className="space-y-4">
        {/* 页面头部 */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
              公告管理
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              管理站点顶部的全局横幅公告，支持多语言与时间范围。
            </p>
          </div>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-blue)] px-4 py-1.5 text-xs md:text-sm font-semibold text-slate-950 shadow-[0_0_18px_rgba(142,209,252,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <Plus className="w-4 h-4" />
            新建公告
          </button>
        </div>

        {/* 表单弹窗 */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-3xl w-full mx-4 my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingId ? "编辑公告" : "新建公告"}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* 多语言输入 */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-800">
                    多语言内容 *
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        中文内容 (ZH) *
                      </label>
                      <input
                        type="text"
                        value={formData.content.zh || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            content: {
                              ...formData.content,
                              zh: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40 focus:border-transparent bg-slate-50"
                        placeholder="输入中文公告内容"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        英文内容 (EN)
                      </label>
                      <input
                        type="text"
                        value={formData.content.en || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            content: {
                              ...formData.content,
                              en: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40 focus:border-transparent bg-white"
                        placeholder="Enter English announcement content"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        日文内容 (JA)
                      </label>
                      <input
                        type="text"
                        value={formData.content.ja || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            content: {
                              ...formData.content,
                              ja: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40 focus:border-transparent bg-white"
                        placeholder="日本語のアナウンス内容を入力"
                      />
                    </div>
                  </div>
                </div>

                {/* 链接 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    跳转链接（可选）
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                {/* 公告类型 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    公告类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40 focus:border-transparent bg-white"
                  >
                    <option value="info">普通 (蓝色)</option>
                    <option value="urgent">紧急 (红色)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    选择公告的显示颜色：普通公告显示蓝色，紧急公告显示红色
                  </p>
                </div>

                {/* 时间范围 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1 text-slate-500" />
                      开始时间（可选）
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1 text-slate-500" />
                      结束时间（可选）
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 预览 */}
                <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-sky-600" />
                    <span className="text-sm font-semibold text-sky-900">
                      预览
                    </span>
                  </div>
                  <p className="text-sm text-sky-800">{getPreviewText()}</p>
                  {formData.link && (
                    <p className="text-xs text-sky-700 mt-1">
                      (查看详情) →
                    </p>
                  )}
                </div>

                {/* 启用状态 */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-slate-700">
                    启用此公告
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-blue)] hover:bg-sky-400 text-slate-950 rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? "更新" : "创建"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 公告列表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">暂无公告</p>
              <p className="text-gray-400 text-sm mb-6">
                创建公告以在网站顶部显示横幅
              </p>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                新建公告
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      内容预览
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      链接
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      时间范围
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {announcements.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                          {item.content?.zh ||
                            item.content?.en ||
                            item.content?.ja ||
                            "无内容"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate max-w-xs block"
                          >
                            {item.link}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {item.start_time ? (
                            <div>{formatDateTime(item.start_time)}</div>
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                          {item.end_time && (
                            <div className="text-xs">
                              至 {formatDateTime(item.end_time)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleToggleActive(item.id, item.is_active)
                          }
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                            item.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {item.is_active ? "已启用" : "已禁用"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            disabled={deletingId === item.id}
                            title="删除"
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
              确认删除
            </h3>
            <p className="text-gray-600 mb-6">
              您确定要删除这个公告吗？此操作不可撤销。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingId === deleteConfirmId && (
                  <Loader2 className="w-4 h-4 animate-spin" />
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

