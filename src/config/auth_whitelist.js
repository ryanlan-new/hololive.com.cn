/**
 * 管理员邮箱白名单配置
 * 只有在此列表中的邮箱才能访问后台管理系统
 */
const DEV_ONLY_ADMINS = ["admin@local.dev"];

export const ALLOWED_ADMINS = [
  "ryan.lan_home@outlook.com", // Microsoft Outlook 账号
  ...(import.meta.env.DEV ? DEV_ONLY_ADMINS : []), // 本地开发账号仅在 DEV 可用
];
