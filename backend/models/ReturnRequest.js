const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema(
  {
    orderItemId: { type: String, default: "" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    sku: { type: String, default: "" },
    price: { type: Number, default: 0, min: 0 },
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
      enum: [
        "requested",
        "approved",
        "rejected",
        "pickup_scheduled",
        "picked_up",
        "in_transit_to_warehouse",
        "received_at_warehouse",
        "replacement_dispatched",
        "replacement_delivered",
        "refund_completed",
      ],
      default: "requested",
      index: true,
    },
    reason: { type: String, required: true, trim: true },
    damageType: { type: String, trim: true, default: "" },
    damageDescription: { type: String, trim: true, default: "" },
    items: { type: [returnItemSchema], default: [] },
    evidenceImages: { type: [String], default: [] },
    policyWindowDays: { type: Number, min: 0, default: 0 },
    policyDeadlineAt: { type: Date },
    shiprocketReverse: {
      returnOrderId: { type: mongoose.Schema.Types.Mixed },
      shipmentId: { type: mongoose.Schema.Types.Mixed },
      awbCode: { type: String },
      courierName: { type: String },
      trackingStatus: { type: String },
      trackingUpdatedAt: { type: Date },
      lastSyncAt: { type: Date },
      rawTracking: { type: mongoose.Schema.Types.Mixed },
      rawResponse: { type: mongoose.Schema.Types.Mixed },
      syncError: { type: String, default: "" },
    },
    adminNote: { type: String, default: "" },
    expectedResolutionDate: { type: Date },
    timeline: { type: [returnTimelineSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);
