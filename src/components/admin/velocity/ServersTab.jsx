import { Plus, Play, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatusBadge from "./StatusBadge";

export default function ServersTab({ servers, testingMap, onTest, onAdd, onEdit, onDelete }) {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">{t("admin.velocity.tabs.servers")}</h3>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {t("admin.velocity.modal.addTitle")}
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">{t("admin.velocity.table.tryOrder")}</th>
                            <th className="px-4 py-3 font-medium">{t("admin.velocity.table.name")}</th>
                            <th className="px-4 py-3 font-medium">{t("admin.velocity.table.address")}</th>
                            <th className="px-4 py-3 font-medium">{t("admin.velocity.table.isTry")}</th>
                            <th className="px-4 py-3 font-medium">{t("admin.velocity.table.status")}</th>
                            <th className="px-4 py-3 font-medium">{t("admin.velocity.table.actions")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {servers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                                    {t("admin.velocity.servers.table.empty")}
                                </td>
                            </tr>
                        ) : (
                            servers.map((srv) => (
                                <tr key={srv.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 text-slate-600">{srv.try_order}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{srv.name}</td>
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{srv.address}</td>
                                    <td className="px-4 py-3">
                                        {srv.is_try_server ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {t("admin.velocity.servers.table.yes")}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs">{t("admin.velocity.servers.table.no")}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={srv.status} ping={srv.ping} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onTest(srv.id)}
                                                disabled={testingMap[srv.id]}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                                title={t("admin.velocity.testConnection")}
                                            >
                                                <Play className={`w-4 h-4 ${testingMap[srv.id] ? "animate-spin" : ""}`} />
                                            </button>
                                            <button
                                                onClick={() => onEdit(srv)}
                                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                                title={t("admin.velocity.modal.editTitle")}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(srv.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title={t("admin.velocity.modal.deleteTitle")}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
