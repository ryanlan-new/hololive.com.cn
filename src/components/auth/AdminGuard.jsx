import { useState, useEffect } from "react";
import { useParams, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ErrorPage from "../../pages/ErrorPage";
import pb from "../../lib/pocketbase";
import { createAppLogger } from "../../lib/appLogger";

const logger = createAppLogger("AdminGuard");

/**
 * 后台管理路由守卫组件
 * 通过 URL 中的 adminKey 参数验证访问权限
 * 从数据库的 system_settings 中读取 admin_entrance_key 进行验证
 * 如果密钥不匹配，显示 404 错误页面（起到迷惑作用）
 */
export default function AdminGuard() {
  const { t } = useTranslation("admin");
  const { adminKey } = useParams();
  const [isValidKey, setIsValidKey] = useState(null); // null = 加载中, true/false = 验证结果
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const devFallbackKey = import.meta.env.DEV
      ? import.meta.env.VITE_ADMIN_KEY || ""
      : "";

    const validateKey = async () => {
      try {
        setLoading(true);
        // 从数据库读取 admin_entrance_key
        const settings = await pb.collection("system_settings").getOne("1");
        const dbKey = settings?.admin_entrance_key;

        // 比对 URL 中的 adminKey 与数据库中的密钥
        // 仅在开发模式下允许环境变量回退
        const expectedKey = dbKey || devFallbackKey;
        setIsValidKey(adminKey === expectedKey);
      } catch (error) {
        logger.error("Failed to validate admin key:", error);
        // 生产环境读取失败时直接拒绝；开发模式可回退到环境变量
        setIsValidKey(Boolean(devFallbackKey) && adminKey === devFallbackKey);
      } finally {
        setLoading(false);
      }
    };

    validateKey();
  }, [adminKey]);

  // 加载中：显示空白或加载提示（避免闪烁）
  if (loading || isValidKey === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-slate-500">{t("guard.verifying")}</div>
      </div>
    );
  }

  // 如果密钥不匹配，显示 404 页面（迷惑潜在的攻击者）
  if (!isValidKey) {
    return <ErrorPage code="E404" />;
  }

  // 密钥验证通过，渲染子路由
  return <Outlet />;
}
