import {
    Server,
    Settings,
    Upload,
    RefreshCw,
    Activity,
    LayoutDashboard,
    Globe
} from "lucide-react";
import { useTranslation } from "react-i18next";
import useVelocityData from "../../hooks/useVelocityData";
import DashboardTab from "../../components/admin/velocity/DashboardTab";
import ServersTab from "../../components/admin/velocity/ServersTab";
import ForcedHostsTab from "../../components/admin/velocity/ForcedHostsTab";
import SettingsTab from "../../components/admin/velocity/SettingsTab";
import UpdateTab from "../../components/admin/velocity/UpdateTab";
import ServerModal from "../../components/admin/velocity/ServerModal";

export default function VelocityManager() {
    const { t } = useTranslation();
    const {
        activeTab, setActiveTab,
        settings, setSettings,
        servers, forcedHosts,
        loading, saving, uploading, restarting,
        testingMap,
        newServer, setNewServer,
        editingServer,
        isServerModalOpen, setIsServerModalOpen,
        newForcedHost, setNewForcedHost,
        fetchData,
        handleAddServer, handleEditServer, handleDeleteServer, handleSaveServer,
        handleSaveSettings, handleRestartProxy, handleTestConnection,
        handleAddForcedHost, handleDeleteForcedHost, handleFileUpload,
    } = useVelocityData();

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500">
                <Activity className="w-8 h-8 mx-auto mb-4 animate-spin" />
                <p>{t("admin.velocity.loading")}</p>
            </div>
        );
    }

    const tabs = [
        { id: "dashboard", label: t("admin.velocity.tabs.dashboard"), icon: LayoutDashboard },
        { id: "servers", label: t("admin.velocity.tabs.servers"), icon: Server },
        { id: "forced-hosts", label: t("admin.velocity.tabs.forcedHosts"), icon: Globe },
        { id: "settings", label: t("admin.velocity.tabs.settings"), icon: Settings },
        { id: "update", label: t("admin.velocity.tabs.update"), icon: Upload },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t("admin.velocity.title")}</h2>
                    <p className="text-slate-500">{t("admin.velocity.subtitle")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleRestartProxy} disabled={restarting} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${restarting ? "animate-spin" : ""}`} />
                        {restarting ? t("admin.velocity.restarting") : t("admin.velocity.restart")}
                    </button>
                    <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                        {t("admin.velocity.refresh")}
                    </button>
                </div>
            </div>

            <div className="border-b border-slate-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? "border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}>
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {activeTab === "dashboard" && <DashboardTab settings={settings} servers={servers} />}
                {activeTab === "servers" && <ServersTab servers={servers} testingMap={testingMap} onTest={handleTestConnection} onAdd={handleAddServer} onEdit={handleEditServer} onDelete={handleDeleteServer} />}
                {activeTab === "forced-hosts" && <ForcedHostsTab forcedHosts={forcedHosts} servers={servers} newForcedHost={newForcedHost} setNewForcedHost={setNewForcedHost} onAdd={handleAddForcedHost} onDelete={handleDeleteForcedHost} />}
                {activeTab === "settings" && <SettingsTab settings={settings} setSettings={setSettings} saving={saving} onSave={handleSaveSettings} />}
                {activeTab === "update" && <UpdateTab settings={settings} uploading={uploading} onUpload={handleFileUpload} />}
            </div>

            <ServerModal isOpen={isServerModalOpen} editingServer={editingServer} newServer={newServer} setNewServer={setNewServer} saving={saving} onSave={handleSaveServer} onClose={() => setIsServerModalOpen(false)} />
        </div>
    );
}
