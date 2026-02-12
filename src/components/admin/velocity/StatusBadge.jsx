import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StatusBadge({ status, ping }) {
    const { t } = useTranslation();

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
}
