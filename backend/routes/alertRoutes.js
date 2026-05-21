const express = require("express");
const ProductAlert = require("../models/ProductAlert");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const isEmail = (s) => /.+@.+\..+/.test(String(s || "").trim());

// @route POST /api/alerts/subscribe
// @desc Subscribe to back-in-stock or price-drop alert for a SKU
// @access Public (email-based); links can later be upgraded to user-based
router.post("/subscribe", async (req, res) => {
  try {
    const { type, productId, sku, email, targetPrice } = req.body || {};
    if (!["back_in_stock", "price_drop"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }
    if (!productId) return res.status(400).json({ message: "productId required" });
    if (!isEmail(email)) return res.status(400).json({ message: "Valid email required" });

    const product = await Product.findById(productId).select("_id isPublished price discountPrice");
    if (!product || !product.isPublished) return res.status(404).json({ message: "Product not found" });

    const doc = await ProductAlert.findOneAndUpdate(
      { type, productId, sku: String(sku || "").trim(), email: String(email).trim().toLowerCase() },
      {
        $set: {
          isActive: true,
          triggeredAt: null,
          targetPrice: type === "price_drop" ? Number(targetPrice || 0) : null,
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, alert: doc });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(200).json({ success: true, message: "Already subscribed" });
    }
    console.error("alert subscribe error:", err);
    res.status(500).json({ message: "Failed to subscribe" });
  }
});

// @route POST /api/alerts/unsubscribe
// @desc Disable an alert subscription
// @access Public
router.post("/unsubscribe", async (req, res) => {
  try {
    const { type, productId, sku, email } = req.body || {};
    if (!type || !productId || !email) return res.status(400).json({ message: "type, productId, email required" });

    await ProductAlert.updateOne(
      { type, productId, sku: String(sku || "").trim(), email: String(email).trim().toLowerCase() },
      { $set: { isActive: false } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("alert unsubscribe error:", err);
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
});

// @route GET /api/alerts/my
// @desc List alerts for logged-in user (by email)
// @access Private
router.get("/my", protect, async (req, res) => {
  try {
    const email = String(req.user.email || "").trim().toLowerCase();
    const items = await ProductAlert.find({ email, isActive: true })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(items);
  } catch (err) {
    console.error("alert list error:", err);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
});

module.exports = router;

