import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, Loader2, Map, GripVertical, X, Save } from "lucide-react";
import pb from "../../lib/pocketbase";
import { useTranslation } from "react-i18next";

/**
 * Server Map Manager Page
 * Manage external links for server maps
 */
export default function ServerMapManager() {
  const { t } = useTranslation();
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    sort_order: 0,
  });

  // Fetch maps
  const fetchMaps = useCallback(async () => {
    try {
      setLoading(true);
      const result = await pb.collection("server_maps").getList(1, 100, {
        sort: "sort_order",
      });
      setMaps(result.items);
    } catch (error) {
      console.error("Failed to fetch maps:", error);
      showToast("error", t("admin.serverMaps.toast.saveError")); // Fallback/reuse
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMaps();
  }, [fetchMaps]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: "", url: "", sort_order: 0 });
    setEditingId(null);
    setIsCreating(false);
  };

  // Handle create/edit
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await pb.collection("server_maps").update(editingId, formData);
        showToast("success", t("admin.serverMaps.toast.updateSuccess"));
      } else {
        // Set sort_order to max + 1 if not provided
        const maxSort = maps.length > 0 ? Math.max(...maps.map((m) => m.sort_order || 0)) : 0;
        await pb.collection("server_maps").create({
          ...formData,
          sort_order: formData.sort_order || maxSort + 1,
        });
        showToast("success", t("admin.serverMaps.toast.createSuccess"));
      }
      resetForm();
      await fetchMaps();
    } catch (error) {
      console.error("Failed to save map:", error);
      showToast("error", t("admin.serverMaps.toast.saveError"));
    }
  };

  // Handle delete
  const handleDelete = async (mapId) => {
    try {
      setDeletingId(mapId);
      await pb.collection("server_maps").delete(mapId);
      setDeleteConfirmId(null);
      showToast("success", t("admin.serverMaps.toast.deleteSuccess"));
      await fetchMaps();
    } catch (error) {
      console.error("Failed to delete map:", error);
      showToast("error", t("admin.serverMaps.toast.saveError")); // Reuse error
    } finally {
      setDeletingId(null);
    }
  };

  // Start editing
  const startEdit = (map) => {
    setFormData({
      name: map.name || "",
      url: map.url || "",
      sort_order: map.sort_order || 0,
    });
    setEditingId(map.id);
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

    const newMaps = [...maps];
    const draggedItem = newMaps[draggedIndex];
    newMaps.splice(draggedIndex, 1);
    newMaps.splice(index, 0, draggedItem);
    setMaps(newMaps);
    setDraggedIndex(index);
  };

  // Handle drag end - update sort_order
  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    try {
      // Update sort_order for all maps
      const updates = maps.map((map, index) => ({
        id: map.id,
        sort_order: index + 1,
      }));

      // Update all maps
      await Promise.all(
        updates.map((update) =>
          pb.collection("server_maps").update(update.id, { sort_order: update.sort_order })
        )
      );

      showToast("success", t("admin.homeManager.toast.orderSuccess")); // Reuse homeManager key which says "Order updated."
      await fetchMaps();
    } catch (error) {
      console.error("Failed to update sort order:", error);
      showToast("error", t("admin.homeManager.toast.orderError")); // Reuse
      await fetchMaps(); // Revert to server state
    } finally {
      setDraggedIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("admin.serverMaps.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("admin.serverMaps.subtitle")}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-blue)] text-slate-950 rounded-lg font-medium hover:bg-[var(--color-brand-blue)]/90 transition-colors"
        >
          <Plus size={18} />
          {t("admin.serverMaps.new")}
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
              {editingId ? t("admin.serverMaps.form.editTitle") : t("admin.serverMaps.form.createTitle")}
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
                {t("admin.serverMaps.form.name")}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
                placeholder="例如：主世界地图"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t("admin.serverMaps.form.url")}
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
                placeholder="https://example.com/map"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t("admin.serverMaps.form.sort")}
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
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
                {t("admin.serverMaps.form.save")}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                {t("admin.serverMaps.form.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Maps List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      ) : maps.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <Map className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-700">{t("admin.serverMaps.empty")}</p>
          <p className="text-xs text-slate-500 mt-1">{t("admin.serverMaps.emptyDesc")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-200">
            {maps.map((map, index) => (
              <div
                key={map.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-4 hover:bg-slate-50 transition-colors ${draggedIndex === index ? "opacity-50" : ""
                  }`}
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-slate-400 cursor-move" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-900">{map.name}</h3>
                    <p className="text-sm text-slate-500 truncate">{map.url}</p>
                    <p className="text-xs text-slate-400 mt-1">{t("admin.serverMaps.sort")}: {map.sort_order || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(map)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t("admin.serverMaps.form.editTitle")}
                    >
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    {deleteConfirmId === map.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(map.id)}
                          disabled={deletingId === map.id}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {deletingId === map.id ? t("admin.serverInfoFields.delete.deleting") : t("admin.serverMaps.delete.confirm")}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                        >
                          {t("admin.serverMaps.delete.cancel")}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(map.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title={t("admin.serverMaps.delete.title")}
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
