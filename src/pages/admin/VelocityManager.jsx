import { useState, useEffect } from "react";
import pb from "../../lib/pocketbase";
import {
    Server,
    Settings,
    Upload,
    RefreshCw,
    Plus,
    Trash2,
    Save,
    Activity,
    CheckCircle,
    AlertCircle,
    HardDrive,
    LayoutDashboard,
    Play,
    AlertTriangle,
    Loader2,
    Pencil,
    X,
    Globe
} from "lucide-react";

import { useTranslation } from "react-i18next";

export default function VelocityManager() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [settings, setSettings] = useState(null);
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [restarting, setRestarting] = useState(false);
    const [testingMap, setTestingMap] = useState({});
    const [newServer, setNewServer] = useState({ name: "", address: "", try_order: 0, is_try_server: false });
    const [settingsId, setSettingsId] = useState(null);
    const [isServerModalOpen, setIsServerModalOpen] = useState(false);
    const [editingServer, setEditingServer] = useState(null);
    const [forcedHosts, setForcedHosts] = useState([]);
    const [newForcedHost, setNewForcedHost] = useState({ hostname: "", server: "" });

    const handleAddServer = () => {
        setEditingServer(null);
        setNewServer({ name: "", address: "", try_order: 0, is_try_server: false });
        setIsServerModalOpen(true);
    };

    const handleEditServer = (server) => {
        setEditingServer(server);
        setNewServer({
            name: server.name,
            address: server.address,
            try_order: server.try_order,
            is_try_server: server.is_try_server
        });
        setIsServerModalOpen(true);
    };

    const handleDeleteServer = async (id) => {
        if (!window.confirm(t("admin.velocity.modal.deleteConfirm"))) return;
        try {
            await pb.collection('velocity_servers').delete(id);
        } catch (err) {
            console.error(err);
            alert(t("admin.velocity.actions.deleteServerError"));
        }
    };

    const handleSaveServer = async () => {
        if (!newServer.name || !newServer.address) return;
        setSaving(true);
        try {
            if (editingServer) {
                await pb.collection('velocity_servers').update(editingServer.id, newServer);
            } else {
                await pb.collection('velocity_servers').create(newServer);
            }
            setIsServerModalOpen(false);
            setEditingServer(null);
            setNewServer({ name: "", address: "", try_order: 0, is_try_server: false });
        } catch (err) {
            console.error(err);
            alert(t("admin.velocity.actions.addServerError"));
        } finally {
            setSaving(false);
        }
    };

    // Fetch initial data
    useEffect(() => {
        fetchData();

        // Subscribe to Realtime Updates
        const settingsUnsub = pb.collection('velocity_settings').subscribe('*', (e) => {
            if (e.action === "update") {
                setSettings(e.record);
                if (!e.record.restart_trigger) {
                    setRestarting(false);
                }
            }
        });

        const serversUnsub = pb.collection('velocity_servers').subscribe('*', (e) => {
            if (e.action === "update") {
                setServers(prev => prev.map(s => s.id === e.record.id ? e.record : s));
                // Stop testing loading state if status changed from pending
                if (e.record.status !== 'pending') {
                    setTestingMap(prev => ({ ...prev, [e.record.id]: false }));
                }
            } else {
                pb.collection("velocity_servers").getFullList({ sort: "try_order" }).then(res => setServers(res));
            }
        });

        return () => {
            pb.collection("velocity_settings").unsubscribe();
            pb.collection("velocity_servers").unsubscribe();
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Settings (Singleton)
            const settingsList = await pb.collection("velocity_settings").getList(1, 1);
            if (settingsList.items.length > 0) {
                setSettings(settingsList.items[0]);
                setSettingsId(settingsList.items[0].id);
            }

            // Fetch Servers
            const serversList = await pb.collection("velocity_servers").getFullList({ sort: "try_order" });
            setServers(serversList || []);

            // Fetch Forced Hosts
            const forcedHostsList = await pb.collection("velocity_forced_hosts").getFullList({ sort: "hostname" });
            setForcedHosts(forcedHostsList || []);
        } catch (err) {
            console.error("Failed to fetch Velocity data:", err);
            alert(t("admin.dashboard.error.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!settingsId) return;
        setSaving(true);
        try {
            await pb.collection("velocity_settings").update(settingsId, settings);
            alert(t("admin.velocity.settings.success"));
        } catch (err) {
            console.error("Failed to save settings:", err);
            alert(t("admin.velocity.settings.error"));
        } finally {
            setSaving(false);
        }
    };

    const handleRestartProxy = async () => {
        if (!settingsId) return;
        if (!window.confirm(t("admin.velocity.actions.confirmRestart"))) return;

        setRestarting(true);
        try {
            // Toggle trigger to force update event even if value is same (though we use random string or timestamp usually)
            // Here we just set current timestamp
            await pb.collection("velocity_settings").update(settingsId, {
                restart_trigger: new Date().toISOString()
            });
            // We don't alert success immediately, we wait for effect or just show "Restarting..."
        } catch (err) {
            console.error("Failed to restart:", err);
            setRestarting(false);
            alert(t("admin.velocity.actions.restartError"));
        }
    };

    const handleTestConnection = async (serverId) => {
        setTestingMap(prev => ({ ...prev, [serverId]: true }));
        try {
            // Set status to pending to trigger daemon check
            await pb.collection("velocity_servers").update(serverId, { status: "pending" });
        } catch (err) {
            console.error("Failed to trigger test:", err);
            setTestingMap(prev => ({ ...prev, [serverId]: false }));
        }
    };

    const handleAddForcedHost = async () => {
        if (!newForcedHost.hostname || !newForcedHost.server) return;
        try {
            await pb.collection("velocity_forced_hosts").create(newForcedHost);
            setNewForcedHost({ hostname: "", server: "" });
            const list = await pb.collection("velocity_forced_hosts").getFullList({ sort: "hostname" });
            setForcedHosts(list);
        } catch (err) {
            console.error(err);
            alert(t("admin.velocity.actions.addError"));
        }
    };

    const handleDeleteForcedHost = async (id) => {
        if (!window.confirm(t("admin.velocity.actions.confirmDelete"))) return;
        try {
            await pb.collection("velocity_forced_hosts").delete(id);
            setForcedHosts(prev => prev.filter(h => h.id !== id));
        } catch (err) {
            console.error(err);
            alert(t("admin.velocity.actions.deleteError"));
        }
    };



    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !settingsId) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("velocity_jar", file);
            formData.append("jar_version", file.name); // Simple version tracking
            // Update version string if possible, or just let user do it. 
            // We'll update the 'jar_version' field to the filename specifically or user input
            // Ideally we would parse the JAR but that's hard in browser.
            // Let's just update the file.

            await pb.collection("velocity_settings").update(settingsId, formData);
            alert(t("admin.velocity.update.success"));
            fetchData();
        } catch (err) {
            console.error("Upload failed:", err);
            alert(t("admin.velocity.update.error"));
        } finally {
            setUploading(false);
        }
    };

    const StatusBadge = ({ status, ping }) => {
        if (status === 'online') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {t("admin.velocity.status.online")} ({ping}ms)
                </span>
            );
        }
        if (status === 'offline') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {t("admin.velocity.status.offline")}
                </span>
            );
        }
        if (status === 'pending') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t("admin.velocity.status.checking")}
                </span>
            );
        }
        return <span className="text-slate-400 text-xs">-</span>;
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500">
                <Activity className="w-8 h-8 mx-auto mb-4 animate-spin" />
                <p>{t("admin.velocity.loading")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t("admin.velocity.title")}</h2>
                    <p className="text-slate-500">{t("admin.velocity.subtitle")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRestartProxy}
                        disabled={restarting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {restarting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {restarting ? t("admin.velocity.restarting") : t("admin.velocity.restart")}
                    </button>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t("admin.velocity.refresh")}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="flex space-x-8">
                    {[
                        { id: "dashboard", label: t("admin.velocity.tabs.dashboard"), icon: LayoutDashboard },
                        { id: "servers", label: t("admin.velocity.tabs.servers"), icon: Server },
                        { id: "forced-hosts", label: t("admin.velocity.tabs.forcedHosts"), icon: Globe },
                        { id: "settings", label: t("admin.velocity.tabs.settings"), icon: Settings },
                        { id: "update", label: t("admin.velocity.tabs.update"), icon: Upload },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? "border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

                {/* DASHBOARD TAB */}
                {activeTab === "dashboard" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <h3 className="text-sm font-medium text-slate-500 mb-1">{t("admin.velocity.dashboard.status")}</h3>
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-semibold text-lg">{t("admin.velocity.dashboard.statusActive")}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">{t("admin.velocity.dashboard.statusDesc")}</p>
                            </div>

                            {/* Proxy Process Status */}
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <h3 className="text-sm font-medium text-slate-500 mb-1">{t("admin.velocity.dashboard.proxyStatus")}</h3>
                                <div className={`flex items-center gap-2 ${settings.proxy_status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                                    <Activity className="w-5 h-5" />
                                    <span className="font-semibold text-lg capitalize">
                                        {settings.proxy_status || "Unknown"}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    {t("admin.velocity.dashboard.proxyStatusDesc")}
                                    {settings.last_heartbeat && (
                                        <span className="block mt-1 opacity-70">
                                            {new Date(settings.last_heartbeat).toLocaleTimeString()}
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <h3 className="text-sm font-medium text-slate-500 mb-1">{t("admin.velocity.dashboard.servers")}</h3>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Server className="w-5 h-5" />
                                    <span className="font-semibold text-lg">{servers.length}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">{t("admin.velocity.dashboard.serversDesc")}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <h3 className="text-sm font-medium text-slate-500 mb-1">{t("admin.velocity.dashboard.port")}</h3>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Activity className="w-5 h-5" />
                                    <span className="font-semibold text-lg">{settings.bind_port}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">{t("admin.velocity.dashboard.portDesc")}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 rounded-lg p-6 border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-2">{t("admin.velocity.dashboard.nextSteps")}</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800/80">
                                <li>{t("admin.velocity.dashboard.step1")}</li>
                                <li>{t("admin.velocity.dashboard.step2")}</li>
                                <li>{t("admin.velocity.dashboard.step3")}</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* SERVERS TAB */}
                {activeTab === "servers" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">{t("admin.velocity.tabs.servers")}</h3>
                            <button
                                onClick={handleAddServer}
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
                                                            onClick={() => handleTestConnection(srv.id)}
                                                            disabled={testingMap[srv.id]}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                                            title={t("admin.velocity.testConnection")}
                                                        >
                                                            <Play className={`w-4 h-4 ${testingMap[srv.id] ? "animate-spin" : ""}`} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditServer(srv)}
                                                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                                            title={t("admin.velocity.modal.editTitle")}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteServer(srv.id)}
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
                        {/* Admin can add servers directly in PB dashboard for now, or we implement full CRUD here. 
                     Implementation Plan focused on Enchancement. Full CRUD code omitted to safely fit context, 
                     assuming user manages list via PB or we add Add button later if requested.
                     The previous file had basic CRUD hooks? No, it was placeholder.
                     If user needs CRUD, they can ask. The current request is enhancements.
                 */}
                    </div>
                )}

                {/* FORCED HOSTS TAB */}
                {activeTab === "forced-hosts" && (
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
                                    onChange={(e) => setNewForcedHost({ ...newForcedHost, server: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                >
                                    <option value="">{t("admin.velocity.forcedHosts.selectServer")}</option>
                                    {servers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.address})</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleAddForcedHost}
                                disabled={!newForcedHost.hostname || !newForcedHost.server}
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
                                        const targetServer = servers.find(s => s.id === host.server);
                                        return (
                                            <tr key={host.id} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-medium font-mono text-slate-700">{host.hostname}</td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {targetServer ? (
                                                        <span className="inline-flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${targetServer.status === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                                            {targetServer.name}
                                                        </span>
                                                    ) : host.server}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleDeleteForcedHost(host.id)} className="text-slate-400 hover:text-red-600 transition-colors">
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
                )}

                {/* SETTINGS TAB */}
                {activeTab === "settings" && (
                    <div className="max-w-2xl space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {t("admin.velocity.settings.bindPort")}
                                </label>
                                <input
                                    type="text"
                                    value={settings.bind_port}
                                    onChange={(e) => setSettings({ ...settings, bind_port: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)]/20 focus:border-[var(--color-brand-blue)] outline-none transition-all"
                                    placeholder="25577"
                                />
                                <p className="mt-1 text-xs text-slate-400">{t("admin.velocity.settings.defaultPort")}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {t("admin.velocity.settings.maxPlayers")}
                                </label>
                                <input
                                    type="number"
                                    value={settings.max_players}
                                    onChange={(e) => setSettings({ ...settings, max_players: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)]/20 focus:border-[var(--color-brand-blue)] outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t("admin.velocity.settings.motd")}
                            </label>
                            <textarea
                                value={settings.motd}
                                onChange={(e) => setSettings({ ...settings, motd: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)]/20 focus:border-[var(--color-brand-blue)] outline-none transition-all font-mono text-sm"
                                rows="2"
                            />
                            <p className="mt-1 text-xs text-slate-400">{t("admin.velocity.settings.motdHint")}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t("admin.velocity.settings.secret")}
                            </label>
                            <input
                                type="text"
                                value={settings.forwarding_secret}
                                onChange={(e) => setSettings({ ...settings, forwarding_secret: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-blue)]/20 focus:border-[var(--color-brand-blue)] outline-none transition-all font-mono text-sm bg-slate-50"
                            />
                            <p className="mt-1 text-xs text-slate-400">{t("admin.velocity.settings.secretHint")}</p>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <h3 className="font-medium text-slate-800 mb-4">{t("admin.velocity.settings.advanced")}</h3>

                            <div className="space-y-4">
                                {/* Online Mode */}
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="online_mode"
                                        checked={settings.online_mode}
                                        onChange={(e) => setSettings({ ...settings, online_mode: e.target.checked })}
                                        className="mt-1"
                                    />
                                    <div>
                                        <label htmlFor="online_mode" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.onlineMode")}</label>
                                        <p className="text-xs text-slate-400">{t("admin.velocity.settings.onlineModeHint")}</p>
                                    </div>
                                </div>

                                {/* Forwarding Mode */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t("admin.velocity.settings.forwardingMode")}</label>
                                    <select
                                        value={settings.player_info_forwarding_mode}
                                        onChange={(e) => setSettings({ ...settings, player_info_forwarding_mode: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                                    >
                                        <option value="modern">{t("admin.velocity.settings.forwardingModeOptions.modern")}</option>
                                        <option value="legacy">{t("admin.velocity.settings.forwardingModeOptions.legacy")}</option>
                                        <option value="bungeeguard">{t("admin.velocity.settings.forwardingModeOptions.bungeeguard")}</option>
                                        <option value="none">{t("admin.velocity.settings.forwardingModeOptions.none")}</option>
                                    </select>
                                </div>

                                {/* Advanced Network Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="haproxy_protocol"
                                            checked={settings.haproxy_protocol || false}
                                            onChange={(e) => setSettings({ ...settings, haproxy_protocol: e.target.checked })}
                                            className="mt-1"
                                        />
                                        <div>
                                            <label htmlFor="haproxy_protocol" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.haproxyProtocol")}</label>
                                            <p className="text-xs text-slate-400">{t("admin.velocity.settings.haproxyProtocolHint")}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="accepts_transfers"
                                            checked={settings.accepts_transfers || false}
                                            onChange={(e) => setSettings({ ...settings, accepts_transfers: e.target.checked })}
                                            className="mt-1"
                                        />
                                        <div>
                                            <label htmlFor="accepts_transfers" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.acceptsTransfers")}</label>
                                            <p className="text-xs text-slate-400">{t("admin.velocity.settings.acceptsTransfersHint")}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="announce_forge"
                                            checked={settings.announce_forge || false}
                                            onChange={(e) => setSettings({ ...settings, announce_forge: e.target.checked })}
                                            className="mt-1"
                                        />
                                        <div>
                                            <label htmlFor="announce_forge" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.announceForge")}</label>
                                            <p className="text-xs text-slate-400">{t("admin.velocity.settings.announceForgeHint")}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="show_ping_requests"
                                            checked={settings.show_ping_requests || false}
                                            onChange={(e) => setSettings({ ...settings, show_ping_requests: e.target.checked })}
                                            className="mt-1"
                                        />
                                        <div>
                                            <label htmlFor="show_ping_requests" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.showPingRequests")}</label>
                                            <p className="text-xs text-slate-400">{t("admin.velocity.settings.showPingRequestsHint")}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {t("admin.velocity.settings.connectionTimeout")}
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.connection_timeout || 5000}
                                            onChange={(e) => setSettings({ ...settings, connection_timeout: parseInt(e.target.value) || 5000 })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                                        />
                                        <p className="mt-1 text-xs text-slate-400">{t("admin.velocity.settings.connectionTimeoutHint")}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {t("admin.velocity.settings.readTimeout")}
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.read_timeout || 30000}
                                            onChange={(e) => setSettings({ ...settings, read_timeout: parseInt(e.target.value) || 30000 })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                                        />
                                        <p className="mt-1 text-xs text-slate-400">{t("admin.velocity.settings.readTimeoutHint")}</p>
                                    </div>
                                </div>

                                <h4 className="font-medium text-slate-800 mt-6 mb-3">{t("admin.velocity.settings.performanceSecurity")}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {t("admin.velocity.settings.compressionThreshold")}
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.compression_threshold !== undefined ? settings.compression_threshold : 256}
                                            onChange={(e) => setSettings({ ...settings, compression_threshold: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                                        />
                                        <p className="mt-1 text-xs text-slate-400">{t("admin.velocity.settings.compressionThresholdHint")}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {t("admin.velocity.settings.compressionLevel")}
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.compression_level !== undefined ? settings.compression_level : -1}
                                            onChange={(e) => setSettings({ ...settings, compression_level: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                                        />
                                        <p className="mt-1 text-xs text-slate-400">{t("admin.velocity.settings.compressionLevelHint")}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {t("admin.velocity.settings.loginRatelimit")}
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.login_ratelimit || 3000}
                                            onChange={(e) => setSettings({ ...settings, login_ratelimit: parseInt(e.target.value) || 3000 })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                                        />
                                        <p className="mt-1 text-xs text-slate-400">{t("admin.velocity.settings.loginRatelimitHint")}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="tcp_fast_open"
                                            checked={settings.tcp_fast_open || false}
                                            onChange={(e) => setSettings({ ...settings, tcp_fast_open: e.target.checked })}
                                            className="mt-1"
                                        />
                                        <div>
                                            <label htmlFor="tcp_fast_open" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.tcpFastOpen")}</label>
                                            <p className="text-xs text-slate-400">{t("admin.velocity.settings.tcpFastOpenHint")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="bungee_plugin"
                                            checked={settings.bungee_plugin_message_channel !== undefined ? settings.bungee_plugin_message_channel : true}
                                            onChange={(e) => setSettings({ ...settings, bungee_plugin_message_channel: e.target.checked })}
                                            className="mt-1"
                                        />
                                        <div>
                                            <label htmlFor="bungee_plugin" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.bungeePluginChannel")}</label>
                                            <p className="text-xs text-slate-400">{t("admin.velocity.settings.bungeePluginChannelHint")}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Force Key Auth */}
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="force_key"
                                        checked={settings.force_key_authentication}
                                        onChange={(e) => setSettings({ ...settings, force_key_authentication: e.target.checked })}
                                        className="mt-1"
                                    />
                                    <div>
                                        <label htmlFor="force_key" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.forceKey")}</label>
                                        <p className="text-xs text-slate-400">{t("admin.velocity.settings.forceKeyHint")}</p>
                                    </div>
                                </div>

                                {/* Prevent Client Proxy */}
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="prevent_proxy"
                                        checked={settings.prevent_client_proxy_connections}
                                        onChange={(e) => setSettings({ ...settings, prevent_client_proxy_connections: e.target.checked })}
                                        className="mt-1"
                                    />
                                    <div>
                                        <label htmlFor="prevent_proxy" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.preventProxy")}</label>
                                        <p className="text-xs text-slate-400">{t("admin.velocity.settings.preventProxyHint")}</p>
                                    </div>
                                </div>

                                {/* Kick Existing */}
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="kick_existing"
                                        checked={settings.kick_existing_players}
                                        onChange={(e) => setSettings({ ...settings, kick_existing_players: e.target.checked })}
                                        className="mt-1"
                                    />
                                    <div>
                                        <label htmlFor="kick_existing" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.kickExisting")}</label>
                                        <p className="text-xs text-slate-400">{t("admin.velocity.settings.kickExistingHint")}</p>
                                    </div>
                                </div>

                                {/* Expose Proxy Commands */}
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="expose_proxy_commands"
                                        checked={settings.expose_proxy_commands || false}
                                        onChange={(e) => setSettings({ ...settings, expose_proxy_commands: e.target.checked })}
                                        className="mt-1"
                                    />
                                    <div>
                                        <label htmlFor="expose_proxy_commands" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.exposeProxyCommands")}</label>
                                        <p className="text-xs text-slate-400">{t("admin.velocity.settings.exposeProxyCommandsHint")}</p>
                                    </div>
                                </div>

                                {/* QUERY SETTINGS */}
                                <h4 className="font-medium text-slate-800 mt-6 mb-3">{t("admin.velocity.settings.query")}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 md:col-span-2">
                                        <input
                                            type="checkbox"
                                            id="query_enabled"
                                            checked={settings.query_enabled || false}
                                            onChange={(e) => setSettings({ ...settings, query_enabled: e.target.checked })}
                                            className="mt-1"
                                        />
                                        <div>
                                            <label htmlFor="query_enabled" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.queryEnabled")}</label>
                                            <p className="text-xs text-slate-400">{t("admin.velocity.settings.queryEnabledHint")}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {t("admin.velocity.settings.queryPort")}
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.query_port || 25577}
                                            onChange={(e) => setSettings({ ...settings, query_port: parseInt(e.target.value) || 25577 })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {t("admin.velocity.settings.queryMap")}
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.query_map || "Velocity"}
                                            onChange={(e) => setSettings({ ...settings, query_map: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-sm"
                                        />
                                    </div>
                                    <div className="flex items-start gap-3 md:col-span-2">
                                        <input
                                            type="checkbox"
                                            id="query_show_plugins"
                                            checked={settings.query_show_plugins || false}
                                            onChange={(e) => setSettings({ ...settings, query_show_plugins: e.target.checked })}
                                            className="mt-1"
                                        />
                                        <div>
                                            <label htmlFor="query_show_plugins" className="block text-sm font-medium text-slate-700">{t("admin.velocity.settings.queryShowPlugins")}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="px-6 py-2.5 bg-[var(--color-brand-blue)] text-white font-medium rounded-lg hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70 flex items-center gap-2"
                            >
                                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                                {saving ? t("admin.velocity.settings.saving") : t("admin.velocity.settings.save")}
                            </button>
                        </div>
                    </div>
                )}

                {/* UPDATE TAB */}
                {activeTab === "update" && (
                    <div className="max-w-xl space-y-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-amber-900">{t("admin.velocity.update.warningTitle")}</h4>
                                <p className="text-sm text-amber-800/80 mt-1">{t("admin.velocity.update.warningDesc")}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t("admin.velocity.update.currentVersion")}</label>
                                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center justify-between">
                                    <span className="font-mono text-sm">
                                        {settings.velocity_jar ? t("admin.velocity.update.customJar") : t("admin.velocity.update.defaultJar")}
                                    </span>
                                </div>
                            </div>
                            {settings.jar_version && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t("admin.velocity.update.versionLabel")}</label>
                                    <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm">
                                        {settings.jar_version}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <h3 className="font-medium text-slate-800 mb-4">{t("admin.velocity.update.uploadTitle")}</h3>

                            <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors group">
                                <input
                                    type="file"
                                    accept=".jar"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-blue-600">
                                    {uploading ? (
                                        <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
                                    ) : (
                                        <Upload className="w-10 h-10" />
                                    )}
                                    <p className="font-medium">{uploading ? t("admin.velocity.update.uploading") : t("admin.velocity.update.clickToUpload")}</p>
                                    <p className="text-xs text-slate-400">{t("admin.velocity.update.maxSize")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            {/* Add/Edit Server Modal */}
            {
                isServerModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800">
                                    {editingServer ? t("admin.velocity.modal.editTitle") : t("admin.velocity.modal.addTitle")}
                                </h3>
                                <button
                                    onClick={() => setIsServerModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
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
                                    onClick={() => setIsServerModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    {t("admin.velocity.modal.cancel")}
                                </button>
                                <button
                                    onClick={handleSaveServer}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-70 flex items-center gap-2"
                                >
                                    {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                                    {t("admin.velocity.modal.save")}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
