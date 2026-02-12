import AdminLayout from "../../components/admin/AdminLayout";
import MediaManager from "../../components/admin/media/MediaManager";
import { useTranslation } from "react-i18next";

/**
 * 资源库页面
 * 独立管理所有上传的资源
 */
export default function MediaPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("admin.media.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("admin.media.subtitle")}
          </p>
        </div>
      </div>

      <MediaManager />
    </div>
  );
}
