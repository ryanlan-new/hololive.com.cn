import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ForcedHostsTab({ forcedHosts, servers, newForcedHost, setNewForcedHost, onAdd, onDelete }) {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t("admin.velocity.forcedHosts.hostname")}</label>
                    <input
                        type="text"
                        value={newForcedHost.hostname}
                        onChange={(e) => setNewForcedHost({ ...newForcedHost, hostname: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                        placeholder="lobby.example.com"
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t("admin.velocity.forcedHosts.server")}</label>
                    <select
                        value={newForcedHost.server}
                        onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                            setNewForcedHost({ ...newForcedHost, server: selected });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[80px]"
                        multiple
                    >
                        {servers.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.address})</option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-400">
                        {t("admin.velocity.forcedHosts.selectServer")} (Ctrl/Cmd + Click)
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    disabled={!newForcedHost.hostname || !Array.isArray(newForcedHost.server) || newForcedHost.server.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                >
                    {t("admin.velocity.actions.add")}
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">{t("admin.velocity.forcedHosts.hostname")}</th>
                            <th className="px-4 py-3 font-medium">{t("admin.velocity.forcedHosts.server")}</th>
                            <th className="px-4 py-3 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {forcedHosts.map(host => {
                            const hostServers = Array.isArray(host.server)
                                ? host.server
                                : (host.server ? [host.server] : []);
                            const targetServers = hostServers
                                .map((id) => servers.find((s) => s.id === id))
                                .filter(Boolean);
                            return (
                                <tr key={host.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-medium font-mono text-slate-700">{host.hostname}</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {targetServers.length > 0 ? (
                                            <span className="inline-flex flex-wrap items-center gap-2">
                                                {targetServers.map((srv) => (
                                                    <span key={srv.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
                                                        <span className={`w-2 h-2 rounded-full ${srv.status === "online" ? "bg-green-500" : "bg-slate-300"}`}></span>
                                                        {srv.name}
                                                    </span>
                                                ))}
                                            </span>
                                        ) : (Array.isArray(host.server) ? host.server.join(", ") : host.server)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => onDelete(host.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {forcedHosts.length === 0 && (
                            <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-400">{t("admin.velocity.forcedHosts.empty")}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
