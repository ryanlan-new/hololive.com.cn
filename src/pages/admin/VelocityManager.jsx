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
    HardDrive
} from "lucide-react";

export default function VelocityManager() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [settings, setSettings] = useState(null);
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newServer, setNewServer] = useState({ name: "", address: "", try_order: 0, is_try_server: false });
    const [settingsId, setSettingsId] = useState(null);

    // Fetch initial data
    useEffect(() => {
        fetchData();
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
            setServers(serversList);
        } catch (err) {
            console.error("Failed to fetch Velocity data:", err);
            alert("Failed to load data. Please ensure the backend migration has run.");
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

    const handleAddServer = async () => {
        if (!newServer.name || !newServer.address) return;
        try {
            await pb.collection("velocity_servers").create(newServer);
            setNewServer({ name: "", address: "", try_order: 0, is_try_server: false });
            fetchData(); // Refresh list
        } catch (err) {
            console.error("Failed to add server:", err);
            alert("Error adding server.");
        }
    };

    const handleDeleteServer = async (id) => {
        if (!window.confirm(t("admin.velocity.servers.table.confirmDelete"))) return;
        try {
            await pb.collection("velocity_servers").delete(id);
            fetchData();
        } catch (err) {
            console.error("Failed to delete server:", err);
            alert("Error deleting server.");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !settingsId) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("velocity_jar", file);
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

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500">
                <Activity className="w-8 h-8 mx-auto mb-4 animate-spin" />
                <p>Loading Velocity Configuration...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Server className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Velocity Management</h1>
                        <p className="text-sm text-slate-500">Manage your local Minecraft Proxy server</p>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                {[
                    { id: "dashboard", label: "Dashboard", icon: Activity },
                    { id: "servers", label: "Servers", icon: Server },
                    { id: "settings", label: "Settings", icon: Settings },
                    { id: "update", label: "Core Update", icon: HardDrive },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

                {/* DASHBOARD TAB */}
                {activeTab === "dashboard" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <h3 className="font-semibold text-green-900">Status</h3>
                                </div>
                                <p className="text-sm text-green-700">Configuration Active</p>
                                <p className="text-xs text-green-600 mt-1">Managed via Sync Script</p>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Server className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-semibold text-blue-900">Servers</h3>
                                </div>
                                <p className="text-2xl font-bold text-blue-700">{servers.length}</p>
                                <p className="text-xs text-blue-600 mt-1">Backend Servers Configured</p>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Activity className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-purple-900">Port</h3>
                                </div>
                                <p className="text-2xl font-bold text-purple-700">{settings?.bind_port || 25577}</p>
                                <p className="text-xs text-purple-600 mt-1">Listening Port</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="font-medium text-slate-900 mb-2">Next Steps</h3>
                            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                <li>Ensure the sync script is running on the server.</li>
                                <li>Make changes in the "Servers" or "Settings" tab.</li>
                                <li>The script will automatically detect changes and restart Velocity.</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* SERVERS TAB */}
                {activeTab === "servers" && (
                    <div className="space-y-6">
                        <div className="flex items-end gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t("admin.velocity.servers.name")}</label>
                                <input
                                    type="text"
                                    value={newServer.name}
                                    onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g. lobby"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t("admin.velocity.servers.address")}</label>
                                <input
                                    type="text"
                                    value={newServer.address}
                                    onChange={(e) => setNewServer({ ...newServer, address: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g. 127.0.0.1:30001"
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-medium text-slate-500 mb-1">{t("admin.velocity.servers.order")}</label>
                                <input
                                    type="number"
                                    value={newServer.try_order}
                                    onChange={(e) => setNewServer({ ...newServer, try_order: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex items-center mb-3">
                                <input
                                    type="checkbox"
                                    checked={newServer.is_try_server}
                                    onChange={(e) => setNewServer({ ...newServer, is_try_server: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    id="is_try"
                                />
                                <label htmlFor="is_try" className="ml-2 text-sm text-slate-600">{t("admin.velocity.servers.tryFirst")}</label>
                            </div>
                            <button
                                onClick={handleAddServer}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                            >
                                <Plus className="w-4 h-4" />
                                {t("admin.velocity.servers.add")}
                            </button>
                        </div>

                        <div className="overflow-hidden border border-slate-200 rounded-lg">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t("admin.velocity.servers.table.order")}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t("admin.velocity.servers.table.name")}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t("admin.velocity.servers.table.address")}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t("admin.velocity.servers.table.tryFirst")}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t("admin.velocity.servers.table.actions")}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {servers.map((server) => (
                                        <tr key={server.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{server.try_order}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{server.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{server.address}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {server.is_try_server ? <span className="text-green-600 font-bold">{t("admin.velocity.servers.table.yes")}</span> : t("admin.velocity.servers.table.no")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(t("admin.velocity.servers.table.confirmDelete"))) handleDeleteServer(server.id);
                                                    }}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {servers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                                {t("admin.velocity.servers.table.empty")}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === "settings" && settings && (
                    <div className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t("admin.velocity.settings.bindPort")}</label>
                                <input
                                    type="text"
                                    value={settings.bind_port}
                                    onChange={(e) => setSettings({ ...settings, bind_port: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <p className="mt-1 text-xs text-slate-500">{t("admin.velocity.settings.defaultPort")}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t("admin.velocity.settings.maxPlayers")}</label>
                                <input
                                    type="number"
                                    value={settings.max_players}
                                    onChange={(e) => setSettings({ ...settings, max_players: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t("admin.velocity.settings.motd")}</label>
                            <textarea
                                value={settings.motd}
                                onChange={(e) => setSettings({ ...settings, motd: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                rows="3"
                            />
                            <p className="mt-1 text-xs text-slate-500">{t("admin.velocity.settings.motdHint")}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t("admin.velocity.settings.secret")}</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={settings.forwarding_secret}
                                    onChange={(e) => setSettings({ ...settings, forwarding_secret: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                                />
                            </div>
                            <p className="mt-1 text-xs text-red-500">{t("admin.velocity.settings.secretHint")}</p>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <button
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? t("admin.velocity.settings.saving") : t("admin.velocity.settings.save")}
                            </button>
                        </div>
                    </div>
                )}

                {/* CORE UPDATE TAB */}
                {activeTab === "update" && settings && (
                    <div className="space-y-8 max-w-2xl">
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-yellow-900">{t("admin.velocity.update.warningTitle")}</h3>
                                <p className="text-sm text-yellow-800 mt-1">
                                    {t("admin.velocity.update.warningDesc")}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-slate-900 mb-4">{t("admin.velocity.update.currentVersion")}</h3>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <HardDrive className="w-8 h-8 text-slate-400" />
                                <div>
                                    <p className="font-medium text-slate-900">{settings.velocity_jar ? t("admin.velocity.update.customJar") : t("admin.velocity.update.defaultJar")}</p>
                                    <p className="text-sm text-slate-500">{t("admin.velocity.update.versionLabel")}: {settings.jar_version || "Unknown"}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-slate-900 mb-4">{t("admin.velocity.update.uploadTitle")}</h3>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
                                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-slate-700 mb-1">
                                    {t("admin.velocity.update.clickToUpload")}
                                </p>
                                <p className="text-xs text-slate-500 mb-4">
                                    {t("admin.velocity.update.maxSize")}
                                </p>
                                <input
                                    type="file"
                                    accept=".jar"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                    cursor-pointer mx-auto max-w-[200px]"
                                />
                                {uploading && <p className="text-sm text-indigo-600 mt-2 font-medium">{t("admin.velocity.update.uploading")}</p>}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
