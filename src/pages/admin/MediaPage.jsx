import AdminLayout from "../../components/admin/AdminLayout";
import MediaManager from "../../components/admin/media/MediaManager";

/**
 * 资源库页面
 * 独立管理所有上传的资源
 */
export default function MediaPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">资源库</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理所有上传的图片、视频和其他文件
          </p>
        </div>
      </div>

      <MediaManager />
    </div>
  );
}

