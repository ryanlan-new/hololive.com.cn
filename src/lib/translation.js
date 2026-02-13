/**
 * MyMemory Translation API - Client-side Translation Utility
 * 客户端自动翻译工具函数（免费版，无需 API 密钥）
 * 
 * API Endpoint: https://api.mymemory.translated.net/get
 * Request format: GET ?q={text}&langpair={source}|{target}
 * Response: response.data.responseData.translatedText
 */
import { createAppLogger } from "./appLogger";

const logger = createAppLogger("Translation");

/**
 * Language code mapping for MyMemory API
 * MyMemory API 语言代码映射
 */
const LANGUAGE_CODES = {
  zh: 'zh', // Chinese Simplified
  en: 'en', // English
  ja: 'ja', // Japanese
};

/**
 * Delay function for rate limiting
 * 延迟函数，用于避免速率限制
 * 
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Translate text using MyMemory Translation API
 * 使用 MyMemory Translation API 翻译文本
 * 
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code (zh, en, ja)
 * @param {string} targetLang - Target language code (zh, en, ja)
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text, sourceLang, targetLang) {
  if (!text || !text.trim()) {
    return '';
  }

  // If source and target are the same, return original text
  if (sourceLang === targetLang) {
    return text;
  }

  const sourceLanguageCode = LANGUAGE_CODES[sourceLang];
  const targetLanguageCode = LANGUAGE_CODES[targetLang];
  
  if (!sourceLanguageCode || !targetLanguageCode) {
    throw new Error(`不支持的语言代码: ${sourceLang} -> ${targetLang}`);
  }

  try {
    // MyMemory Translation API endpoint
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguageCode}|${targetLanguageCode}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`翻译请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check for API errors
    if (data.responseStatus !== 200) {
      // If rate limit or other error, return original text with warning
      logger.warn('Translation API error:', data.responseStatus, data.responseDetails);
      return text; // Return original text instead of throwing error
    }
    
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    // If no translation found, return original text
    logger.warn('No translation found, returning original text');
    return text;
  } catch (error) {
    logger.error('Translation error:', error);
    // Return original text on error instead of throwing
    // This ensures the UI doesn't break if API is unavailable
    return text;
  }
}

/**
 * Detect source language from filled fields
 * 检测已填写的字段，确定源语言
 * 
 * @param {Object} fields - Object with zh, en, ja properties
 * @returns {string|null} Source language code (zh, en, ja) or null if no field is filled
 */
export function detectSourceLanguage(fields) {
  if (!fields) return null;
  
  // Priority: zh -> en -> ja
  if (fields.zh && fields.zh.trim()) return 'zh';
  if (fields.en && fields.en.trim()) return 'en';
  if (fields.ja && fields.ja.trim()) return 'ja';
  
  return null;
}

/**
 * Translate all fields from source language to target languages
 * 将源语言字段翻译到目标语言
 * 
 * @param {Object} fields - Object with zh, en, ja properties
 * @param {string} sourceLang - Source language code (zh, en, ja)
 * @param {Array<string>} targetLangs - Array of target language codes
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Translated fields object
 */
export async function translateFields(fields, sourceLang, targetLangs, onProgress = null) {
  const sourceText = fields[sourceLang]?.trim();
  if (!sourceText) {
    return fields;
  }

  const translatedFields = { ...fields };
  
  // Translate to each target language with delay to avoid rate limits
  for (let i = 0; i < targetLangs.length; i++) {
    const targetLang = targetLangs[i];
    if (targetLang === sourceLang) continue; // Skip source language
    
    try {
      // Add delay between requests (except for the first one)
      if (i > 0) {
        await delay(500); // 500ms delay between requests
      }
      
      if (onProgress) {
        onProgress(`正在翻译到 ${targetLang === 'zh' ? '中文' : targetLang === 'en' ? '英文' : '日文'}...`);
      }
      
      const translated = await translateText(sourceText, sourceLang, targetLang);
      translatedFields[targetLang] = translated;
    } catch (error) {
      logger.error(`Failed to translate to ${targetLang}:`, error);
      // Keep original value if translation fails
      if (!translatedFields[targetLang]) {
        translatedFields[targetLang] = '';
      }
    }
  }
  
  return translatedFields;
}
