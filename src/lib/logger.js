import pb from "./pocketbase";

/**
 * 审计日志服务
 * 用于记录管理员和 SSO 用户的敏感操作
 */

/**
 * 获取客户端 IP 地址（如果可用）
 * 注意：在浏览器环境中，由于隐私限制，通常无法直接获取真实 IP
 * 此函数返回一个占位符，实际 IP 记录需要在服务端完成
 */
const getClientIP = () => {
  // 在浏览器环境中，无法直接获取真实 IP
  // 如果需要记录 IP，应该在服务端通过请求头获取
  return null;
};

/**
 * 记录操作日志
 * 
 * @param {string} actionType - 操作类型：登录、创建、更新、删除、系统设置、其他
 * @param {string} targetModule - 目标模块：如"文章管理"、"首页分段"、"白名单"、"系统设置"
 * @param {string} details - 操作详情：如"删除了文章《xxx》"
 * @param {string} ipAddress - 可选，IP 地址
 */
export const logAction = async (actionType, targetModule, details = "", ipAddress = null) => {
  try {
    // 检查用户是否已登录
    if (!pb.authStore.isValid || !pb.authStore.model) {
      console.warn("无法记录日志：用户未登录");
      return;
    }

    const userId = pb.authStore.model.id;
    if (!userId) {
      console.warn("无法记录日志：无法获取用户 ID");
      return;
    }

    // 准备日志数据
    const logData = {
      user: userId,
      action_type: actionType,
      target_module: targetModule,
      details: details || "",
      ip_address: ipAddress || getClientIP() || "",
    };

    // 写入日志（异步，不阻塞主流程）
    pb.collection("audit_logs")
      .create(logData)
      .catch((error) => {
        // 日志写入失败不应影响主业务流程
        console.error("审计日志写入失败:", error);
      });
  } catch (error) {
    // 捕获所有异常，确保不影响主业务流程
    console.error("记录审计日志时发生错误:", error);
  }
};

/**
 * 便捷方法：记录登录操作
 */
export const logLogin = async (loginType = "本地登录", ipAddress = null) => {
  await logAction("登录", "用户认证", `通过 ${loginType} 成功登录`, ipAddress);
};

/**
 * 便捷方法：记录创建操作
 */
export const logCreate = async (module, details, ipAddress = null) => {
  await logAction("创建", module, details, ipAddress);
};

/**
 * 便捷方法：记录更新操作
 */
export const logUpdate = async (module, details, ipAddress = null) => {
  await logAction("更新", module, details, ipAddress);
};

/**
 * 便捷方法：记录删除操作
 */
export const logDelete = async (module, details, ipAddress = null) => {
  await logAction("删除", module, details, ipAddress);
};

/**
 * 便捷方法：记录系统设置操作
 */
export const logSystemSettings = async (details, ipAddress = null) => {
  await logAction("系统设置", "系统设置", details, ipAddress);
};

