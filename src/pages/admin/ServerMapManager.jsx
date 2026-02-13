import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, Loader2, Map, GripVertical, Save } from "lucide-react";
import pb from "../../lib/pocketbase";
import { useTranslation } from "react-i18next";
import { useUIFeedback } from "../../hooks/useUIFeedback";
import { createAppLogger } from "../../lib/appLogger";
import Modal from "../../components/admin/ui/Modal";

/**
 * Server Map Manager Page
 * Manage external links for server maps
 */
const logger = createAppLogger("ServerMapManager");

export default function ServerMapManager() {
  const { t } = useTranslation();
  const { notify } = useUIFeedback();
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    sort_order: 0,
  });

  const normalizeMapUrl = (rawUrl) => {
    const trimmed = `${rawUrl || ""}`.trim();
    if (!trimmed) return "";

    const withProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)
      ? trimmed
      : `http://${trimmed}`;

    try {
      const parsed = new URL(withProtocol);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return "";
      }
      return parsed.toString();
    } catch {
      return "";
    }
  };

  const fetchMaps = useCallback(async () => {
    try {
      setLoading(true);
      const result = await pb.collection("server_maps").getList(1, 100, {
        sort: "sort_order",
      });
      setMaps(result.items);
    } catch (error) {
      logger.error("Failed to fetch maps:", error);
      notify(t("admin.serverMaps.toast.saveError"), "error");
    } finally {
      setLoading(false);
    }
  }, [notify, t]);

  useEffect(() => {
    fetchMaps();
  }, [fetchMaps]);

  const showToast = useCallback(
    (type, message) => {
      notify(message, type);
    },
    [notify]
  );

  const resetForm = () => {
    setFormData({ name: "", url: "", sort_order: 0 });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const normalizedUrl = normalizeMapUrl(formData.url);
    if (!normalizedUrl) {
      showToast("error", t("admin.serverMaps.validation.invalidUrl"));
      return;
    }

    const payload = {
      ...formData,
      url: normalizedUrl,
    };

    try {
      if (editingId) {
        await pb.collection("server_maps").update(editingId, payload);
        showToast("success", t("admin.serverMaps.toast.updateSuccess"));
      } else {
        const maxSort = maps.length > 0 ? Math.max(...maps.map((item) => item.sort_order || 0)) : 0;
        await pb.collection("server_maps").create({
          ...payload,
          sort_order: payload.sort_order || maxSort + 1,
        });
        showToast("success", t("admin.serverMaps.toast.createSuccess"));
      }

      resetForm();
      await fetchMaps();
    } catch (error) {
      logger.error("Failed to save map:", error);
      showToast("error", t("admin.serverMaps.toast.saveError"));
    }
  };

  const handleDelete = async (mapId) => {
    try {
      setDeletingId(mapId);
      await pb.collection("server_maps").delete(mapId);
      setDeleteTarget(null);
      showToast("success", t("admin.serverMaps.toast.deleteSuccess"));
      await fetchMaps();
    } catch (error) {
      logger.error("Failed to delete map:", error);
      showToast("error", t("admin.serverMaps.toast.saveError"));
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (map) => {
    setFormData({
      name: map.name || "",
      url: map.url || "",
      sort_order: map.sort_order || 0,
    });
    setEditingId(map.id);
    setIsCreating(false);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event, index) => {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newMaps = [...maps];
    const draggedItem = newMaps[draggedIndex];
    newMaps.splice(draggedIndex, 1);
    newMaps.splice(index, 0, draggedItem);
    setMaps(newMaps);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    try {
      const updates = maps.map((map, index) => ({
        id: map.id,
        sort_order: index + 1,
      }));

      await Promise.all(
        updates.map((update) =>
          pb.collection("server_maps").update(update.id, { sort_order: update.sort_order })
        )
      );

      showToast("success", t("admin.homeManager.toast.orderSuccess"));
      await fetchMaps();
    } catch (error) {
      logger.error("Failed to update sort order:", error);
      showToast("error", t("admin.homeManager.toast.orderError"));
      await fetchMaps();
    } finally {
      setDraggedIndex(null);
    }
  };

  return (
    <div className="space-y-6">
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

      <Modal
        isOpen={isCreating || Boolean(editingId)}
        onClose={resetForm}
        title={editingId ? t("admin.serverMaps.form.editTitle") : t("admin.serverMaps.form.createTitle")}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t("admin.serverMaps.form.name")}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)]"
              placeholder={t("admin.serverMaps.form.namePlaceholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t("admin.serverMaps.form.url")}
            </label>
            <input
              type="text"
              required
              value={formData.url}
              onChange={(event) => setFormData({ ...formData, url: event.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)]"
              placeholder={t("admin.serverMaps.form.urlPlaceholder")}
              inputMode="url"
              spellCheck={false}
            />
            <p className="text-xs text-slate-500 mt-1">
              {t("admin.serverMaps.form.urlHint")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t("admin.serverMaps.form.sort")}
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(event) =>
                setFormData({ ...formData, sort_order: parseInt(event.target.value, 10) || 0 })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)]"
              placeholder={t("admin.serverMaps.form.sortPlaceholder")}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              {t("admin.serverMaps.form.cancel")}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-blue)] text-slate-950 rounded-lg font-medium hover:bg-[var(--color-brand-blue)]/90 transition-colors"
            >
              <Save size={18} />
              {t("admin.serverMaps.form.save")}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t("admin.serverMaps.delete.title")}
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            {t("admin.serverMaps.delete.confirmHint", {
              name: deleteTarget?.name || "",
            })}
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-3 py-2 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
            >
              {t("admin.serverMaps.delete.cancel")}
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleteTarget?.id) handleDelete(deleteTarget.id);
              }}
              disabled={deletingId === deleteTarget?.id}
              className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {deletingId === deleteTarget?.id
                ? t("admin.serverInfoFields.delete.deleting")
                : t("admin.serverMaps.delete.confirm")}
            </button>
          </div>
        </div>
      </Modal>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
          <p className="text-sm text-slate-500">{t("admin.serverMaps.loading")}</p>
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
                onDragOver={(event) => handleDragOver(event, index)}
                onDragEnd={handleDragEnd}
                className={`p-4 hover:bg-slate-50 transition-colors ${draggedIndex === index ? "opacity-50" : ""}`}
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
                    <button
                      onClick={() => setDeleteTarget(map)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title={t("admin.serverMaps.delete.title")}
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
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
