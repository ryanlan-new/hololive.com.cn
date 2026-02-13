const FALLBACK_LOCALE = "zh-CN";

const LOCALE_MAP = {
  zh: "zh-CN",
  "zh-CN": "zh-CN",
  en: "en-US",
  "en-US": "en-US",
  ja: "ja-JP",
  "ja-JP": "ja-JP",
};

export function resolveLocale(language) {
  return LOCALE_MAP[language] || FALLBACK_LOCALE;
}

export function formatLocalizedDate(dateString, language, options = {}) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(resolveLocale(language), {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(date);
}
