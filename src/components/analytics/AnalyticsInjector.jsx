import { useEffect } from "react";
import pb from "../../lib/pocketbase";

const SETTINGS_ID = "1"; // 单例模式，固定 ID

/**
 * Analytics 脚本注入组件
 * 动态加载 Google Analytics 和 Baidu Analytics 脚本
 */
export default function AnalyticsInjector() {
  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        // 获取系统设置
        const settings = await pb.collection("system_settings").getOne(SETTINGS_ID);
        const analyticsConfig = settings.analytics_config || {};

        if (!isMounted) return;

        // 加载 Google Analytics
        if (analyticsConfig.google) {
          const googleId = analyticsConfig.google.trim();
          if (googleId && !document.getElementById("google-analytics-script")) {
            // 添加 gtag 配置脚本
            const gtagScript = document.createElement("script");
            gtagScript.async = true;
            gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleId}`;
            gtagScript.id = "google-analytics-script";
            document.head.appendChild(gtagScript);

            // 等待 gtag 脚本加载完成后再添加初始化脚本
            gtagScript.onload = () => {
              if (!isMounted) return;
              
              // 如果初始化脚本已存在，先移除
              const existingInit = document.getElementById("google-analytics-init");
              if (existingInit) {
                existingInit.remove();
              }

              const initScript = document.createElement("script");
              initScript.id = "google-analytics-init";
              initScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleId}');
              `;
              document.head.appendChild(initScript);
            };
          }
        }

        // 加载 Baidu Analytics (Tongji 2.0 - 异步模式)
        if (analyticsConfig.baidu) {
          const baiduId = analyticsConfig.baidu.trim();
          if (baiduId) {
            // 检查是否已存在相同 ID 的脚本（幂等性检查）
            const existingScript = document.querySelector(
              `script[src*="hm.baidu.com/hm.js?${baiduId}"]`
            );
            
            // 检查是否已存在百度统计初始化脚本
            const existingInit = document.getElementById("baidu-analytics-init");
            
            if (!existingScript && !existingInit) {
              // 使用官方推荐的异步注入模式
              const initScript = document.createElement("script");
              initScript.id = "baidu-analytics-init";
              initScript.innerHTML = `
                var _hmt = _hmt || [];
                (function() {
                  var hm = document.createElement("script");
                  hm.src = "https://hm.baidu.com/hm.js?" + ${JSON.stringify(baiduId)};
                  var s = document.getElementsByTagName("script")[0];
                  s.parentNode.insertBefore(hm, s);
                })();
              `;
              document.head.appendChild(initScript);
            }
          }
        }
      } catch (error) {
        // 静默失败，不影响页面正常显示
        console.warn("Failed to load analytics config:", error);
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

