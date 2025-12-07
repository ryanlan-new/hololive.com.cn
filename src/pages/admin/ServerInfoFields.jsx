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

/**
 * 服务器信息字段管理页面
 * 支持 CRUD 操作和拖拽排序
 */
export default function ServerInfoFields() {
  const { adminKey } = useParams();
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

  // 获取字段列表
  const fetchFields = async () => {
    try {
      setLoading(true);
      const result = await pb.collection("server_info_details").getList(1, 100, {
        sort: "sort_order",
      });
      setFields(result.items);
    } catch (error) {
      console.error("Failed to fetch fields:", error);
      showToast("error", "获取字段列表失败，请稍后重试。");
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
        showToast("success", "字段已更新");
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
        showToast("success", "字段已创建");
      }
      resetForm();
      await fetchFields();
    } catch (error) {
      console.error("Failed to save field:", error);
      showToast("error", "保存失败，请稍后重试。");
    }
  };

  // Handle delete
  const handleDelete = async (fieldId) => {
    try {
      setDeletingId(fieldId);
      await pb.collection("server_info_details").delete(fieldId);
      setDeleteConfirmId(null);
      showToast("success", "字段已删除");
      await fetchFields();
    } catch (error) {
      console.error("Failed to delete field:", error);
      showToast("error", "删除失败，请稍后重试。");
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

      showToast("success", "排序已更新");
      await fetchFields();
    } catch (error) {
      console.error("Failed to update sort order:", error);
      showToast("error", "更新排序失败，请稍后重试。");
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
            服务器信息字段管理
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            管理服务器信息页面的动态字段
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
          新建字段
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === "success"
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
              {editingId ? "编辑字段" : "新建字段"}
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
                图标名称 *
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
                选择 Lucide React 图标名称
              </p>
            </div>
            {/* Multi-language Label Inputs */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                标签（多语言） *
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    中文 (ZH) *
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
                    英文 (EN)
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
                    日文 (JA)
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
                显示值（多语言） *
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    中文 (ZH) *
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
                    英文 (EN)
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
                    日文 (JA)
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
                排序顺序
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
                保存
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fields List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
          <p className="text-sm text-slate-500">加载中...</p>
        </div>
      ) : fields.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <Server className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-700">
            当前还没有字段
          </p>
          <p className="text-xs text-slate-500 mt-1">
            点击上面的按钮开始创建
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
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    draggedIndex === index ? "opacity-50" : ""
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
                          {field.label?.zh || field.label?.en || field.label?.ja || "未命名"}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">
                          {typeof field.value === "object" 
                            ? (field.value?.zh || field.value?.en || field.value?.ja || "")
                            : field.value || ""}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          图标: {field.icon} | 排序: {field.sort_order || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(field)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
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
                            {deletingId === field.id ? "删除中..." : "确认"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(field.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
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

