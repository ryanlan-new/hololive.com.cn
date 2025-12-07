import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import pb from "../../lib/pocketbase";

/**
 * 二次鉴权守卫组件
 * 保护 Dashboard 等内部路由，防止未登录用户直接访问
 * 检查 PocketBase 认证状态，未登录则重定向到登录页面
 */
export default function RequireAdminAuth() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 检查认证状态
    if (!pb.authStore.isValid) {
      // 未登录，重定向到登录页面
      // 保留当前路径作为 redirect 参数，登录后可以跳转回来
      navigate('login', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [navigate, location]);

  // 如果未登录，不渲染任何内容（正在重定向）
  if (!pb.authStore.isValid) {
    return null;
  }

  // 已登录，渲染子路由
  return <Outlet />;
}

