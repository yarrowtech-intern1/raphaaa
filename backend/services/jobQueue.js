const Job = require("../models/Job");

const nowPlusMs = (ms) => new Date(Date.now() + ms);

async function enqueueJob(type, payload, opts = {}) {
  const runAt = opts.runAt ? new Date(opts.runAt) : new Date();
  const maxAttempts = Number.isFinite(opts.maxAttempts) ? Number(opts.maxAttempts) : 8;
  return Job.create({ type, payload, runAt, maxAttempts, status: "queued" });
}

async function claimNextJob({ types = null } = {}) {
  const q = {
    status: "queued",
    runAt: { $lte: new Date() },
    lockedAt: null,
  };
  if (Array.isArray(types) && types.length > 0) q.type = { $in: types };

  return Job.findOneAndUpdate(
    q,
    { $set: { status: "processing", lockedAt: new Date() }, $inc: { attempts: 1 } },
    { sort: { runAt: 1, createdAt: 1 }, new: true }
  );
}

function backoffMs(attempt) {
  // Exponential backoff with cap.
  const base = 1000 * Math.pow(2, Math.min(10, Math.max(0, attempt - 1)));
  return Math.min(base, 15 * 60 * 1000);
}

async function markSuccess(job) {
  await Job.updateOne({ _id: job._id }, { $set: { status: "succeeded", lockedAt: null, lastError: "" } });
}

async function markFailure(job, err) {
  const msg = String(err?.message || err || "Job failed");
  const attempts = Number(job.attempts || 0);
  const maxAttempts = Number(job.maxAttempts || 8);

  if (attempts >= maxAttempts) {
    await Job.updateOne(
      { _id: job._id },
      { $set: { status: "failed", lockedAt: null, lastError: msg } }
    );
    return;
  }

  const delay = backoffMs(attempts);
  await Job.updateOne(
    { _id: job._id },
    { $set: { status: "queued", lockedAt: null, runAt: nowPlusMs(delay), lastError: msg } }
  );
}

module.exports = {
  enqueueJob,
  claimNextJob,
  markSuccess,
  markFailure,
};

