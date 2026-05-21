const mongoose = require("mongoose");

const productAlertSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["back_in_stock", "price_drop"], required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    sku: { type: String, trim: true, default: "", index: true }, // subscribe per SKU/variant

    email: { type: String, trim: true, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // For price-drop alerts
    targetPrice: { type: Number, default: null },

    isActive: { type: Boolean, default: true, index: true },
    triggeredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productAlertSchema.index({ type: 1, productId: 1, sku: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("ProductAlert", productAlertSchema);

