import { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import pb from "../../lib/pocketbase";
import MediaLibraryModal from "./MediaLibraryModal";

/**
 * ImagePicker Component
 * 可重用的图片选择器组件
 * 
 * @param {string} value - 当前选中的媒体 ID（Relation ID）
 * @param {Function} onChange - 选择回调 (mediaId) => void
 * @param {string} previewUrl - 可选的旧版 URL（用于向后兼容）
 * @param {string} label - 标签文本
 */
export default function ImagePicker({ value, onChange, previewUrl, label = "图片" }) {
  const [uploading, setUploading] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const baseUrl = import.meta.env.VITE_POCKETBASE_URL?.replace(/\/$/, "") || "";

  // Load preview from media collection
  useEffect(() => {
    const loadPreview = async () => {
      if (value) {
        try {
          const mediaRecord = await pb.collection("media").getOne(value);
          if (mediaRecord && mediaRecord.file) {
            const url = `${baseUrl}/api/files/media/${mediaRecord.id}/${mediaRecord.file}`;
            setPreview({ url, filename: mediaRecord.file });
          }
        } catch (error) {
          console.error("Failed to load media preview:", error);
          // Fallback to legacy URL if available
          if (previewUrl) {
            setPreview({ url: previewUrl, filename: null });
          } else {
            setPreview(null);
          }
        }
      } else if (previewUrl) {
        // Use legacy URL if no relation ID
        setPreview({ url: previewUrl, filename: null });
      } else {
        setPreview(null);
      }
    };

    loadPreview();
  }, [value, previewUrl, baseUrl]);

  // Handle file upload
  const handleUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // Upload to media collection
      const record = await pb.collection("media").create(formData);

      // Return the ID to parent
      if (onChange) {
        onChange(record.id);
      }
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

  // Handle file select
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    }
  };

  // Handle select from library
  const handleSelectFromLibrary = (mediaId) => {
    if (onChange) {
      onChange(mediaId);
    }
  };

  // Handle remove
  const handleRemove = () => {
    if (onChange) {
      onChange(null);
    }
    setPreview(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview.url}
            alt="预览"
            className="max-w-xs rounded-lg border border-slate-200"
            onError={(e) => {
              // Fallback handling
              if (previewUrl && e.target.src !== previewUrl) {
                e.target.src = previewUrl;
              }
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center space-y-3">
          <Upload className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm text-slate-600">上传新图片或从媒体库选择</p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  上传中...
                </>
              ) : (
                "上传图片"
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowMediaLibrary(true)}
              disabled={uploading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              从媒体库选择
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleSelectFromLibrary}
      />
    </div>
  );
}

