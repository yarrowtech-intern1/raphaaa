const express = require("express");
const WalletLedger = require("../models/WalletLedger");
const { protect, admin } = require("../middleware/authMiddleware");
const { getAvailableCredits, earnCredit } = require("../services/walletService");

const router = express.Router();

// @route GET /api/wallet
// @desc Wallet balance + recent ledger
// @access Private
router.get("/", protect, async (req, res) => {
  try {
    const balance = await getAvailableCredits(req.user._id);
    const ledger = await WalletLedger.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, balance, ledger });
  } catch (err) {
    console.error("wallet get error:", err);
    res.status(500).json({ success: false, message: "Failed to load wallet" });
  }
});

// @route POST /api/wallet/earn
// @desc Admin/manual credit (or future cashback credit)
// @access Private/Admin
router.post("/earn", protect, admin, async (req, res) => {
  try {
    const { userId, amount, expiresAt, note } = req.body || {};
    const entry = await earnCredit({
      userId,
      amount,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      refType: "manual",
      refId: `manual_${Date.now()}`,
      note: note || "Manual credit",
    });
    res.status(201).json({ success: true, entry });
  } catch (err) {
    console.error("wallet earn error:", err);
    res.status(400).json({ success: false, message: err.message || "Failed to credit wallet" });
  }
});

module.exports = router;

