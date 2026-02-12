import { CheckCircle, Activity, Server } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DashboardTab({ settings, servers }) {
    const { t } = useTranslation();

    return (
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
    );
}
