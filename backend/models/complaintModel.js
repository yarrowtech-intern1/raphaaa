const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    complaintType: {
      type: String,
      required: true,
      enum: [
        'Damaged Product',
        'Missing Item',
        'Wrong Product Delivered',
        'Late Delivery',
        'Other',
      ],
    },
    description: { type: String, required: true },
    // image: { type: String },
    images: [{ type: String }], // ✅ changed from single image to array
    status: {
      type: String,
      enum: ['Pending', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
