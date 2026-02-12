import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import pb from "../lib/pocketbase";

export default function useVelocityData() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [settings, setSettings] = useState(null);
    const [servers, setServers] = useState([]);
    const [forcedHosts, setForcedHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [restarting, setRestarting] = useState(false);
    const [testingMap, setTestingMap] = useState({});
    const [newServer, setNewServer] = useState({ name: "", address: "", try_order: 0, is_try_server: false });
    const [editingServer, setEditingServer] = useState(null);
    const [isServerModalOpen, setIsServerModalOpen] = useState(false);
    const [newForcedHost, setNewForcedHost] = useState({ hostname: "", server: "" });
    const [settingsId, setSettingsId] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const settingsList = await pb.collection("velocity_settings").getList(1, 1);
            if (settingsList.items.length > 0) {
                setSettings(settingsList.items[0]);
                setSettingsId(settingsList.items[0].id);
            }
            const serversList = await pb.collection("velocity_servers").getFullList({ sort: "try_order" });
            setServers(serversList || []);
            const forcedHostsList = await pb.collection("velocity_forced_hosts").getFullList({ sort: "hostname" });
            setForcedHosts(forcedHostsList || []);
        } catch (err) {
            console.error("Failed to fetch Velocity data:", err);
            alert(t("admin.dashboard.error.loadFailed"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();

        pb.collection('velocity_settings').subscribe('*', (e) => {
            if (e.action === "update") {
                setSettings(e.record);
                if (!e.record.restart_trigger) {
                    setRestarting(false);
                }
            }
        });

        pb.collection('velocity_servers').subscribe('*', (e) => {
            if (e.action === "update") {
                setServers(prev => prev.map(s => s.id === e.record.id ? e.record : s));
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
    }, [fetchData]);

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
            is_try_server: server.is_try_server,
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
            await pb.collection("velocity_settings").update(settingsId, {
                restart_trigger: new Date().toISOString(),
            });
        } catch (err) {
            console.error("Failed to restart:", err);
            setRestarting(false);
            alert(t("admin.velocity.actions.restartError"));
        }
    };

    const handleTestConnection = async (serverId) => {
        setTestingMap(prev => ({ ...prev, [serverId]: true }));
        try {
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
            formData.append("jar_version", file.name);
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

    return {
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
    };
}
