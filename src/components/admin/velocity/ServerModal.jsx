import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingServer ? t("admin.velocity.modal.editTitle") : t("admin.velocity.modal.addTitle")}
      size="sm"
    >
      <div className="space-y-4 px-6 py-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t("admin.velocity.modal.name")}
          </label>
          <input
            type="text"
            name="server_name"
            autoComplete="off"
            value={newServer.name}
            onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            placeholder={t("admin.velocity.modal.namePlaceholder")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t("admin.velocity.modal.address")}
          </label>
          <input
            type="text"
            name="server_address"
            autoComplete="off"
            value={newServer.address}
            onChange={(e) => setNewServer({ ...newServer, address: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono text-sm"
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
              name="server_try_order"
              value={newServer.try_order}
              onChange={(e) => setNewServer({ ...newServer, try_order: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center pt-6">
            <label htmlFor="is-try-server" className="flex items-center gap-2 cursor-pointer">
              <input
                id="is-try-server"
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
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {t("admin.velocity.modal.cancel")}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-3 h-3 animate-spin" />}
          {t("admin.velocity.modal.save")}
        </button>
      </div>
    </Modal>
  );
}
