import { useState, useEffect } from "react";
import { Search, X, Loader2, Image as ImageIcon } from "lucide-react";
import pb from "../../lib/pocketbase";
import { useTranslation } from "react-i18next";

/**
 * Media Library Modal Component
 * 媒体库选择器模态框
 * 
 * @param {boolean} isOpen - 是否显示
 * @param {Function} onClose - 关闭回调
 * @param {Function} onSelect - 选择回调 (mediaId) => void
 */
export default function MediaLibraryModal({ isOpen, onClose, onSelect }) {
  const { t } = useTranslation();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch media list
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const result = await pb.collection("media").getList(1, 200, {
        sort: "-created",
        filter: 'file != ""', // Only get items with files
      });
      setMediaList(result.items);
    } catch (error) {
      console.error("获取媒体列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  // Get file URL
  const getFileUrl = (record, thumb = false) => {
    if (!record.file) return "";
    const baseUrl = import.meta.env.VITE_POCKETBASE_URL?.replace(/\/$/, "") || "";
    const url = `${baseUrl}/api/files/media/${record.id}/${record.file}`;
    if (thumb) {
      return `${url}?thumb=100x100`;
    }
    return url;
  };

  // Check if file is image
  const isImage = (fileName) => {
    if (!fileName) return false;
    const lowerName = fileName.toLowerCase();
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(lowerName);
  };

  // Filter media
  const filteredMedia = mediaList.filter((item) => {
    // Only show images
    if (!isImage(item.file)) return false;

    // Search filter
    if (searchQuery.trim()) {
      const fileName = item.file || "";
      if (!fileName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Handle select
  const handleSelect = (item) => {
    if (onSelect) {
      onSelect(item.id);
    }
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">{t("admin.mediaLibraryModal.title")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("admin.mediaLibraryModal.search")}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {searchQuery ? t("admin.mediaLibraryModal.noResults") : t("admin.mediaLibraryModal.empty")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredMedia.map((item) => {
                const fileUrl = getFileUrl(item);
                const thumbUrl = getFileUrl(item, true);

                return (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-lg border border-slate-200 bg-slate-50 overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                    onClick={() => handleSelect(item)}
                  >
                    <img
                      src={thumbUrl}
                      alt={item.file || t("admin.mediaLibraryModal.image")}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = fileUrl;
                      }}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs px-2 py-1 bg-black/60 rounded">
                        {t("admin.mediaLibraryModal.clickToSelect")}
                      </div>
                    </div>
                    {/* Filename */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-xs text-white truncate">{item.file || t("admin.mediaLibraryModal.unknown")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
