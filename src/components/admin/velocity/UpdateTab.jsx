import { AlertTriangle, Upload, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function UpdateTab({ settings, uploading, onUpload }) {
    const { t } = useTranslation();

    return (
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
                        onChange={onUpload}
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
    );
}
