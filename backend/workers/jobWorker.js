const axios = require("axios");
const { sendMail } = require("../utils/sendMail");
const logger = require("../utils/logger");
const { claimNextJob, markSuccess, markFailure } = require("../services/jobQueue");

async function handleJob(job) {
  const { type, payload } = job;

  if (type === "send_email") {
    const { to, subject, message, attachments } = payload || {};
    if (!to || !subject || !message) throw new Error("Invalid email payload");
    await sendMail({ to, subject, message, attachments });
    return;
  }

  if (type === "webhook") {
    const { url, method = "POST", headers = {}, body = null, timeoutMs = 15000 } = payload || {};
    if (!url) throw new Error("Invalid webhook payload");
    await axios({
      url,
      method,
      headers,
      data: body,
      timeout: timeoutMs,
      validateStatus: (s) => s >= 200 && s < 300,
    });
    return;
  }

  if (type === "stock_sync") {
    // Placeholder for future stock sync integrations.
    return;
  }

  throw new Error(`Unknown job type: ${type}`);
}

function startJobWorker({ intervalMs = 500, concurrency = 1 } = {}) {
  let stopped = false;

  const tick = async () => {
    if (stopped) return;
    const job = await claimNextJob();
    if (!job) return;
    try {
      await handleJob(job);
      await markSuccess(job);
    } catch (err) {
      logger.error("job_failed", { jobId: String(job._id), type: job.type, error: String(err?.message || err) });
      await markFailure(job, err);
    }
  };

  const timers = [];
  for (let i = 0; i < Math.max(1, concurrency); i++) {
    timers.push(setInterval(tick, intervalMs));
  }

  logger.info("job_worker_started", { intervalMs, concurrency });

  return () => {
    stopped = true;
    for (const t of timers) clearInterval(t);
  };
}

module.exports = { startJobWorker };

