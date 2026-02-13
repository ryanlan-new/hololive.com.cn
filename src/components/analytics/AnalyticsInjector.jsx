import { useEffect } from "react";
import pb from "../../lib/pocketbase";
import { createAppLogger } from "../../lib/appLogger";

const SETTINGS_ID = "1"; // 单例模式，固定 ID
const logger = createAppLogger("AnalyticsInjector");

/**
 * Analytics 脚本注入组件
 * 动态加载 Google Analytics 和 Baidu Analytics 脚本
 */
export default function AnalyticsInjector() {
  useEffect(() => {
    let isMounted = true;
    let googleInitialized = false;

    const normalizeGoogleId = (value) => {
      const id = `${value || ""}`.trim();
      return /^G-[A-Z0-9]+$/.test(id) ? id : "";
    };

    const normalizeBaiduId = (value) => {
      const id = `${value || ""}`.trim();
      return /^[a-zA-Z0-9]+$/.test(id) ? id : "";
    };

    const loadAnalytics = async () => {
      try {
        // 获取系统设置
        const settings = await pb.collection("system_settings").getOne(SETTINGS_ID);
        const analyticsConfig = settings.analytics_config || {};

        if (!isMounted) return;

        // 加载 Google Analytics
        if (analyticsConfig.google) {
          const googleId = normalizeGoogleId(analyticsConfig.google);
          if (googleId && !document.getElementById("google-analytics-script")) {
            // 添加 gtag 配置脚本
            const gtagScript = document.createElement("script");
            gtagScript.async = true;
            gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleId)}`;
            gtagScript.id = "google-analytics-script";
            document.head.appendChild(gtagScript);

            // 等待 gtag 脚本加载完成后再初始化
            gtagScript.onload = () => {
              if (!isMounted || googleInitialized) return;
              window.dataLayer = window.dataLayer || [];
              window.gtag = window.gtag || function gtag() {
                window.dataLayer.push(arguments);
              };
              window.gtag("js", new Date());
              window.gtag("config", googleId);
              googleInitialized = true;
            };
          }
        }

        // 加载 Baidu Analytics (Tongji 2.0 - 异步模式)
        if (analyticsConfig.baidu) {
          const baiduId = normalizeBaiduId(analyticsConfig.baidu);
          if (baiduId) {
            // 检查是否已存在相同 ID 的脚本（幂等性检查）
            const existingScript = document.getElementById("baidu-analytics-script");

            if (!existingScript) {
              window._hmt = window._hmt || [];
              const baiduScript = document.createElement("script");
              baiduScript.async = true;
              baiduScript.id = "baidu-analytics-script";
              baiduScript.src = `https://hm.baidu.com/hm.js?${encodeURIComponent(baiduId)}`;
              document.head.appendChild(baiduScript);
            }
          }
        }
      } catch (error) {
        // 静默失败，不影响页面正常显示
        logger.warn("Failed to load analytics config:", error);
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
      // 清理函数：可选，通常不需要移除 analytics 脚本
    };
  }, []);

  return null; // 此组件不渲染任何内容
}
