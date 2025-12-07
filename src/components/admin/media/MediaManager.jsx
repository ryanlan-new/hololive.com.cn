import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Search,
  Image as ImageIcon,
  Video,
  File,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import pb from "../../../lib/pocketbase";

/**
 * 通用资源管理组件
 * 可以作为独立页面使用，也可以在 Modal 中作为选择器使用
 *
 * @param {Function} onSelect - 可选，选择文件时的回调函数 (url) => void
 * @param {Function} closeModal - 可选，关闭模态框的函数
 */
export default function MediaManager({ onSelect, closeModal }) {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all"); // all, images, videos, files
  const [selectedMedia, setSelectedMedia] = useState(null);
  const fileInputRef = useRef(null);
  const baseUrl = import.meta.env.VITE_POCKETBASE_URL?.replace(/\/$/, "") || "";

  // 获取媒体列表
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const result = await pb.collection("media").getList(1, 200, {
        sort: "-created",
      });
      setMediaList(result.items);
    } catch (error) {
      console.error("获取媒体列表失败:", error);
      alert("获取媒体列表失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // 上传文件
  const handleUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      await pb.collection("media").create(formData);
      await fetchMedia(); // 刷新列表
    } catch (error) {
      console.error("上传失败:", error);
      alert("上传失败，请重试");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 删除文件
  const handleDelete = async (id) => {
    if (!window.confirm("确定要删除这个文件吗？此操作不可恢复。")) {
      return;
    }

    try {
      await pb.collection("media").delete(id);
      await fetchMedia(); // 刷新列表
      setSelectedMedia(null);
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败，请重试");
    }
  };

  // 获取文件 URL
  const getFileUrl = (record, thumb = false) => {
    if (!record.file) return "";
    const url = `${baseUrl}/api/files/media/${record.id}/${record.file}`;
    if (thumb && getFileType(record.file) === "image") {
      return `${url}?thumb=100x100`;
    }
    return url;
  };

  // 判断文件类型（从文件名推断）
  const getFileType = (fileName) => {
    if (!fileName) return "file";
    const lowerName = fileName.toLowerCase();
    // 图片扩展名
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(lowerName)) {
      return "image";
    }
    // 视频扩展名
    if (/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(lowerName)) {
      return "video";
    }
    return "file";
  };

  // 获取文件图标
  const getFileIcon = (fileName) => {
    const type = getFileType(fileName);
    switch (type) {
      case "image":
        return ImageIcon;
      case "video":
        return Video;
      default:
        return File;
    }
  };

  // 过滤文件
  const filteredMedia = mediaList.filter((item) => {
    const fileName = item.file || "";
    
    // 选择模式：只显示图片
    if (onSelect) {
      if (getFileType(fileName) !== "image") return false;
    }
    
    // 分类过滤
    if (category !== "all") {
      const type = getFileType(fileName);
      if (category === "images" && type !== "image") return false;
      if (category === "videos" && type !== "video") return false;
      if (category === "files" && (type === "image" || type === "video")) {
        return false;
      }
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      if (!fileName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // 处理文件选择
  const handleFileClick = (item) => {
    if (onSelect) {
      // 选择模式：触发回调并关闭模态框
      const url = getFileUrl(item);
      onSelect(url);
      if (closeModal) closeModal();
    } else {
      // 管理模式：显示详情
      setSelectedMedia(item);
    }
  };

  return (
    <div className="space-y-4">
      {/* 顶部工具栏 */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* 搜索框 */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文件..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/30"
          />
        </div>

        {/* 分类 Tabs（选择模式下隐藏） */}
        {!onSelect && (
          <div className="flex items-center gap-2">
            {[
              { key: "all", label: "全部" },
              { key: "images", label: "图片" },
              { key: "videos", label: "视频" },
              { key: "files", label: "其他" },
            ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCategory(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === tab.key
                  ? "bg-[var(--color-brand-blue)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
            ))}
          </div>
        )}

        {/* 上传按钮 */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-brand-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                上传文件
              </>
            )}
          </button>
        </div>
      </div>

      {/* 文件网格 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            {searchQuery || category !== "all"
              ? "没有找到符合条件的文件"
              : "还没有上传任何文件"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item) => {
            const fileName = item.file || "";
            const fileType = getFileType(fileName);
            const Icon = getFileIcon(fileName);
            const fileUrl = getFileUrl(item);
            const thumbUrl = getFileUrl(item, true);

            return (
              <div
                key={item.id}
                className="group relative aspect-square rounded-xl border border-slate-200 bg-slate-50 overflow-hidden cursor-pointer hover:border-[var(--color-brand-blue)] hover:shadow-md transition-all"
                onClick={() => handleFileClick(item)}
              >
                {fileType === "image" ? (
                  <img
                    src={thumbUrl}
                    alt={fileName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = fileUrl;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <Icon className="w-12 h-12 text-slate-400" />
                  </div>
                )}

                {/* 悬停遮罩 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  {!onSelect && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 文件名（底部） */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">{fileName}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 文件详情 Modal（管理模式） */}
      {selectedMedia && !onSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">文件详情</h3>
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6">
              {getFileType(selectedMedia.file) === "image" ? (
                <img
                  src={getFileUrl(selectedMedia)}
                  alt={selectedMedia.file || "文件"}
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center py-20 bg-slate-50 rounded-lg">
                  {(() => {
                    const Icon = getFileIcon(selectedMedia.file);
                    return <Icon className="w-24 h-24 text-slate-400" />;
                  })()}
                </div>
              )}

              {/* 文件信息 */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">文件名：</span>
                  <span className="text-slate-900 font-mono">{selectedMedia.file || "未知"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">上传时间：</span>
                  <span className="text-slate-900">
                    {new Date(selectedMedia.created).toLocaleString("zh-CN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">文件 URL：</span>
                  <span className="text-slate-900 font-mono text-xs truncate max-w-md">
                    {getFileUrl(selectedMedia)}
                  </span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getFileUrl(selectedMedia));
                    alert("URL 已复制到剪贴板");
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  复制 URL
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  删除文件
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

