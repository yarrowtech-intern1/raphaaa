const WalletLedger = require("../models/WalletLedger");

const clampMoney = (n) => Math.max(0, Math.round((Number(n) || 0) * 100) / 100);

async function getAvailableCredits(userId, now = new Date()) {
  const credits = await WalletLedger.find({
    user: userId,
    type: { $in: ["earn", "adjust"] },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  })
    .sort({ createdAt: 1 })
    .lean();

  const debits = await WalletLedger.find({
    user: userId,
    type: { $in: ["redeem", "expire"] },
  }).lean();

  const totalCredits = credits.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const totalDebits = debits.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  return clampMoney(totalCredits - totalDebits);
}

async function earnCredit({ userId, amount, expiresAt = null, refType = "", refId = "", note = "" }) {
  const amt = clampMoney(amount);
  if (amt <= 0) throw new Error("Invalid amount");

  // Idempotency: if an earn already exists for this ref, return it.
  if (refType && refId) {
    const existing = await WalletLedger.findOne({ user: userId, type: "earn", refType, refId });
    if (existing) return existing;
  }

  return WalletLedger.create({
    user: userId,
    type: "earn",
    amount: amt,
    expiresAt,
    refType,
    refId,
    note,
  });
}

async function redeem({ userId, amount, refType = "", refId = "", note = "" }) {
  const amt = clampMoney(amount);
  if (amt <= 0) throw new Error("Invalid amount");

  // Idempotency: if a redeem already exists for this ref, return it.
  if (refType && refId) {
    const existing = await WalletLedger.findOne({ user: userId, type: "redeem", refType, refId });
    if (existing) return existing;
  }

  const available = await getAvailableCredits(userId);
  if (available < amt) {
    const err = new Error("Insufficient wallet balance");
    err.code = "INSUFFICIENT_WALLET";
    throw err;
  }

  return WalletLedger.create({
    user: userId,
    type: "redeem",
    amount: amt,
    refType,
    refId,
    note,
  });
}

async function expireDueCredits({ now = new Date(), limit = 500 } = {}) {
  // This is a simplified expiry model: when a credit has expired, we insert an "expire" debit
  // for the amount of credits that are expired but not yet expired.
  const credits = await WalletLedger.find({
    type: { $in: ["earn", "adjust"] },
    expiresAt: { $ne: null, $lte: now },
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

  let expiredCount = 0;
  for (const c of credits) {
    const alreadyExpired = await WalletLedger.exists({
      user: c.user,
      type: "expire",
      refType: "wallet_credit",
      refId: String(c._id),
    });
    if (alreadyExpired) continue;

    await WalletLedger.create({
      user: c.user,
      type: "expire",
      amount: clampMoney(c.amount),
      refType: "wallet_credit",
      refId: String(c._id),
      note: "Credit expired",
    });
    expiredCount += 1;
  }

  return { expiredCount };
}

module.exports = {
  getAvailableCredits,
  earnCredit,
  redeem,
  expireDueCredits,
};

