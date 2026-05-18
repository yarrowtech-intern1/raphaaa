const express = require("express");
const SizeChart = require("../models/SizeChart");
const { protect, adminOrMerchantise } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/size-charts?audience=Men
router.get("/", async (req, res) => {
  try {
    const audience = String(req.query.audience || "").trim();
    const query = { isActive: true };
    if (audience) {
      query.audience = { $in: [audience, "Unisex"] };
    }
    const charts = await SizeChart.find(query).sort({ createdAt: -1 });
    res.json(charts);
  } catch (error) {
    console.error("Failed to fetch size charts:", error);
    res.status(500).json({ message: "Failed to fetch size charts" });
  }
});

// POST /api/size-charts
router.post("/", protect, adminOrMerchantise, async (req, res) => {
  try {
    const { name, audience, chartImageUrl, measureImageUrl, unit } = req.body;
    if (!name || !chartImageUrl) {
      return res.status(400).json({ message: "Name and chart image are required" });
    }

    const chart = await SizeChart.create({
      name: String(name).trim(),
      audience: audience || "Unisex",
      chartImageUrl: String(chartImageUrl).trim(),
      measureImageUrl: measureImageUrl ? String(measureImageUrl).trim() : "",
      unit: unit || "in",
      createdBy: req.user._id,
    });

    res.status(201).json(chart);
  } catch (error) {
    console.error("Failed to create size chart:", error);
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid size chart data" });
    }
    res.status(500).json({ message: "Failed to create size chart" });
  }
});

// DELETE /api/size-charts/:id
router.delete("/:id", protect, adminOrMerchantise, async (req, res) => {
  try {
    const chart = await SizeChart.findById(req.params.id);
    if (!chart) return res.status(404).json({ message: "Size chart not found" });
    chart.isActive = false;
    await chart.save();
    res.json({ message: "Size chart archived" });
  } catch (error) {
    console.error("Failed to archive size chart:", error);
    res.status(500).json({ message: "Failed to archive size chart" });
  }
});

module.exports = router;

