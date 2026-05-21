const crypto = require("crypto");
const logger = require("../utils/logger");

const getRequestId = (req) => {
  const header = req.headers["x-request-id"];
  if (header && String(header).trim()) return String(header).trim().slice(0, 64);
  if (crypto.randomUUID) return crypto.randomUUID();
  return crypto.randomBytes(16).toString("hex");
};

module.exports = function requestTracing(req, res, next) {
  const startNs = process.hrtime.bigint();
  const requestId = getRequestId(req);
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const durMs = Number(process.hrtime.bigint() - startNs) / 1e6;
    logger.info("http_request", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durMs * 100) / 100,
      ip: req.ip,
      userId: req.user?._id ? String(req.user._id) : undefined,
    });
  });

  next();
};

