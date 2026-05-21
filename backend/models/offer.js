const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  bannerImage: String, // optional Cloudinary URL
  alertImage: String, // 🆕 Optional portrait image for popup alerts

  // Phase 4: Promo rule engine
  // If rule/benefit are omitted, legacy fields below can still apply.
  priority: { type: Number, default: 100 },
  stackable: { type: Boolean, default: true }, // if false, blocks later promos
  exclusiveGroup: { type: String, trim: true, default: "" }, // only one per group can apply
  couponCode: { type: String, trim: true, default: "" }, // optional

  // Matching conditions
  conditions: {
    minCartSubtotal: { type: Number, min: 0 },
    newUserOnly: { type: Boolean, default: false },
    paymentMethods: [{ type: String, trim: true }], // e.g. "COD", "Razorpay", "PayPal"
    includeProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    excludeProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    includeCategories: [{ type: String, trim: true }],
    includeBrands: [{ type: String, trim: true }],
  },

  // What the promo gives
  benefit: {
    scope: { type: String, enum: ["product", "cart", "shipping"], default: "product" },
    type: { type: String, enum: ["percent", "flat", "free_shipping"], default: "percent" },
    percent: { type: Number, min: 0, max: 100 },
    amount: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
  },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },

  // Legacy fields (kept for backwards compatibility with existing admin UI)
  offerPercentage: { type: Number, default: 0 },
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
}, { timestamps: true });

offerSchema.index({ isActive: 1, startDate: 1, endDate: 1, priority: 1 });
offerSchema.index({ couponCode: 1 }, { sparse: true });

module.exports = mongoose.model("Offer", offerSchema);
