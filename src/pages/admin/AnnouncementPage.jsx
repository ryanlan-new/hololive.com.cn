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
import { useTranslation } from "react-i18next";

/**
 * Announcement Management Page
 * Manage site-wide banner announcements
 */
export default function AnnouncementPage() {
  const { adminKey } = useParams();
  const { t, i18n } = useTranslation();
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

  // Fetch announcements
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
      // alert("Error fetching announcements: " + JSON.stringify(detail));
      setToast({
        type: "error",
        message: t("admin.announcements.toast.deleteError"), // Reuse error message or add generic fetch error later
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Open new form
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

  // Open edit form
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

  // Toggle active status
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

  // Save (Create or Update)
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
        setToast({ type: "success", message: t("admin.announcements.toast.updateSuccess") });
      } else {
        saved = await pb.collection("announcements").create(saveData);
        setToast({ type: "success", message: t("admin.announcements.toast.createSuccess") });
      }

      // Local update to avoid immediate refetch issues
      setAnnouncements((prev) => {
        if (!prev || prev.length === 0) {
          return [saved];
        }
        if (editingId) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        // Insert at top
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
        error?.response?.message || error?.message || t("admin.announcements.toast.deleteError"); // Fallback
      setToast({ type: "error", message: errorMsg });
      alert("Error saving announcement: " + JSON.stringify(detail));
    }
  };

  // Delete announcement
  const handleDelete = async (id) => {
    try {
      console.log("Deleting announcement:", { id });
      setDeletingId(id);
      await pb.collection("announcements").delete(id);
      await fetchAnnouncements();
      setDeleteConfirmId(null);
      setToast({ type: "success", message: t("admin.announcements.toast.deleteSuccess") });
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      setToast({ type: "error", message: t("admin.announcements.toast.deleteError") });
      alert("Error deleting announcement: " + (error?.message || "unknown error"));
    } finally {
      setDeletingId(null);
    }
  };

  // Preview text
  const getPreviewText = () => {
    const lang = i18n.language;
    return (
      formData.content[lang] ||
      formData.content.en ||
      formData.content.zh ||
      formData.content.ja ||
      "（" + t("admin.announcements.form.preview") + "）"
    );
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
            {t("admin.announcements.form.cancel")} {/* Using Cancel as Close */}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
              {t("admin.announcements.title")}
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              {t("admin.announcements.subtitle")}
            </p>
          </div>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-blue)] px-4 py-1.5 text-xs md:text-sm font-semibold text-slate-950 shadow-[0_0_18px_rgba(142,209,252,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <Plus className="w-4 h-4" />
            {t("admin.announcements.new")}
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-3xl w-full mx-4 my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingId ? t("admin.announcements.form.editTitle") : t("admin.announcements.form.createTitle")}
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
                {/* Multi-language Input */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-800">
                    {t("admin.announcements.form.contentLabel")}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t("admin.announcements.form.zh")}
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
                        placeholder="输入中文公告内容" // Could translate placeholder too but good enough
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t("admin.announcements.form.en")}
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
                        {t("admin.announcements.form.ja")}
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

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("admin.announcements.form.link")}
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

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("admin.announcements.form.type")}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40 focus:border-transparent bg-white"
                  >
                    <option value="info">{t("admin.announcements.form.typeInfo")}</option>
                    <option value="urgent">{t("admin.announcements.form.typeUrgent")}</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    {/* Optional: Add help text translation or remove */}
                    {t("admin.announcements.form.typeInfo")} / {t("admin.announcements.form.typeUrgent")}
                  </p>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1 text-slate-500" />
                      {t("admin.announcements.form.startTime")}
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
                      {t("admin.announcements.form.endTime")}
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

                {/* Preview */}
                <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-sky-600" />
                    <span className="text-sm font-semibold text-sky-900">
                      {t("admin.announcements.form.preview")}
                    </span>
                  </div>
                  <p className="text-sm text-sky-800">{getPreviewText()}</p>
                  {formData.link && (
                    <p className="text-xs text-sky-700 mt-1">
                      {t("admin.announcements.form.details")}
                    </p>
                  )}
                </div>

                {/* Active Status */}
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
                    {t("admin.announcements.form.active")}
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
                    {t("admin.announcements.form.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-blue)] hover:bg-sky-400 text-slate-950 rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? t("admin.announcements.form.update") : t("admin.announcements.form.create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Announcement List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">{t("admin.announcements.empty")}</p>
              <p className="text-gray-400 text-sm mb-6">
                {t("admin.announcements.emptyDesc")}
              </p>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t("admin.announcements.new")}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.announcements.table.content")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.announcements.table.link")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.announcements.table.time")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.announcements.table.status")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.announcements.table.actions")}
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
                            "No Content"}
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
                              - {formatDateTime(item.end_time)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleToggleActive(item.id, item.is_active)
                          }
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${item.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                        >
                          {item.is_active ? t("admin.announcements.status.active") : t("admin.announcements.status.disabled")}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title={t("admin.announcements.form.editTitle")}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            disabled={deletingId === item.id}
                            title={t("admin.announcements.delete.title")}
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

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("admin.announcements.delete.title")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("admin.announcements.delete.desc")}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                {t("admin.announcements.delete.cancel")}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingId === deleteConfirmId && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {t("admin.announcements.delete.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
