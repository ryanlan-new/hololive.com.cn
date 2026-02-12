import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Server,
  GripVertical,
  X,
  Save,
} from "lucide-react";
import pb from "../../lib/pocketbase";
import * as LucideIcons from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Server Info Fields Management Page
 * Support CRUD and Drag-and-Drop Sort
 */
export default function ServerInfoFields() {
  const { adminKey } = useParams();
  const { t } = useTranslation();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    icon: "Server",
    label: { zh: "", en: "", ja: "" },
    value: { zh: "", en: "", ja: "" },
    sort_order: 0,
  });

  // Fetch fields
  const fetchFields = async () => {
    try {
      setLoading(true);
      const result = await pb.collection("server_info_details").getList(1, 100, {
        sort: "sort_order",
      });
      setFields(result.items);
    } catch (error) {
      console.error("Failed to fetch fields:", error);
      showToast("error", t("admin.serverInfoFields.toast.saveError")); // Reuse error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      icon: "Server",
      label: { zh: "", en: "", ja: "" },
      value: { zh: "", en: "", ja: "" },
      sort_order: 0,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  // Handle create/edit
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await pb.collection("server_info_details").update(editingId, formData);
        showToast("success", t("admin.serverInfoFields.toast.updateSuccess"));
      } else {
        // Set sort_order to max + 1 if not provided
        const maxSort =
          fields.length > 0
            ? Math.max(...fields.map((f) => f.sort_order || 0))
            : 0;
        await pb.collection("server_info_details").create({
          ...formData,
          sort_order: formData.sort_order || maxSort + 1,
        });
        showToast("success", t("admin.serverInfoFields.toast.createSuccess"));
      }
      resetForm();
      await fetchFields();
    } catch (error) {
      console.error("Failed to save field:", error);
      showToast("error", t("admin.serverInfoFields.toast.saveError"));
    }
  };

  // Handle delete
  const handleDelete = async (fieldId) => {
    try {
      setDeletingId(fieldId);
      await pb.collection("server_info_details").delete(fieldId);
      setDeleteConfirmId(null);
      showToast("success", t("admin.serverInfoFields.toast.deleteSuccess"));
      await fetchFields();
    } catch (error) {
      console.error("Failed to delete field:", error);
      showToast("error", t("admin.serverInfoFields.toast.saveError")); // Reuse error
    } finally {
      setDeletingId(null);
    }
  };

  // Start editing
  const startEdit = (field) => {
    setFormData({
      icon: field.icon || "Server",
      label: field.label || { zh: "", en: "", ja: "" },
      value: field.value || { zh: "", en: "", ja: "" },
      sort_order: field.sort_order || 0,
    });
    setEditingId(field.id);
    setIsCreating(false);
  };

  // Handle drag start
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...fields];
    const draggedItem = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedItem);
    setFields(newFields);
    setDraggedIndex(index);
  };

  // Handle drag end - update sort_order
  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    try {
      // Update sort_order for all fields
      const updates = fields.map((field, index) => ({
        id: field.id,
        sort_order: index + 1,
      }));

      // Update all fields
      await Promise.all(
        updates.map((update) =>
          pb
            .collection("server_info_details")
            .update(update.id, { sort_order: update.sort_order })
        )
      );

      showToast("success", t("admin.homeManager.toast.orderSuccess")); // Reuse
      await fetchFields();
    } catch (error) {
      console.error("Failed to update sort order:", error);
      showToast("error", t("admin.homeManager.toast.orderError")); // Reuse
      await fetchFields(); // Revert to server state
    } finally {
      setDraggedIndex(null);
    }
  };

  // Get icon component by name
  const getIconComponent = (iconName) => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.Server;
    return IconComponent;
  };

  // Common Lucide icons for selection
  const commonIcons = [
    "Server",
    "Gamepad2",
    "ShieldCheck",
    "Globe",
    "Users",
    "Clock",
    "Info",
    "Link",
    "Map",
    "Settings",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t("admin.serverInfoFields.title")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("admin.serverInfoFields.subtitle")}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-blue)] text-slate-950 rounded-lg font-medium hover:bg-[var(--color-brand-blue)]/90 transition-colors"
        >
          <Plus size={18} />
          {t("admin.serverInfoFields.new")}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? t("admin.serverInfoFields.form.editTitle") : t("admin.serverInfoFields.form.createTitle")}
            </h2>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t("admin.serverInfoFields.form.icon")}
              </label>
              <select
                required
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
              >
                {commonIcons.map((iconName) => {
                  const IconComponent = getIconComponent(iconName);
                  return (
                    <option key={iconName} value={iconName}>
                      {iconName}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                {t("admin.serverInfoFields.form.iconHint")}
              </p>
            </div>
            {/* Multi-language Label Inputs */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t("admin.serverInfoFields.form.label")}
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t("admin.announcements.form.zh")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.label.zh || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        label: { ...formData.label, zh: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
                    placeholder="例如：服务器地址"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t("admin.announcements.form.en")}
                  </label>
                  <input
                    type="text"
                    value={formData.label.en || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        label: { ...formData.label, en: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
                    placeholder="例如：Server Address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t("admin.announcements.form.ja")}
                  </label>
                  <input
                    type="text"
                    value={formData.label.ja || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        label: { ...formData.label, ja: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
                    placeholder="例如：サーバーアドレス"
                  />
                </div>
              </div>
            </div>
            {/* Multi-language Value Inputs */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t("admin.serverInfoFields.form.value")}
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t("admin.announcements.form.zh")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.value.zh || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: { ...formData.value, zh: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
                    placeholder="例如：play.hololive.com.cn"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t("admin.announcements.form.en")}
                  </label>
                  <input
                    type="text"
                    value={formData.value.en || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: { ...formData.value, en: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
                    placeholder="例如：play.hololive.com.cn"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t("admin.announcements.form.ja")}
                  </label>
                  <input
                    type="text"
                    value={formData.value.ja || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: { ...formData.value, ja: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
                    placeholder="例如：play.hololive.com.cn"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t("admin.serverInfoFields.form.sort")}
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sort_order: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
                placeholder="0"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-blue)] text-slate-950 rounded-lg font-medium hover:bg-[var(--color-brand-blue)]/90 transition-colors"
              >
                <Save size={18} />
                {t("admin.serverInfoFields.form.save")}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                {t("admin.serverInfoFields.form.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fields List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      ) : fields.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <Server className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-700">
            {t("admin.serverInfoFields.empty")}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {t("admin.serverInfoFields.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-200">
            {fields.map((field, index) => {
              const IconComponent = getIconComponent(field.icon);
              return (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 hover:bg-slate-50 transition-colors ${draggedIndex === index ? "opacity-50" : ""
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-5 h-5 text-slate-400 cursor-move" />
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <IconComponent
                        size={20}
                        className="text-slate-600 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-slate-900">
                          {field.label?.zh || field.label?.en || field.label?.ja || t("admin.serverInfoFields.unnamed")}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">
                          {typeof field.value === "object"
                            ? (field.value?.zh || field.value?.en || field.value?.ja || "")
                            : field.value || ""}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {t("admin.serverInfoFields.icon")}: {field.icon} | {t("admin.serverInfoFields.sort")}: {field.sort_order || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(field)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t("admin.serverInfoFields.form.editTitle")}
                      >
                        <Edit size={18} className="text-blue-600" />
                      </button>
                      {deleteConfirmId === field.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(field.id)}
                            disabled={deletingId === field.id}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {deletingId === field.id ? t("admin.serverInfoFields.delete.deleting") : t("admin.serverInfoFields.delete.confirm")}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                          >
                            {t("admin.serverInfoFields.delete.cancel")}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(field.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title={t("admin.serverMaps.delete.title")}
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
