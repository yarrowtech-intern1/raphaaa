const levelOrder = { debug: 10, info: 20, warn: 30, error: 40 };
const currentLevel = String(process.env.LOG_LEVEL || "info").toLowerCase();
const threshold = levelOrder[currentLevel] || 20;

const safeJson = (v) => {
  try {
    return JSON.stringify(v);
  } catch (_) {
    return "\"[unserializable]\"";
  }
};

const log = (level, msg, meta = {}) => {
  const lv = levelOrder[level] || 20;
  if (lv < threshold) return;
  const line = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...meta,
  };
  // Keep console output structured for log shippers.
  // eslint-disable-next-line no-console
  console.log(safeJson(line));
};

module.exports = {
  debug: (msg, meta) => log("debug", msg, meta),
  info: (msg, meta) => log("info", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  error: (msg, meta) => log("error", msg, meta),
};

