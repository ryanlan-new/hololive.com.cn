import { useState, useEffect, useCallback } from "react";
import { X, ExternalLink, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import pb from "../../lib/pocketbase";

/**
 * 全局横幅公告组件
 * 显示网站顶部的横幅公告
 *
 * 支持通过 props.overrideAnnouncement 传入“受控预览”数据，
 * 用于后台编辑时实时预览效果。
 */
export default function GlobalBanner({ overrideAnnouncement = null }) {
  const { i18n } = useTranslation();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [displayText, setDisplayText] = useState("");

  // 获取当前语言的文本（带 fallback）
  const getText = useCallback((content) => {
    if (!content) return null;

    const currentLang = i18n.language || "zh";
    // Fallback 顺序：当前语言 -> 英文 -> 中文
    return (
      content[currentLang] || content.en || content.zh || Object.values(content)[0]
    );
  }, [i18n.language]);

  // 获取详情链接文本
  const getLinkText = (lang) => {
    const texts = {
      zh: "(查看详情)",
      en: "(View Details)",
      ja: "(詳細を見る)",
    };
    const currentLang = lang || i18n.language || "zh";
    return texts[currentLang] || texts.en;
  };

  // 获取或接收公告
  useEffect(() => {
    // 如果传入了受控预览公告，则直接使用该数据，不再请求后端
    if (overrideAnnouncement) {
      const text = getText(overrideAnnouncement.content);
      setAnnouncement(overrideAnnouncement);
      setDisplayText(text || "");
      setLoading(false);
      setDismissed(false);
      return;
    }

    let cancelled = false;

    const fetchAnnouncement = async () => {
      try {
        setLoading(true);

        // 查询启用的公告，按创建时间倒序
        const result = await pb.collection("announcements").getList(1, 1, {
          filter: `is_active = true`,
          sort: "-created",
        });

        if (cancelled) return;

        if (result.items.length > 0) {
          const item = result.items[0];

          // 检查时间范围
          const startTime = item.start_time
            ? new Date(item.start_time).getTime()
            : null;
          const endTime = item.end_time
            ? new Date(item.end_time).getTime()
            : null;
          const nowTime = new Date().getTime();

          // 如果在时间范围内，或者没有设置时间范围
          if (
            (!startTime || nowTime >= startTime) &&
            (!endTime || nowTime <= endTime)
          ) {
            const text = getText(item.content);
            if (text) {
              setAnnouncement(item);
              setDisplayText(text);
              setDismissed(false);
              return;
            }
          }
        }

        setAnnouncement(null);
      } catch (error) {
        // 静默失败，不影响页面显示
        console.warn("Failed to fetch announcement:", error);
        setAnnouncement(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAnnouncement();

    return () => {
      cancelled = true;
    };
  }, [overrideAnnouncement, getText]);

  // 监听语言变化，更新显示文本
  useEffect(() => {
    if (!announcement) return;

    const updateDisplayText = () => {
      const text = getText(announcement.content);
      if (text) {
        setDisplayText(text);
      }
    };

    // 初始设置显示文本
    updateDisplayText();

    // 监听语言变化
    i18n.on("languageChanged", updateDisplayText);
    return () => {
      i18n.off("languageChanged", updateDisplayText);
    };
  }, [announcement, i18n, getText]);

  // 如果正在加载、没有公告或已关闭，不显示（完全移除，不占据空间）
  if (loading || !announcement || dismissed) {
    return null;
  }

  // 根据公告类型选择样式
  const announcementType = announcement.type || "info";
  const isUrgent = announcementType === "urgent";
  
  // 动态背景颜色：紧急（红色）或普通（蓝色）
  const bgGradient = isUrgent
    ? "bg-gradient-to-r from-red-600 via-red-600 to-red-600"
    : "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500";
  const borderColor = isUrgent
    ? "border-red-700/30"
    : "border-blue-700/30";

  return (
    <div className={`fixed top-[56px] md:top-[64px] w-full ${bgGradient} border-b ${borderColor} shadow-lg z-40`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 min-h-[40px] h-10 px-4 relative">
        {/* 图标和文本紧贴在一起 */}
        <div className="flex items-center justify-center gap-2 flex-shrink-0">
          <Bell className="w-4 h-4 text-white drop-shadow-sm flex-shrink-0" />
          <span className="text-sm md:text-base font-semibold text-white drop-shadow-md tracking-wide">
            {displayText}
            {announcement.link && (
              <a
                href={announcement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-white/90 hover:text-white underline underline-offset-2 inline-flex items-center gap-1 transition-colors"
              >
                {getLinkText(i18n.language)}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors text-white hover:bg-white/30"
          aria-label="关闭公告"
        >
          <X className="w-4 h-4 drop-shadow-sm" />
        </button>
      </div>
    </div>
  );
}
