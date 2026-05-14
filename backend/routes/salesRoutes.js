const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Get product sales performance (for admin/merchandise dashboard)
// @route   GET /api/sales/analysis
// @access  Private (admin & merchandise)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({ isPaid: true }).populate("orderItems.productId");
    const salesMap = new Map();
    for (const order of orders) {
      for (const item of order.orderItems || []) {
        const product = item.productId;
        if (!product) continue;

        const key = [
          product._id.toString(),
          item.sku || "-",
          item.size || "-",
          item.color || "-",
        ].join("||");

        if (!salesMap.has(key)) {
          salesMap.set(key, {
            productId: product._id,
            name: product.name,
            category: product.category,
            gender: product.gender || "Unisex",
            sku: item.sku || "-",
            size: item.size || "-",
            color: item.color || "-",
            totalSold: 0,
            totalRevenue: 0,
          });
        }

        const entry = salesMap.get(key);
        entry.totalSold += Number(item.quantity) || 0;
        entry.totalRevenue += (Number(item.quantity) || 0) * (Number(item.price) || 0);
      }
    }

    const result = [...salesMap.values()].sort((a, b) => b.totalSold - a.totalSold);

    res.json(result);
  } catch (error) {
    console.error("Sales analysis error:", error);
    res.status(500).json({
      message: "Failed to fetch sales analysis",
      error: error.message,
    });
  }
});


module.exports = router;
