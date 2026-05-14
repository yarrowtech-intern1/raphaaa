const express = require("express");
const Product = require("../models/Product");
const { protect, admin, adminOrMerchantise } = require("../middleware/authMiddleware");
const { getJson, setJson } = require("../utils/redisCache");

const router = express.Router();

// @route GET /api/admin/products
// @desc Get all products (Admin only)
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
    try {
        const query =
            req.user?.role === "merchantise"
                ? { user: req.user._id }
                : {};

        const cacheKey = `role:${req.user.role}:uid:${req.user._id}:products`;
        const cached = await getJson("dashboard", cacheKey);
        if (cached) return res.json(cached);

        const products = await Product.find(query).populate("user", "name email role");
        await setJson("dashboard", cacheKey, products, 60);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

module.exports = router;
