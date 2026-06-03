const mongoose = require("mongoose");

const sizeChartSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true, default: "Unisex" },
    chartImageUrl: { type: String, required: true, trim: true },
    measureImageUrl: { type: String, trim: true, default: "" },
    unit: { type: String, enum: ["in", "cm"], default: "in" },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SizeChart", sizeChartSchema);
