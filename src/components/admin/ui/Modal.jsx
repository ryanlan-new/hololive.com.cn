import { X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

/**
 * 通用模态框组件
 * 
 * @param {boolean} isOpen - 是否显示模态框
 * @param {Function} onClose - 关闭回调函数
 * @param {string} title - 标题（可选）
 * @param {ReactNode} children - 子内容
 * @param {string} size - 尺寸：'sm', 'md', 'lg', 'xl' (默认 'md')
 */
export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  const { t } = useTranslation("common");
  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  const modalNode = (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      onClick={(e) => {
        // 点击背景关闭
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* 模态框内容 */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label={t("actions.close")}
              >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        )}

        {/* 内容 */}
        <div className="overflow-y-auto overscroll-contain max-h-[calc(100vh-8rem)]">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
