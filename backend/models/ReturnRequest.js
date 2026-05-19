const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema(
  {
    orderItemId: { type: String, default: "" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const returnTimelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const returnRequestSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requestType: { type: String, enum: ["return", "replace"], required: true },
    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "pickup_scheduled", "picked_up", "refund_completed"],
      default: "requested",
      index: true,
    },
    reason: { type: String, required: true, trim: true },
    items: { type: [returnItemSchema], default: [] },
    evidenceImages: { type: [String], default: [] },
    adminNote: { type: String, default: "" },
    expectedResolutionDate: { type: Date },
    timeline: { type: [returnTimelineSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);

