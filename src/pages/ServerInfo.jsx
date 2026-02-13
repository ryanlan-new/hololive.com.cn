import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Server, ArrowLeft, Loader2, Map, Maximize, Minimize, X, Activity, Users, Zap, Info } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useTranslation } from "react-i18next";
import pb from "../lib/pocketbase";

export default function ServerInfo() {
  const { i18n, t } = useTranslation("docs");
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [serverInfoFields, setServerInfoFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [serverStatus, setServerStatus] = useState({
    data: null,
    loading: false,
    error: null,
  });
  const [serverHostname, setServerHostname] = useState(null);

  // 获取当前语言的文本（带 fallback）
  const getText = useCallback((content) => {
    if (!content) return "";
    if (typeof content === "string") return content; // 向后兼容旧数据
    
    const currentLang = i18n.language || "zh";
    // Fallback 顺序：当前语言 -> 英文 -> 中文
    return content[currentLang] || content.en || content.zh || Object.values(content)[0] || "";
  }, [i18n.language]);

  // Fetch server info fields
  useEffect(() => {
    const fetchServerInfoFields = async () => {
      try {
        setFieldsLoading(true);
        const result = await pb
          .collection("server_info_details")
          .getList(1, 100, {
            sort: "sort_order",
          });
        setServerInfoFields(result.items);
        
        // 提取服务器地址（icon === 'Server' 或 sort_order === 1）
        const serverField = result.items.find(
          (field) => field.icon === "Server" || field.sort_order === 1
        );
        if (serverField && serverField.value) {
          const hostname = getText(serverField.value);
          if (hostname) {
            // 移除协议前缀（如果有）
            const cleanHostname = hostname
              .replace(/^https?:\/\//, "")
              .replace(/\/$/, "")
              .trim();
            setServerHostname(cleanHostname);
          }
        }
      } catch (err) {
        console.error("Failed to fetch server info fields:", err);
      } finally {
        setFieldsLoading(false);
      }
    };

    fetchServerInfoFields();
  }, [getText]);

  // 获取服务器实时状态
  useEffect(() => {
    if (!serverHostname) return;

    const fetchServerStatus = async () => {
      try {
        setServerStatus((prev) => ({ ...prev, loading: true, error: null }));
        const response = await fetch(
          `https://api.mcsrvstat.us/3/${encodeURIComponent(serverHostname)}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // mcsrvstat API 返回格式：{ online: boolean, players: {...}, version: "...", motd: {...}, debug: {...} }
        setServerStatus({
          data: data.online ? data : null,
          loading: false,
          error: data.online ? null : "服务器离线",
        });
      } catch (err) {
        console.error("Failed to fetch server status:", err);
        setServerStatus({
          data: null,
          loading: false,
          error: err.message || "获取服务器状态失败",
        });
      }
    };

    fetchServerStatus();
    
    // 每 30 秒刷新一次
    const interval = setInterval(fetchServerStatus, 30000);
    return () => clearInterval(interval);
  }, [serverHostname]);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setLoading(true);
        const result = await pb.collection("server_maps").getList(1, 100, {
          sort: "sort_order",
        });
        setMaps(result.items);
        setError(null);

        // Handle deep linking: check URL param or select first map
        const mapId = searchParams.get("mapId");
        if (mapId) {
          const map = result.items.find((m) => m.id === mapId);
          if (map) {
            setSelectedMap(map);
          } else if (result.items.length > 0) {
            setSelectedMap(result.items[0]);
          }
        } else if (result.items.length > 0) {
          // Select map with lowest sort_order
          const sorted = [...result.items].sort(
            (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
          );
          setSelectedMap(sorted[0]);
        }
      } catch (err) {
        console.error("Failed to fetch maps:", err);
        setError("加载地图列表失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, [searchParams]);

  // Get icon component by name
  const getIconComponent = (iconName) => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.Server;
    return IconComponent;
  };

  const handleMapSelect = (map) => {
    setSelectedMap(map);
    setSearchParams({ mapId: map.id });
  };

  // 切换地图全屏模式
  const toggleMapFullscreen = () => {
    setIsMapFullscreen(!isMapFullscreen);
  };

  // ESC 键退出全屏
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isMapFullscreen) {
        setIsMapFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMapFullscreen]);


  return (
    <>
      {/* Fullscreen Map Overlay */}
      {isMapFullscreen && selectedMap && (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-background flex flex-col">
          {/* Header with title */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              {selectedMap.name}
            </h3>
          </div>
          {/* Fullscreen iframe */}
          <div className="flex-1 relative w-full h-full">
            <iframe
              src={selectedMap.url}
              className="w-full h-full border-0"
              title={selectedMap.name}
              allowFullScreen
            />
            {/* Exit Fullscreen Button - visible in fullscreen mode */}
            <button
              onClick={toggleMapFullscreen}
              className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all z-[60] group border border-slate-200"
              title="退出全屏"
            >
              <Minimize size={20} className="text-slate-700 group-hover:text-slate-900" />
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full pt-20 pb-10 flex flex-col items-center bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="flex flex-col w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回文档中心</span>
          </Link>
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <Server size={32} className="text-green-500" />
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
                服务器信息
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Server Static Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-lg"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            服务器信息
          </h2>
          {fieldsLoading ? (
            <div className="flex items-center gap-2 text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>加载中...</span>
            </div>
          ) : serverInfoFields.length === 0 ? (
            <p className="text-slate-500">暂无服务器信息</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-900">
              {serverInfoFields.map((field) => {
                const IconComponent = getIconComponent(field.icon);
                const label = getText(field.label) || "未命名";
                const value = getText(field.value) || "";
                const isUrl = value.startsWith("http://") || value.startsWith("https://");

                return (
                  <div
                    key={field.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <IconComponent
                      size={20}
                      className="text-green-500 flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-slate-700">
                        {label}:{" "}
                      </span>
                      {isUrl ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="text-slate-900">{value}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Live Server Status */}
        {serverHostname && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-slate-900">
                {t("serverInfo.status.title")}
              </h2>
              {serverStatus.loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400 ml-2" />
              ) : serverStatus.data ? (
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse ml-2" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-red-500 ml-2" />
              )}
            </div>

            {serverStatus.loading ? (
              <div className="flex items-center gap-2 text-slate-600 py-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>正在获取服务器状态...</span>
              </div>
            ) : serverStatus.error || !serverStatus.data ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">
                    {t("serverInfo.status.offline")}
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    服务器当前不可用或无法连接
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 在线人数 */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Users className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {t("serverInfo.status.players")}
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {serverStatus.data.players?.online || 0} / {serverStatus.data.players?.max || 0}
                    </p>
                  </div>
                </div>

                {/* 在线/延迟 */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {t("serverInfo.status.latency")}
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {(() => {
                        const ping = serverStatus.data.debug?.ping;
                        // 检查是否为有效数字
                        if (typeof ping === "number" && ping > 0) {
                          return `${t("serverInfo.status.latencyOnline")}/${ping} ms`;
                        }
                        // 如果 ping 是布尔值 true，说明服务器在线但延迟信息不可用
                        if (ping === true) {
                          return t("serverInfo.status.latencyOnline");
                        }
                        // 其他情况：离线或未知状态
                        return t("serverInfo.status.latencyOffline");
                      })()}
                    </p>
                  </div>
                </div>

                {/* 版本 */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {t("serverInfo.status.version")}
                    </p>
                    <p className="text-lg font-bold text-slate-900 break-all">
                      {serverStatus.data.version || "-"}
                    </p>
                  </div>
                </div>

                {/* MOTD */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors md:col-span-2 lg:col-span-1">
                  <Server className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {t("serverInfo.status.motd")}
                    </p>
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                      {serverStatus.data.motd?.clean 
                        ? serverStatus.data.motd.clean.join(" ")
                        : serverStatus.data.motd?.raw?.join(" ") || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Map Selector and Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
            <p className="text-slate-600">加载中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : maps.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <Map size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-900">暂无地图</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map Selector Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Map size={20} />
                  地图列表
                </h3>
                <div className="space-y-2">
                  {maps.map((map) => (
                    <button
                      key={map.id}
                      onClick={() => handleMapSelect(map)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                        selectedMap?.id === map.id
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      {map.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>

            {/* Map Display */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-3"
            >
              {selectedMap ? (
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-lg relative">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {selectedMap.name}
                  </h3>
                  <div className="relative w-full" style={{ paddingBottom: "75%" }}>
                    <iframe
                      src={selectedMap.url}
                      className="absolute top-0 left-0 w-full h-full rounded-lg border-0"
                      title={selectedMap.name}
                      allowFullScreen
                    />
                    {/* Enter Fullscreen Button - only visible in normal mode */}
                    {!isMapFullscreen && (
                      <button
                        onClick={toggleMapFullscreen}
                        className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all z-[60] group"
                        title="网页全屏"
                      >
                        <Maximize size={20} className="text-slate-700 group-hover:text-slate-900" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
                  <Map size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-900">请选择一个地图</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
        </main>
      </div>
    </>
  );
}
