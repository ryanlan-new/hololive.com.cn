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

/**
 * 富文本编辑器工具栏组件
 * 提供格式化按钮：加粗、斜体、标题、列表、引用、链接、图片等
 */
export default function MenuBar({ editor, onImageUpload, onOpenMediaLibrary }) {
  if (!editor) {
    return null;
  }

  return (
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
        title="加粗 (Ctrl+B)"
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
        title="斜体 (Ctrl+I)"
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
        title="标题 1"
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
        title="标题 2"
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
        title="标题 3"
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
        title="无序列表"
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
        title="有序列表"
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
        title="引用"
      >
        <Quote className="w-4 h-4" />
      </button>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* 链接 */}
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("请输入链接地址:");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`p-1.5 rounded-md transition-colors ${
          editor.isActive("link")
            ? "bg-[var(--color-brand-blue)]/20 text-[var(--color-brand-blue)]"
            : "text-slate-600 hover:bg-slate-200"
        }`}
        title="插入链接"
      >
        <Link className="w-4 h-4" />
      </button>

      {/* 图片上传 */}
      <button
        type="button"
        onClick={onImageUpload}
        className="p-1.5 rounded-md transition-colors text-slate-600 hover:bg-slate-200"
        title="上传图片"
      >
        <Image className="w-4 h-4" />
      </button>

      {/* 媒体库 */}
      <button
        type="button"
        onClick={onOpenMediaLibrary}
        className="p-1.5 rounded-md transition-colors text-slate-600 hover:bg-slate-200"
        title="从媒体库选择"
      >
        <Images className="w-4 h-4" />
      </button>
    </div>
  );
}

