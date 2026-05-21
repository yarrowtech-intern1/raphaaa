const express = require("express");
const crypto = require("crypto");
const WalletLedger = require("../models/WalletLedger");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");
const { getAvailableCredits, earnCredit } = require("../services/walletService");
const razorpayInstance = require("../config/razorpay");

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

// @route POST /api/wallet/topup/create-order
// @desc Create a Razorpay order for wallet top-up
// @access Private
router.post("/topup/create-order", protect, async (req, res) => {
  try {
    const amount = Math.round(Number(req.body.amount));
    if (!amount || amount < 10 || amount > 100000) {
      return res.status(400).json({ message: "Amount must be between ₹10 and ₹1,00,000" });
    }

    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      notes: { userId: String(req.user._id), purpose: "wallet_topup" },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("wallet topup create-order error:", err);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

// @route POST /api/wallet/topup/verify
// @desc Verify Razorpay payment and credit wallet
// @access Private
router.post("/topup/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed: invalid signature" });
    }

    const entry = await earnCredit({
      userId: req.user._id,
      amount: Number(amount),
      refType: "topup",
      refId: razorpay_payment_id,
      note: `Wallet top-up via Razorpay`,
    });

    const newBalance = await getAvailableCredits(req.user._id);
    res.json({ success: true, entry, balance: newBalance });
  } catch (err) {
    console.error("wallet topup verify error:", err);
    res.status(500).json({ message: err.message || "Failed to verify payment" });
  }
});

// @route POST /api/wallet/admin-credit
// @desc Admin manually credits a user's wallet
// @access Private/Admin
router.post("/admin-credit", protect, admin, async (req, res) => {
  try {
    const { userId, amount, note, expiresAt } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const userExists = await User.exists({ _id: userId });
    if (!userExists) return res.status(404).json({ message: "User not found" });

    const entry = await earnCredit({
      userId,
      amount: Number(amount),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      refType: "admin_credit",
      refId: `admin_${Date.now()}`,
      note: note?.trim() || "Admin credit",
    });

    const balance = await getAvailableCredits(userId);
    res.status(201).json({ success: true, entry, balance });
  } catch (err) {
    console.error("admin-credit error:", err);
    res.status(400).json({ message: err.message || "Failed to credit wallet" });
  }
});

module.exports = router;

