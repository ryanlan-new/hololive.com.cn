import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save, ArrowLeft, Loader2, Plus, Trash2, Languages } from "lucide-react";
import pb from "../../lib/pocketbase";
import { detectSourceLanguage, translateFields } from "../../lib/translation";
import ImagePicker from "../../components/admin/ImagePicker";
import { useTranslation } from "react-i18next";
import { createAppLogger } from "../../lib/appLogger";

/**
 * 首页分段编辑器组件
 * 支持新建和编辑两种模式
 */
const logger = createAppLogger("SectionEditor");

export default function SectionEditor() {
  const { adminKey, id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("admin");
  const isEditMode = !!id;

  // 语言选项
  const languages = [
    { code: "zh", label: "中文" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
  ];
  const [activeLang, setActiveLang] = useState("zh");

  // 表单状态
  const [formData, setFormData] = useState({
    title: { zh: "", en: "", ja: "" },
    subtitle: { zh: "", en: "", ja: "" },
    content: { zh: "", en: "", ja: "" },
    announcement: { zh: "", en: "", ja: "" },
    sort_order: 1,
    buttons: [],
    background_ref: null, // Relation ID to media collection
  });

  // UI 状态
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [legacyBackgroundUrl, setLegacyBackgroundUrl] = useState(null); // For backward compatibility
  const [translating, setTranslating] = useState(false);

  // 加载分段数据（编辑模式）
  useEffect(() => {
    if (!isEditMode) {
      // 新建模式：获取最大 sort_order
      const fetchMaxOrder = async () => {
        try {
          const result = await pb.collection("cms_sections").getList(1, 1, {
            sort: "-sort_order",
          });
          const maxOrder = result.items.length > 0 ? result.items[0].sort_order : 0;
          setFormData((prev) => ({ ...prev, sort_order: maxOrder + 1 }));
        } catch (err) {
          logger.error("Failed to fetch max order:", err);
        }
      };
      fetchMaxOrder();
      return;
    }

    const fetchSection = async () => {
      try {
        setLoading(true);
        // Use expand to get related media
        const section = await pb.collection("cms_sections").getOne(id, {
          expand: "background_ref",
        });

        // 处理多语言字段
        const title = typeof section.title === "object" ? section.title : { zh: section.title || "", en: "", ja: "" };
        const subtitle = typeof section.subtitle === "object" ? section.subtitle : { zh: section.subtitle || "", en: "", ja: "" };
        const content = typeof section.content === "object" ? section.content : { zh: section.content || "", en: "", ja: "" };
        const announcement = typeof section.announcement === "object" ? section.announcement : { zh: section.announcement || "", en: "", ja: "" };

        // 处理按钮数据（确保格式正确）
        let buttons = section.buttons || [];
        if (Array.isArray(buttons)) {
          buttons = buttons.map(btn => ({
            label: typeof btn.label === "object" ? btn.label : { zh: btn.label || "", en: "", ja: "" },
            link: btn.link || "#",
            style: btn.style || "primary",
          }));
        }

        setFormData({
          title: { zh: title.zh || "", en: title.en || "", ja: title.ja || "" },
          subtitle: { zh: subtitle.zh || "", en: subtitle.en || "", ja: subtitle.ja || "" },
          content: { zh: content.zh || "", en: content.en || "", ja: content.ja || "" },
          announcement: { zh: announcement.zh || "", en: announcement.en || "", ja: announcement.ja || "" },
          sort_order: section.sort_order || 1,
          buttons: buttons,
          background_ref: section.background_ref || null,
        });

        // 处理旧版背景图片（向后兼容）
        let legacyUrl = null;
        if (section.background_ref && section.expand && section.expand.background_ref) {
          // New way: use relation
          const mediaRecord = section.expand.background_ref;
          if (mediaRecord && mediaRecord.file) {
            legacyUrl = pb.files.getUrl(mediaRecord, mediaRecord.file);
          }
        } else if (section.background) {
          // Legacy way: direct file field
          legacyUrl = pb.files.getUrl(section, section.background);
        }
        setLegacyBackgroundUrl(legacyUrl);

        setError(null);
      } catch (err) {
        logger.error("Failed to fetch section:", err);
        setError("Failed to load section.");
      } finally {
        setLoading(false);
      }
    };

    fetchSection();
  }, [id, isEditMode]);

  // 更新多语言字段
  const updateMultilangField = (field, lang, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  // 添加按钮
  const handleAddButton = () => {
    setFormData((prev) => ({
      ...prev,
      buttons: [
        ...prev.buttons,
        {
          label: { zh: "", en: "", ja: "" },
          link: "#",
          style: "primary",
        },
      ],
    }));
  };

  // 处理背景图片选择（使用 Relation ID）
  const handleBackgroundChange = (mediaId) => {
    setFormData((prev) => ({
      ...prev,
      background_ref: mediaId,
    }));
    // Clear legacy URL when using new relation
    if (mediaId) {
      setLegacyBackgroundUrl(null);
    }
  };

  // 删除按钮
  const handleRemoveButton = (index) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index),
    }));
  };

  // 更新按钮
  const updateButton = (index, field, value) => {
    setFormData((prev) => {
      const newButtons = [...prev.buttons];
      if (field === "label") {
        // 处理多语言 label
        const lang = activeLang;
        newButtons[index] = {
          ...newButtons[index],
          label: {
            ...newButtons[index].label,
            [lang]: value,
          },
        };
      } else {
        newButtons[index] = {
          ...newButtons[index],
          [field]: value,
        };
      }
      return { ...prev, buttons: newButtons };
    });
  };


  // 一键智能翻译
  const handleAutoTranslate = async () => {
    try {
      setTranslating(true);
      setToast({ type: "info", message: t("sectionEditor.buttons.translating") });

      // 需要翻译的字段列表
      const fieldsToTranslate = ['title', 'subtitle', 'content', 'announcement'];
      const updatedFormData = { ...formData };
      let translatedCount = 0;

      for (let i = 0; i < fieldsToTranslate.length; i++) {
        const fieldName = fieldsToTranslate[i];
        const field = formData[fieldName];
        if (!field) continue;

        // 检测源语言
        const sourceLang = detectSourceLanguage(field);
        if (!sourceLang) continue; // 如果没有源语言，跳过

        // 确定目标语言（除了源语言外的其他语言）
        const targetLangs = ['zh', 'en', 'ja'].filter(lang => lang !== sourceLang);

        // 添加字段间的延迟（除了第一个字段）
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 翻译字段，带进度回调
        const translated = await translateFields(
          field,
          sourceLang,
          targetLangs,
          (progressMsg) => {
            setToast({ type: "info", message: progressMsg });
          }
        );
        updatedFormData[fieldName] = translated;
        translatedCount++;
      }

      // 翻译按钮数组
      if (formData.buttons && formData.buttons.length > 0) {
        setToast({ type: "info", message: t("sectionEditor.buttons.translating") });

        for (let i = 0; i < formData.buttons.length; i++) {
          const button = formData.buttons[i];
          if (!button) continue;

          // 确保 label 是对象格式
          const labelObj = typeof button.label === "object" && button.label !== null
            ? button.label
            : { zh: button.label || "", en: "", ja: "" };

          // 检测按钮标签的源语言
          const sourceLang = detectSourceLanguage(labelObj);
          if (!sourceLang) continue;

          // 确定目标语言
          const targetLangs = ['zh', 'en', 'ja'].filter(lang => lang !== sourceLang);

          // 添加延迟
          if (i > 0 || translatedCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // 翻译按钮标签
          const translatedLabel = await translateFields(
            labelObj,
            sourceLang,
            targetLangs,
            (progressMsg) => {
              setToast({ type: "info", message: `Button ${i + 1}: ${progressMsg}` });
            }
          );

          updatedFormData.buttons[i] = {
            ...button,
            label: translatedLabel,
          };
        }
      }

      if (translatedCount === 0 && (!formData.buttons || formData.buttons.length === 0)) {
        setToast({
          type: "warning",
          message: t("sectionEditor.toast.noContent")
        });
      } else {
        setFormData(updatedFormData);
        setToast({ type: "success", message: t("sectionEditor.toast.translateSuccess") });
      }
    } catch (err) {
      logger.error("Translation error:", err);
      setToast({
        type: "error",
        message: err.message || t("sectionEditor.toast.translateError")
      });
    } finally {
      setTranslating(false);
    }
  };

  // 保存分段
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const saveData = {
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        announcement: formData.announcement,
        sort_order: formData.sort_order,
        buttons: formData.buttons,
        background_ref: formData.background_ref || null, // Use Relation ID
      };

      // 直接使用对象（PocketBase 会自动序列化 JSON 字段和 Relation）
      const finalData = saveData;

      if (isEditMode) {
        await pb.collection("cms_sections").update(id, finalData);
      } else {
        await pb.collection("cms_sections").create(finalData);
      }

      setToast({
        type: "success",
        message: isEditMode ? t("sectionEditor.toast.updated") : t("sectionEditor.toast.created"),
      });
      setTimeout(() => {
        setToast(null);
        navigate(`/${adminKey}/webadmin/home`);
      }, 900);
    } catch (err) {
      logger.error("Failed to save section:", err);
      const errorMsg = err?.response?.message || err?.message || t("sectionEditor.toast.saveError");
      setError(errorMsg);
      setToast({
        type: "error",
        message: t("sectionEditor.toast.saveError"),
      });
    } finally {
      setSaving(false);
    }
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
              : toast.type === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : toast.type === "warning"
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
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

      {/* 错误提示 */}
      {error && (
        <div className="rounded-2xl px-4 py-2.5 text-sm bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {/* 页面标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/${adminKey}/webadmin/home`}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? t("sectionEditor.title.edit") : t("sectionEditor.title.create")}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoTranslate}
            disabled={translating || saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {translating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Languages className="w-4 h-4" />
            )}
            {translating ? t("sectionEditor.buttons.translating") : t("sectionEditor.buttons.translate")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || translating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t("sectionEditor.buttons.save")}
          </button>
        </div>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 排序 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t("sectionEditor.form.sort")}
          </label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sort_order: parseInt(e.target.value) || 1,
              }))
            }
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            {t("sectionEditor.form.sortHint")}
          </p>
        </div>

        {/* 多语言标题 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              {t("sectionEditor.form.title")} *
            </label>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLang(lang.code)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${activeLang === lang.code
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={formData.title[activeLang] || ""}
            onChange={(e) =>
              updateMultilangField("title", activeLang, e.target.value)
            }
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t("sectionEditor.placeholders.enter", { lang: languages.find((l) => l.code === activeLang)?.label, field: t("sectionEditor.form.title") })}
            required
          />
        </div>

        {/* 多语言副标题 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              {t("sectionEditor.form.subtitle")}
            </label>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLang(lang.code)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${activeLang === lang.code
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={formData.subtitle[activeLang] || ""}
            onChange={(e) =>
              updateMultilangField("subtitle", activeLang, e.target.value)
            }
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder={t("sectionEditor.placeholders.enter", { lang: languages.find((l) => l.code === activeLang)?.label, field: t("sectionEditor.form.subtitle") })}
          />
        </div>

        {/* 多语言内容 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              {t("sectionEditor.form.content")}
            </label>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLang(lang.code)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${activeLang === lang.code
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={formData.content[activeLang] || ""}
            onChange={(e) =>
              updateMultilangField("content", activeLang, e.target.value)
            }
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="6"
            placeholder={t("sectionEditor.placeholders.enter", { lang: languages.find((l) => l.code === activeLang)?.label, field: t("sectionEditor.form.content") })}
          />
        </div>

        {/* 多语言公告 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              {t("sectionEditor.form.announcement")}
            </label>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLang(lang.code)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${activeLang === lang.code
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={formData.announcement[activeLang] || ""}
            onChange={(e) =>
              updateMultilangField("announcement", activeLang, e.target.value)
            }
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder={t("sectionEditor.placeholders.enter", { lang: languages.find((l) => l.code === activeLang)?.label, field: t("sectionEditor.form.announcement") })}
          />
        </div>

        {/* 背景图片 - 使用 ImagePicker 组件 */}
        <ImagePicker
          value={formData.background_ref}
          onChange={handleBackgroundChange}
          previewUrl={legacyBackgroundUrl}
          label={t("sectionEditor.form.background")}
        />

        {/* 按钮列表 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              {t("sectionEditor.form.buttons")}
            </label>
            <button
              type="button"
              onClick={handleAddButton}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              {t("sectionEditor.buttons.add")}
            </button>
          </div>
          {formData.buttons.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center border border-slate-200 rounded-lg">
              {t("sectionEditor.emptyButtons")}
            </p>
          ) : (
            <div className="space-y-3">
              {formData.buttons.map((button, index) => (
                <div
                  key={index}
                  className="p-4 border border-slate-200 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      button {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveButton(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-slate-600">
                        {t("sectionEditor.form.buttonLabel")}
                      </label>
                      <div className="flex gap-1 ml-auto">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => setActiveLang(lang.code)}
                            className={`px-2 py-0.5 text-xs rounded ${activeLang === lang.code
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={button.label[activeLang] || ""}
                      onChange={(e) =>
                        updateButton(index, "label", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder={t("sectionEditor.placeholders.enter", { lang: languages.find((l) => l.code === activeLang)?.label, field: t("sectionEditor.form.buttonLabel") })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t("sectionEditor.form.link")}
                    </label>
                    <input
                      type="text"
                      value={button.link}
                      onChange={(e) =>
                        updateButton(index, "link", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="/ 或 https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {t("sectionEditor.form.style")}
                    </label>
                    <select
                      value={button.style}
                      onChange={(e) =>
                        updateButton(index, "style", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="primary">{t("sectionEditor.styles.primary")}</option>
                      <option value="secondary">{t("sectionEditor.styles.secondary")}</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
