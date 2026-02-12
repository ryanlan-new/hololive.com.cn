import { X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ServerModal({
    isOpen,
    editingServer,
    newServer,
    setNewServer,
    saving,
    onSave,
    onClose,
}) {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800">
                        {editingServer ? t("admin.velocity.modal.editTitle") : t("admin.velocity.modal.addTitle")}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t("admin.velocity.modal.name")}
                        </label>
                        <input
                            type="text"
                            value={newServer.name}
                            onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder={t("admin.velocity.modal.namePlaceholder")}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t("admin.velocity.modal.address")}
                        </label>
                        <input
                            type="text"
                            value={newServer.address}
                            onChange={(e) => setNewServer({ ...newServer, address: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
                            placeholder={t("admin.velocity.modal.addressPlaceholder")}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t("admin.velocity.modal.tryOrder")}
                            </label>
                            <input
                                type="number"
                                value={newServer.try_order}
                                onChange={(e) => setNewServer({ ...newServer, try_order: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newServer.is_try_server}
                                    onChange={(e) => setNewServer({ ...newServer, is_try_server: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700">
                                    {t("admin.velocity.modal.isTry")}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {t("admin.velocity.modal.cancel")}
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-70 flex items-center gap-2"
                    >
                        {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                        {t("admin.velocity.modal.save")}
                    </button>
                </div>
            </div>
        </div>
    );
}
