const LEVEL_WEIGHT = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

function normalizeLevel(rawLevel) {
  const level = `${rawLevel || ""}`.trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(LEVEL_WEIGHT, level)) {
    return level;
  }
  return import.meta.env.DEV ? "warn" : "error";
}

const APP_LOG_LEVEL = normalizeLevel(import.meta.env.VITE_APP_LOG_LEVEL);

export function createAppLogger(scope = "App") {
  const threshold = LEVEL_WEIGHT[APP_LOG_LEVEL];

  const shouldLog = (kind) => LEVEL_WEIGHT[kind] <= threshold;

  return {
    level: APP_LOG_LEVEL,
    error: (...args) => {
      if (!shouldLog("error")) return;
      console.error(`[${scope}]`, ...args);
    },
    warn: (...args) => {
      if (!shouldLog("warn")) return;
      console.warn(`[${scope}]`, ...args);
    },
    info: (...args) => {
      if (!shouldLog("info")) return;
      console.info(`[${scope}]`, ...args);
    },
    debug: (...args) => {
      if (!shouldLog("debug")) return;
      console.debug(`[${scope}]`, ...args);
    },
  };
}
