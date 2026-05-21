const express = require("express");
const crypto  = require("crypto");
const User    = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { earnCredit } = require("../services/walletService");

const router = express.Router();

const REFERRER_REWARD  = 100; // ₹ credited to referrer when referee places first order
const REFEREE_REWARD   = 50;  // ₹ credited to new user on signup with referral

// Generate a unique 8-char referral code for the logged-in user
function makeCode(userId) {
  return crypto
    .createHash("sha256")
    .update(String(userId))
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
}

// GET /api/referral/my-code  — get or create referral code
router.get("/my-code", protect, async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("referralCode referralCount name email");
    if (!user.referralCode) {
      user.referralCode = makeCode(user._id);
      await user.save();
    }
    const referralLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/register?ref=${user.referralCode}`;
    res.json({
      referralCode: user.referralCode,
      referralLink,
      referralCount: user.referralCount || 0,
      referrerReward: REFERRER_REWARD,
      refereeReward:  REFEREE_REWARD,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get referral code" });
  }
});

// POST /api/referral/apply  — called at registration with ref code
// Body: { referralCode }
router.post("/apply", protect, async (req, res) => {
  try {
    const { referralCode } = req.body;
    if (!referralCode) return res.status(400).json({ message: "Referral code required" });

    // Prevent re-applying
    const me = await User.findById(req.user._id);
    if (me.referredBy) return res.status(400).json({ message: "Referral already applied" });

    const referrer = await User.findOne({ referralCode: String(referralCode).toUpperCase() });
    if (!referrer) return res.status(404).json({ message: "Invalid referral code" });
    if (String(referrer._id) === String(req.user._id))
      return res.status(400).json({ message: "Cannot refer yourself" });

    // Link referral
    me.referredBy = referrer._id;
    await me.save();

    referrer.referralCount = (referrer.referralCount || 0) + 1;
    await referrer.save();

    // Credit the new user immediately
    await earnCredit({
      userId: me._id,
      amount: REFEREE_REWARD,
      refType: "referral_signup",
      refId: String(referrer._id),
      note: `Welcome bonus — referred by ${referrer.name}`,
    });

    res.json({ success: true, reward: REFEREE_REWARD });
  } catch (err) {
    console.error("referral apply error:", err);
    res.status(500).json({ message: "Failed to apply referral" });
  }
});

// Internal helper exported for order routes: credit referrer on first purchase
async function creditReferrerOnFirstOrder(userId, orderTotal) {
  try {
    const user = await User.findById(userId).select("referredBy");
    if (!user?.referredBy) return;
    // Only credit on first paid order
    const Order = require("../models/Order");
    const orderCount = await Order.countDocuments({ user: userId, isPaid: true });
    if (orderCount !== 1) return; // only on the very first order
    await earnCredit({
      userId: user.referredBy,
      amount: REFERRER_REWARD,
      refType: "referral_purchase",
      refId: String(userId),
      note: `Referral reward — your friend placed their first order`,
    });
  } catch (_) {}
}

module.exports = router;
module.exports.creditReferrerOnFirstOrder = creditReferrerOnFirstOrder;
