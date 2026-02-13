import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { FeedbackContext } from "./feedbackContext";

const EMPTY_CONFIRM_STATE = {
  open: false,
  title: "",
  message: "",
  confirmText: "确认",
  cancelText: "取消",
  danger: false,
  resolve: null,
};

function ToastItem({ toast, onClose }) {
  const styleMap = {
    success: {
      wrapper: "border-emerald-200 bg-emerald-50 text-emerald-900",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    },
    error: {
      wrapper: "border-red-200 bg-red-50 text-red-900",
      icon: <XCircle className="h-4 w-4 text-red-600" />,
    },
    warning: {
      wrapper: "border-amber-200 bg-amber-50 text-amber-900",
      icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    },
    info: {
      wrapper: "border-slate-200 bg-white text-slate-900",
      icon: <Info className="h-4 w-4 text-slate-500" />,
    },
  };

  const style = styleMap[toast.type] || styleMap.info;

  return (
    <div className={`pointer-events-auto w-full max-w-sm rounded-xl border px-3 py-2 shadow-lg ${style.wrapper}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{style.icon}</div>
        <p className="flex-1 text-sm whitespace-pre-line break-words">{toast.message}</p>
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="rounded p-0.5 text-slate-500 hover:bg-black/5"
          aria-label="关闭提示"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(EMPTY_CONFIRM_STATE);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = "info", duration = 3200) => {
    if (!message) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    const timer = setTimeout(() => {
      dismissToast(id);
    }, Math.max(1200, duration));
    timersRef.current.set(id, timer);
  }, [dismissToast]);

  const closeConfirm = useCallback((accepted) => {
    setConfirmState((prev) => {
      if (!prev.open) return prev;
      prev.resolve?.(accepted);
      return EMPTY_CONFIRM_STATE;
    });
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setConfirmState((prev) => {
        if (prev.open) {
          prev.resolve?.(false);
        }
        return {
          open: true,
          title: options.title || "请确认操作",
          message: options.message || "",
          confirmText: options.confirmText || "确认",
          cancelText: options.cancelText || "取消",
          danger: Boolean(options.danger),
          resolve,
        };
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!confirmState.open) return undefined;
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        closeConfirm(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [confirmState.open, closeConfirm]);

  return (
    <FeedbackContext.Provider value={{ notify, confirm }}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={dismissToast} />
        ))}
      </div>

      {confirmState.open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">{confirmState.title}</h3>
            {confirmState.message && (
              <p className="mt-2 whitespace-pre-line break-words text-sm text-slate-600">
                {confirmState.message}
              </p>
            )}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white ${
                  confirmState.danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
