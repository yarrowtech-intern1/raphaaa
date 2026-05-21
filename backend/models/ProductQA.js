const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestName: { type: String, default: null },
    answer: { type: String, required: true, trim: true },
    isSellerAnswer: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const qaSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestName: { type: String, default: null },
    question: { type: String, required: true, trim: true },
    answers: [answerSchema],
    helpful: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductQA", qaSchema);
