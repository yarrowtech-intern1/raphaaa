const mongoose = require("mongoose");

const walletLedgerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Earn adds positive credits, redeem consumes available credits.
    type: { type: String, enum: ["earn", "redeem", "expire", "adjust"], required: true },
    amount: { type: Number, required: true }, // positive numbers only

    // For credits (earn/adjust), optionally expire.
    expiresAt: { type: Date, default: null, index: true },

    // Linking for idempotency and audit
    refType: { type: String, trim: true, default: "" }, // e.g. "order", "checkout"
    refId: { type: String, trim: true, default: "" },

    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

walletLedgerSchema.index({ user: 1, createdAt: -1 });
walletLedgerSchema.index({ refType: 1, refId: 1 }, { sparse: true });

module.exports = mongoose.model("WalletLedger", walletLedgerSchema);

