import { useTranslation } from "react-i18next";

/**
 * 获取本地化的文章内容
 * 
 * @param {Object} post - 文章对象
 * @param {string} fieldName - 字段名（title、summary、content）
 * @param {string} currentLang - 当前语言（可选，默认使用 i18n.language）
 * @returns {string} 本地化的内容
 */
export function getLocalizedContent(post, fieldName, currentLang = null) {
  if (!post || !post[fieldName]) return "";
  
  const field = post[fieldName];
  
  // 如果是字符串（向后兼容旧数据），直接返回
  if (typeof field === "string") {
    return field;
  }
  
  // 如果是 JSON 对象，根据语言选择
  if (typeof field === "object" && field !== null) {
    // 如果没有指定语言，尝试从 useTranslation 获取（但这里不使用 hook，所以需要传入）
    const lang = currentLang || "zh";
    
    // Fallback 顺序：当前语言 -> 英文 -> 中文 -> 第一个可用的值
    return field[lang] || field.en || field.zh || Object.values(field)[0] || "";
  }
  
  return "";
}

/**
 * Hook 版本：自动获取当前语言
 */
export function useLocalizedContent(post, fieldName) {
  const { i18n } = useTranslation();
  return getLocalizedContent(post, fieldName, i18n.language);
}

