import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pb from "../../lib/pocketbase";
// 注意：ALLOWED_ADMINS 硬编码白名单已迁移到数据库 whitelists 集合
// 此导入保留用于向后兼容，但优先使用数据库白名单
import { ALLOWED_ADMINS } from "../../config/auth_whitelist";
import { logLogin } from "../../lib/logger";

/**
 * Microsoft 四色方块 Logo SVG 组件
 */
const MicrosoftLogo = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="0" y="0" width="10" height="10" fill="#F25022" />
    <rect x="11" y="0" width="10" height="10" fill="#7FBA00" />
    <rect x="0" y="11" width="10" height="10" fill="#00A4EF" />
    <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
  </svg>
);

/**
 * 后台登录页面
 * 支持 Microsoft OAuth2 登录和本地开发密码登录
 */
export default function AdminLogin() {
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [email, setEmail] = useState("admin@local.dev");
  const [password, setPassword] = useState("password123456");
  const [enableLocalLogin, setEnableLocalLogin] = useState(true); // 默认开启（安全回退）
  const [loadingSettings, setLoadingSettings] = useState(true);
  const navigate = useNavigate();

  // 从数据库读取本地登录开关状态
  useEffect(() => {
    const fetchLoginSetting = async () => {
      try {
        setLoadingSettings(true);
        const settings = await pb.collection("system_settings").getFirstListItem("");
        setEnableLocalLogin(settings?.enable_local_login ?? true);
      } catch (error) {
        console.error("Failed to fetch login setting:", error);
        // 如果读取失败，默认开启（安全回退，避免管理员被锁在外面）
        setEnableLocalLogin(true);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchLoginSetting();
  }, []);

  // 白名单验证和跳转的通用逻辑
  const handleAuthSuccess = async (userEmail, isLocalLogin = false) => {
    if (!userEmail) {
      pb.authStore.clear();
      navigate("/403");
      return false;
    }

    // 本地登录：优先检查数据库白名单，如果数据库查询失败则回退到硬编码白名单（向后兼容）
    if (isLocalLogin) {
      try {
        // 优先从数据库 whitelists 集合查询
        await pb.collection("whitelists").getFirstListItem(
          `email="${userEmail}"`
        );
        // 找到白名单记录，允许登录
        navigate("../dashboard");
        return true;
      } catch (error) {
        // 数据库查询失败，回退到硬编码白名单（向后兼容）
        console.warn("Database whitelist check failed, falling back to hardcoded whitelist:", error);
        if (!ALLOWED_ADMINS.includes(userEmail)) {
          pb.authStore.clear();
          navigate("/403");
          return false;
        }
        navigate("../dashboard");
        return true;
      }
    }

    // SSO 登录：从 whitelists 集合查询
    try {
      await pb.collection("whitelists").getFirstListItem(
        `email="${userEmail}"`
      );
      // 找到白名单记录，允许登录
      navigate("../dashboard");
      return true;
    } catch (error) {
      // 未找到白名单记录，强制登出
      console.error("Email not whitelisted:", userEmail);
      pb.authStore.clear();
      throw new Error("Email not whitelisted");
    }
  };

  // Microsoft OAuth2 登录
  const handleMicrosoftLogin = async () => {
    setMicrosoftLoading(true);

    try {
      console.log("Starting Microsoft OAuth2 login...");
      console.log("PocketBase URL:", pb.baseUrl);
      
      // 首先检查 OAuth2 提供者是否可用（仅用于诊断，不阻止登录尝试）
      try {
        const authMethods = await pb.collection("users").listAuthMethods();
        console.log("Available auth methods:", authMethods);
        console.log("OAuth2 enabled:", authMethods?.oauth2?.enabled);
        console.log("OAuth2 providers:", authMethods?.oauth2?.providers);
        
        const microsoftProvider = authMethods?.oauth2?.providers?.find(
          (p) => p.name === "microsoft"
        );
        
        if (microsoftProvider) {
          console.log("Microsoft OAuth2 provider found:", microsoftProvider);
          console.log("Microsoft provider full object:", JSON.stringify(microsoftProvider, null, 2));
        } else {
          console.warn("Microsoft OAuth2 provider not found in listAuthMethods()");
        }
      } catch (checkError) {
        console.warn("OAuth2 provider check failed (continuing anyway):", checkError);
        // 不阻止登录尝试，让 PocketBase 自己处理错误
      }
      
      // 执行 Microsoft OAuth2 认证
      // PocketBase 会自动处理 OAuth2 流程（打开弹出窗口或重定向）
      const authData = await pb.collection("users").authWithOAuth2({
        provider: "microsoft",
      });

      console.log("OAuth2 auth data received:", authData);

      // 获取登录后的用户邮箱（从 authData.record.email）
      const userEmail = authData?.record?.email;
      console.log("User email from OAuth:", userEmail);

      if (!userEmail) {
        throw new Error("无法获取用户邮箱信息");
      }

      // 白名单校验：从 whitelists 集合查询
      const success = await handleAuthSuccess(userEmail, false);
      
      // 记录登录日志
      if (success) {
        await logLogin("SSO 登录");
      }
    } catch (error) {
      // 处理认证失败（用户取消、网络错误、白名单验证失败等）
      console.error("Microsoft login error:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        data: error?.data,
        status: error?.status,
        code: error?.code,
        fullError: error,
      });

      // 确保清除可能的认证状态
      pb.authStore.clear();

      // 提取详细错误信息（尝试多种方式）
      let errorDetail = {};
      let errorMessage = "未知错误";
      let errorStatus = null;
      
      // 尝试从不同位置提取错误信息
      if (error?.response?.data) {
        errorDetail = error.response.data;
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error?.data) {
        errorDetail = error.data;
        errorMessage = error.data?.message || error.data?.error || errorMessage;
      } else if (error?.response) {
        errorDetail = error.response;
        errorMessage = error.response?.message || errorMessage;
      } else if (error?.message) {
        errorMessage = error.message;
        errorDetail = { message: error.message };
      } else if (typeof error === "string") {
        errorMessage = error;
        errorDetail = { message: error };
      } else if (error && typeof error === "object") {
        errorDetail = error;
        errorMessage = error.toString();
      }
      
      errorStatus = error?.status || error?.response?.status || error?.code || null;
      
      // 如果错误详情是空对象，尝试序列化整个错误对象
      if (Object.keys(errorDetail).length === 0 && error) {
        try {
          errorDetail = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
        } catch (e) {
          errorDetail = { rawError: String(error) };
        }
      }

      // 白名单验证失败
      if (errorMessage === "Email not whitelisted" || errorMessage?.includes("白名单")) {
        alert("您的邮箱未在白名单中，无权访问");
        return;
      }
      
      // OAuth2 提供者未配置
      if (
        errorMessage?.includes("未配置") ||
        errorMessage?.includes("未启用") ||
        errorMessage?.includes("not configured") ||
        errorMessage?.includes("not enabled")
      ) {
        const pbBaseUrl = pb.baseUrl || import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";
        const redirectUrl = `${pbBaseUrl}/api/oauth2-redirect`;
        
        alert(
          `Microsoft OAuth2 未配置\n\n` +
          `请在 PocketBase Admin 面板中配置 Microsoft OAuth2：\n\n` +
          `1. 打开 PocketBase Admin 面板：${pbBaseUrl}/_/\n` +
          `2. 进入 Settings → OAuth2 Providers\n` +
          `3. 找到 Microsoft 提供者并点击配置\n` +
          `4. 填写以下信息：\n` +
          `   - Client ID: （从 Azure Portal 获取）\n` +
          `   - Client Secret: （从 Azure Portal 获取）\n` +
          `   - Redirect URL: ${redirectUrl}\n\n` +
          `5. 在 Microsoft Azure Portal 中，添加重定向 URI：\n` +
          `   ${redirectUrl}\n\n` +
          `详细错误：${errorMessage}`
        );
        return;
      }
      
      // 用户取消登录
      if (
        errorMessage?.includes("cancel") ||
        errorMessage?.includes("aborted") ||
        errorMessage?.includes("popup_closed") ||
        errorMessage?.includes("user_cancelled") ||
        error?.code === "aborted"
      ) {
        alert("登录已取消");
        return;
      }
      
      // OAuth2 配置错误（常见原因）
      if (
        errorMessage?.includes("redirect_uri") ||
        errorMessage?.includes("redirect") ||
        errorMessage?.includes("invalid_client") ||
        errorMessage?.includes("unauthorized_client") ||
        errorMessage?.includes("invalid_request") ||
        errorStatus === 400 ||
        errorStatus === 401 ||
        errorStatus === 403
      ) {
        const pbBaseUrl = pb.baseUrl || import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";
        const redirectUrl = `${pbBaseUrl}/api/oauth2-redirect`;
        
        alert(
          `OAuth2 配置错误\n\n` +
          `请检查 PocketBase 后台的 Microsoft OAuth2 配置：\n\n` +
          `1. 打开 PocketBase Admin 面板：${pbBaseUrl}/_/\n` +
          `2. 进入 Settings → OAuth2 Providers → Microsoft\n` +
          `3. 确保以下配置正确：\n` +
          `   - Client ID: 已填写且正确\n` +
          `   - Client Secret: 已填写且正确\n` +
          `   - Redirect URL: ${redirectUrl}\n\n` +
          `4. 在 Microsoft Azure Portal 中，确保重定向 URI 已添加：\n` +
          `   ${redirectUrl}\n\n` +
          `错误信息：${errorMessage}\n` +
          `状态码：${errorStatus || "N/A"}`
        );
        return;
      }
      
      // 网络错误
      if (
        errorMessage?.includes("network") ||
        errorMessage?.includes("Network") ||
        errorMessage?.includes("fetch") ||
        errorMessage?.includes("Failed to fetch") ||
        errorMessage?.includes("ECONNREFUSED") ||
        errorMessage?.includes("timeout")
      ) {
        alert(
          `网络连接失败\n\n` +
          `请检查：\n` +
          `1. PocketBase 服务是否正常运行（${pb.baseUrl || import.meta.env.VITE_POCKETBASE_URL}）\n` +
          `2. 网络连接是否正常\n` +
          `3. 防火墙是否阻止了连接\n\n` +
          `错误信息：${errorMessage}`
        );
        return;
      }

      // 其他错误：显示完整错误信息
      const pbBaseUrl = pb.baseUrl || import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";
      const errorDetailStr = Object.keys(errorDetail).length > 0 
        ? JSON.stringify(errorDetail, null, 2)
        : "无详细错误信息（可能是 OAuth2 提供者未配置）";
      
      alert(
        `Microsoft 登录失败\n\n` +
        `错误信息：${errorMessage}\n` +
        `状态码：${errorStatus || "N/A"}\n\n` +
        `错误详情：\n${errorDetailStr}\n\n` +
        `请检查：\n` +
        `1. PocketBase 后台是否已配置 Microsoft OAuth2\n` +
        `   （${pbBaseUrl}/_/ → Settings → OAuth2 Providers → Microsoft）\n` +
        `2. Client ID 和 Client Secret 是否正确\n` +
        `3. 重定向 URL 是否正确配置\n` +
        `4. 浏览器控制台（F12）是否有更多错误信息\n` +
        `5. PocketBase 服务是否正常运行`
      );
    } finally {
      setMicrosoftLoading(false);
    }
  };

  // 本地密码登录
  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setLocalLoading(true);

    try {
      // 执行密码认证
      await pb.collection("users").authWithPassword(email, password);

      // 获取登录后的用户邮箱
      const userEmail = pb.authStore.model?.email;
      const success = await handleAuthSuccess(userEmail, true);
      
      // 记录登录日志
      if (success) {
        await logLogin("本地登录");
      }
    } catch (error) {
      // 处理认证失败
      console.error("Local login error:", error);

      // 确保清除可能的认证状态
      pb.authStore.clear();

      // 显示错误提示
      let errorMessage = "登录失败，请检查邮箱和密码";
      if (error?.message === "Email not whitelisted") {
        errorMessage = "您的邮箱未在白名单中，无权访问";
      } else if (error?.response?.message) {
        errorMessage = error.response.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = microsoftLoading || localLoading || loadingSettings;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      {/* 背景渐变 */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-gray-900 via-gray-950 to-black pointer-events-none" />

      {/* 玻璃拟态卡片 */}
      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* 标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">管理控制台</h1>
          <p className="text-gray-400 text-sm">请使用 Microsoft 账号登录</p>
        </div>

        {/* 加载状态 */}
        {loadingSettings && (
          <div className="flex items-center justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}

        {/* Microsoft 登录按钮 */}
        {!loadingSettings && (
          <button
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-lg border border-gray-200"
          >
            {microsoftLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-gray-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>正在跳转...</span>
              </>
            ) : (
              <>
                <MicrosoftLogo className="w-5 h-5" />
                <span>使用 Microsoft 账号登录</span>
              </>
            )}
          </button>
        )}

        {/* 本地登录部分 - 根据数据库配置显示/隐藏 */}
        {!loadingSettings && enableLocalLogin && (
          <>
            {/* 分隔线 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/5 px-2 text-gray-500">
                  或（开发模式）
                </span>
              </div>
            </div>

            {/* 本地登录表单 */}
            <form onSubmit={handleLocalLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="admin@local.dev"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  密码
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="password123456"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {localLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>验证中...</span>
                  </>
                ) : (
                  <span>使用密码登录</span>
                )}
              </button>
            </form>
          </>
        )}

        {/* 提示信息 */}
        <p className="text-center text-xs text-gray-500">
          只有授权的管理员才能访问此系统
        </p>
      </div>
    </div>
  );
}

