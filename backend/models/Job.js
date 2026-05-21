const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, index: true }, // send_email, webhook, stock_sync
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },

    status: {
      type: String,
      enum: ["queued", "processing", "succeeded", "failed"],
      default: "queued",
      index: true,
    },

    runAt: { type: Date, default: Date.now, index: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 8 },

    lockedAt: { type: Date, default: null, index: true },
    lastError: { type: String, default: "" },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, runAt: 1, lockedAt: 1 });

module.exports = mongoose.model("Job", jobSchema);

