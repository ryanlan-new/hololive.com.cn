import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, FileText, Bell, Activity } from "lucide-react";
import pb from "../../lib/pocketbase";

/**
 * 后台仪表板页面
 * 展示关键统计数据与系统状态
 */
export default function Dashboard() {
  const [now, setNow] = useState(() => new Date());
  const [stats, setStats] = useState({
    postsCount: null,
    activeAnnouncements: null,
    analyticsConfigured: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 时间更新（用于实时显示当前时间）
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(
    () =>
      now.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
    [now],
  );

  const formattedTime = useMemo(
    () =>
      now.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [now],
  );

  // 拉取统计数据
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [postsList, announcementsList, settings] = await Promise.all([
        pb.collection("posts").getList(1, 1, { sort: "-created" }),
        pb
          .collection("announcements")
          .getList(1, 10, { filter: "is_active = true", sort: "-created" }),
        pb
          .collection("system_settings")
          .getOne("1")
          .catch(() => null),
      ]);

      // 计算当前时间内生效的公告数量
      const nowTs = Date.now();
      const activeAnnouncements = announcementsList.items.filter((item) => {
        const start = item.start_time ? new Date(item.start_time).getTime() : 0;
        const end = item.end_time
          ? new Date(item.end_time).getTime()
          : Number.POSITIVE_INFINITY;
        return nowTs >= start && nowTs <= end;
      }).length;

      const analyticsConfig = settings?.analytics_config || {};
      const analyticsConfigured =
        !!analyticsConfig.google || !!analyticsConfig.baidu;

      setStats({
        postsCount: postsList.totalItems ?? 0,
        activeAnnouncements,
        analyticsConfigured,
      });
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      setError(
        err?.response?.message || err?.message || "加载仪表盘数据失败，请稍后重试。",
      );
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const skeletonClass =
    "animate-pulse bg-slate-100 rounded-lg h-8 w-20 inline-block";

  return (
    <div className="space-y-5">
      {/* 错误提示 */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold mb-0.5">加载仪表盘数据失败</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchStats}
            className="shrink-0 rounded-full border border-red-300 bg-white/60 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            重试
          </button>
        </div>
      )}

      {/* 顶部欢迎 & 时间卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                欢迎来到后台
              </p>
              <h2 className="mt-1 text-xl md:text-2xl font-bold text-slate-900">
                服务器控制中心总览
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              在这里你可以管理文章、公告、账号与系统设置。右侧卡片会实时反映当前日期与时间，帮助你规划运维与公告发布时间。
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-5 py-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[var(--color-brand-blue)]/15 flex items-center justify-center text-[var(--color-brand-blue)]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                当前时间
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {formattedDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-base">{formattedTime}</span>
            </div>
          </div>
        </section>
      </div>

      {/* 统计卡片 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 文章总数 */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-[var(--color-brand-blue)]/15 flex items-center justify-center text-[var(--color-brand-blue)]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  文章总数
                </p>
                <p className="text-sm text-slate-600">Posts Collection</p>
              </div>
            </div>
          </div>
          <div className="mt-1">
            {loading ? (
              <span className={skeletonClass} />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                {stats.postsCount ?? 0}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              已记录的公告、文档和更新日志条目总数。
            </p>
          </div>
        </div>

        {/* 当前生效公告 */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-500">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  当前生效公告
                </p>
                <p className="text-sm text-slate-600">Announcements</p>
              </div>
            </div>
          </div>
          <div className="mt-1">
            {loading ? (
              <span className={skeletonClass} />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                {stats.activeAnnouncements ?? 0}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              仅统计设置为启用且时间范围内的横幅公告。
            </p>
          </div>
        </div>

        {/* 系统配置状态 */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  系统设置
                </p>
                <p className="text-sm text-slate-600">Analytics & Key</p>
              </div>
            </div>
          </div>
          <div className="mt-1 space-y-1.5">
            {loading ? (
              <span className={skeletonClass} />
            ) : (
              <p className="text-sm font-medium">
                {stats.analyticsConfigured
                  ? "统计已配置（至少启用了一种 Analytics）"
                  : "尚未配置统计代码"}
              </p>
            )}
            <p className="text-xs text-slate-500">
              可在「系统设置」中配置 Google Analytics 与百度统计，以及后台入口 Key。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

