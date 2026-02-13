import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Images,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";

/**
 * 富文本编辑器工具栏组件
 * 提供格式化按钮：加粗、斜体、标题、列表、引用、链接、图片等
 */
export default function MenuBar({ editor, onImageUpload, onOpenMediaLibrary }) {
  const { t } = useTranslation("admin");
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) {
    return null;
  }

  const handleApplyLink = () => {
    const value = linkUrl.trim();
    if (!value) {
      setIsLinkModalOpen(false);
      return;
    }

    editor.chain().focus().setLink({ href: value }).run();
    setIsLinkModalOpen(false);
    setLinkUrl("");
  };

  return (
    <>
      <div className="flex items-center gap-1 flex-wrap border-b border-slate-200 bg-slate-50/80 px-3 py-2">
      {/* 加粗 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-md transition-colors ${
          editor.isActive("bold")
            ? "bg-[var(--color-brand-blue)]/20 text-[var(--color-brand-blue)]"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        title={t("menuBar.bold")}
        aria-label={t("menuBar.bold")}
      >
        <Bold className="w-4 h-4" />
      </button>

      {/* 斜体 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-md transition-colors ${
          editor.isActive("italic")
            ? "bg-[var(--color-brand-blue)]/20 text-[var(--color-brand-blue)]"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        title={t("menuBar.italic")}
        aria-label={t("menuBar.italic")}
      >
        <Italic className="w-4 h-4" />
      </button>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* H1 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-md transition-colors ${
          editor.isActive("heading", { level: 1 })
            ? "bg-[var(--color-brand-blue)]/20 text-[var(--color-brand-blue)]"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        title={t("menuBar.heading1")}
        aria-label={t("menuBar.heading1")}
      >
        <Heading1 className="w-4 h-4" />
      </button>

      {/* H2 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-md transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-[var(--color-brand-blue)]/20 text-[var(--color-brand-blue)]"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        title={t("menuBar.heading2")}
        aria-label={t("menuBar.heading2")}
      >
        <Heading2 className="w-4 h-4" />
      </button>

      {/* H3 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded-md transition-colors ${
          editor.isActive("heading", { level: 3 })
            ? "bg-[var(--color-brand-blue)]/20 text-[var(--color-brand-blue)]"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        title={t("menuBar.heading3")}
        aria-label={t("menuBar.heading3")}
      >
        <Heading3 className="w-4 h-4" />
      </button>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* 无序列表 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-md transition-colors ${
          editor.isActive("bulletList")
            ? "bg-[var(--color-brand-blue)]/20 text-[var(--color-brand-blue)]"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        title={t("menuBar.bulletList")}
        aria-label={t("menuBar.bulletList")}
      >
        <List className="w-4 h-4" />
      </button>

      {/* 有序列表 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-md transition-colors ${
          editor.isActive("orderedList")
            ? "bg-[var(--color-brand-blue)]/20 text-[var(--color-brand-blue)]"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        title={t("menuBar.orderedList")}
        aria-label={t("menuBar.orderedList")}
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      {/* 引用 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-md transition-colors ${
          editor.isActive("blockquote")
            ? "bg-[var(--color-brand-blue)]/20 text-[var(--color-brand-blue)]"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        title={t("menuBar.quote")}
        aria-label={t("menuBar.quote")}
      >
        <Quote className="w-4 h-4" />
      </button>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* 链接 */}
      <button
        type="button"
        onClick={() => setIsLinkModalOpen(true)}
        className={`p-1.5 rounded-md transition-colors ${
          editor.isActive("link")
            ? "bg-[var(--color-brand-blue)]/20 text-[var(--color-brand-blue)]"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        title={t("menuBar.link")}
        aria-label={t("menuBar.link")}
      >
        <Link className="w-4 h-4" />
      </button>

      {/* 图片上传 */}
      <button
        type="button"
        onClick={onImageUpload}
        className="p-1.5 rounded-md transition-colors text-slate-600 hover:bg-slate-200"
        title={t("menuBar.uploadImage")}
        aria-label={t("menuBar.uploadImage")}
      >
        <Image className="w-4 h-4" />
      </button>

      {/* 媒体库 */}
      <button
        type="button"
        onClick={onOpenMediaLibrary}
        className="p-1.5 rounded-md transition-colors text-slate-600 hover:bg-slate-200"
        title={t("menuBar.selectFromLibrary")}
        aria-label={t("menuBar.selectFromLibrary")}
      >
        <Images className="w-4 h-4" />
      </button>
      </div>

      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setLinkUrl("");
        }}
        title={t("menuBar.linkDialog.title")}
        size="sm"
      >
        <form
          className="p-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleApplyLink();
          }}
        >
          <div>
            <label
              htmlFor="editor-link-url"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              {t("menuBar.linkDialog.label")}
            </label>
            <input
              id="editor-link-url"
              type="url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder={t("menuBar.linkDialog.placeholder")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)]/30 focus:border-[var(--color-brand-blue)]"
              inputMode="url"
              spellCheck={false}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsLinkModalOpen(false);
                setLinkUrl("");
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm hover:bg-slate-100 transition-colors"
            >
              {t("menuBar.linkDialog.cancel")}
            </button>
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-[var(--color-brand-blue)] text-slate-950 text-sm font-medium hover:bg-[var(--color-brand-blue)]/90 transition-colors"
            >
              {t("menuBar.linkDialog.confirm")}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
