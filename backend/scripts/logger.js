const LEVEL_WEIGHT = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function normalizeLevel(raw) {
  const level = `${raw || ""}`.trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(LEVEL_WEIGHT, level)) {
    return level;
  }
  return "info";
}

export function createLogger(scope, { levelEnv, defaultLevel = "info" } = {}) {
  const preferredLevel = levelEnv ? process.env[levelEnv] : "";
  const fallbackLevel = process.env.LOG_LEVEL;
  const level = normalizeLevel(preferredLevel || fallbackLevel || defaultLevel);
  const threshold = LEVEL_WEIGHT[level];

  const write = (kind, args) => {
    if (LEVEL_WEIGHT[kind] > threshold) return;
    const method = kind === "info" ? "log" : kind;
    const timestamp = new Date().toISOString();
    console[method](`[${timestamp}] [${scope}]`, ...args);
  };

  return {
    level,
    debug: (...args) => write("debug", args),
    info: (...args) => write("info", args),
    warn: (...args) => write("warn", args),
    error: (...args) => write("error", args),
  };
}

export function maskEmail(email) {
  const value = `${email || ""}`.trim();
  const atIndex = value.indexOf("@");
  if (atIndex <= 1) return "***";

  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  if (!domain) return "***";

  const maskedLocal =
    local.length <= 2 ? `${local[0] || "*"}*` : `${local[0]}***${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}
