const mongoose = require("mongoose");

const zoneRateSchema = new mongoose.Schema(
  {
    zone:        { type: String, required: true, trim: true }, // "A","B","C","D"
    label:       { type: String, required: true, trim: true }, // "Local", "Regional"…
    extraCharge: { type: Number, required: true, default: 0, min: 0 },
    // pincode prefixes (first 2 digits) that belong to this zone
    pinPrefixes: [{ type: String, trim: true }],
  },
  { _id: false }
);

const shippingConfigSchema = new mongoose.Schema(
  {
    // Only one config document ever exists (singleton)
    singleton: { type: String, default: "global", unique: true },

    baseShippingFee:        { type: Number, default: 99,   min: 0 },
    freeShippingThreshold:  { type: Number, default: 999,  min: 0 },
    firstOrderFreeShipping: { type: Boolean, default: true },
    codExtraCharge:         { type: Number, default: 0,    min: 0 },

    zoneRates: {
      type: [zoneRateSchema],
      default: [
        { zone: "A", label: "Local",    extraCharge: 0,  pinPrefixes: [] },
        { zone: "B", label: "Regional", extraCharge: 20, pinPrefixes: [] },
        { zone: "C", label: "National", extraCharge: 40, pinPrefixes: [] },
        { zone: "D", label: "Remote",   extraCharge: 80, pinPrefixes: [] },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShippingConfig", shippingConfigSchema);
