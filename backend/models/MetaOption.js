const mongoose = require("mongoose");

const metaOptionSchema = new mongoose.Schema({
  type: { type: String, enum: ["category", "collection", "gender", "material"], required: true },
  value: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

module.exports = mongoose.model("MetaOption", metaOptionSchema);
