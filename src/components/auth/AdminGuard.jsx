import { useState, useEffect } from "react";
import { useParams, Outlet } from "react-router-dom";
import ErrorPage from "../../pages/ErrorPage";
import pb from "../../lib/pocketbase";

/**
 * 后台管理路由守卫组件
 * 通过 URL 中的 adminKey 参数验证访问权限
 * 从数据库的 system_settings 中读取 admin_entrance_key 进行验证
 * 如果密钥不匹配，显示 404 错误页面（起到迷惑作用）
 */
export default function AdminGuard() {
  const { adminKey } = useParams();
  const [isValidKey, setIsValidKey] = useState(null); // null = 加载中, true/false = 验证结果
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateKey = async () => {
      try {
        setLoading(true);
        // 从数据库读取 admin_entrance_key
        const settings = await pb.collection("system_settings").getOne("1");
        const dbKey = settings?.admin_entrance_key;

        // 比对 URL 中的 adminKey 与数据库中的密钥
        // 如果数据库中没有设置，回退到环境变量（向后兼容）
        const expectedKey = dbKey || import.meta.env.VITE_ADMIN_KEY || "";
        setIsValidKey(adminKey === expectedKey);
      } catch (error) {
        console.error("Failed to validate admin key:", error);
        // 如果读取数据库失败，回退到环境变量验证
        const fallbackKey = import.meta.env.VITE_ADMIN_KEY || "";
        setIsValidKey(adminKey === fallbackKey);
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
        <div className="text-sm text-slate-500">验证中...</div>
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

