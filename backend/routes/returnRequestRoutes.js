const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const ReturnRequest = require("../models/ReturnRequest");
const Order = require("../models/Order");
const { protect, roleCheck } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ dest: "uploads/returns/" });

const pushTimeline = (doc, status, note, by) => {
  doc.timeline.push({ status, note: note || "", by: by || undefined, at: new Date() });
};

// Create return/replace request
router.post("/", protect, upload.array("evidence", 5), async (req, res) => {
  try {
    const { orderId, requestType = "return", reason, itemProductIds, itemReason } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({ message: "orderId and reason are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Return/replace is allowed only for delivered orders" });
    }

    const existingOpen = await ReturnRequest.findOne({
      order: order._id,
      user: req.user._id,
      status: { $in: ["requested", "approved", "pickup_scheduled", "picked_up"] },
    });
    if (existingOpen) {
      return res.status(400).json({ message: "An active return request already exists for this order" });
    }

    const selectedProductIds = String(itemProductIds || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const items = order.orderItems
      .filter((it) => {
        if (!selectedProductIds.length) return true;
        return selectedProductIds.includes(String(it.productId));
      })
      .map((it) => ({
        orderItemId: `${it.productId}-${it.sku || ""}-${it.size || ""}-${it.color || ""}`,
        productId: it.productId,
        name: it.name,
        quantity: it.quantity,
        reason: itemReason || reason,
      }));

    if (!items.length) {
      return res.status(400).json({ message: "No valid order items selected" });
    }

    const evidenceImages = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "returns",
          transformation: [{ width: 800, crop: "limit" }],
        });
        evidenceImages.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    const expectedResolutionDate = new Date();
    expectedResolutionDate.setDate(expectedResolutionDate.getDate() + 7);

    const requestDoc = new ReturnRequest({
      order: order._id,
      user: req.user._id,
      requestType: requestType === "replace" ? "replace" : "return",
      reason,
      items,
      evidenceImages,
      expectedResolutionDate,
      timeline: [
        {
          status: "requested",
          note: "Request created by customer",
          by: req.user._id,
          at: new Date(),
        },
      ],
    });

    await requestDoc.save();
    res.status(201).json(requestDoc);
  } catch (error) {
    console.error("Create return request error:", error);
    res.status(500).json({ message: "Failed to create return request" });
  }
});

// List my requests
router.get("/my", protect, async (req, res) => {
  try {
    const requests = await ReturnRequest.find({ user: req.user._id })
      .populate("order", "orderId totalPrice status createdAt")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch return requests" });
  }
});

// Get single request
router.get("/:id", protect, async (req, res) => {
  try {
    const requestDoc = await ReturnRequest.findById(req.params.id)
      .populate("order", "orderId totalPrice status createdAt")
      .populate("user", "name email");
    if (!requestDoc) return res.status(404).json({ message: "Return request not found" });

    const isOwner = String(requestDoc.user?._id || requestDoc.user) === String(req.user._id);
    const isAdmin = ["admin", "merchantise", "marketing"].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not authorized" });

    res.json(requestDoc);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch return request" });
  }
});

const adminUpdate = async (req, res, nextStatus, defaultNote) => {
  try {
    const requestDoc = await ReturnRequest.findById(req.params.id);
    if (!requestDoc) return res.status(404).json({ message: "Return request not found" });

    requestDoc.status = nextStatus;
    if (req.body?.adminNote) requestDoc.adminNote = req.body.adminNote;
    if (req.body?.expectedResolutionDate) {
      requestDoc.expectedResolutionDate = new Date(req.body.expectedResolutionDate);
    }
    pushTimeline(requestDoc, nextStatus, req.body?.note || defaultNote, req.user._id);
    await requestDoc.save();

    res.json(requestDoc);
  } catch (error) {
    console.error("Update return request error:", error);
    res.status(500).json({ message: "Failed to update return request" });
  }
};

router.post("/:id/approve", protect, roleCheck("admin", "merchantise", "marketing"), (req, res) =>
  adminUpdate(req, res, "approved", "Request approved")
);

router.post("/:id/reject", protect, roleCheck("admin", "merchantise", "marketing"), (req, res) =>
  adminUpdate(req, res, "rejected", "Request rejected")
);

router.post("/:id/pickup", protect, roleCheck("admin", "merchantise", "marketing"), (req, res) =>
  adminUpdate(req, res, "pickup_scheduled", "Pickup scheduled")
);

router.post("/:id/picked-up", protect, roleCheck("admin", "merchantise", "marketing"), (req, res) =>
  adminUpdate(req, res, "picked_up", "Item picked up")
);

router.post("/:id/refund-complete", protect, roleCheck("admin", "merchantise", "marketing"), async (req, res) => {
  try {
    const requestDoc = await ReturnRequest.findById(req.params.id);
    if (!requestDoc) return res.status(404).json({ message: "Return request not found" });

    requestDoc.status = "refund_completed";
    if (req.body?.adminNote) requestDoc.adminNote = req.body.adminNote;
    pushTimeline(requestDoc, "refund_completed", req.body?.note || "Refund completed", req.user._id);
    await requestDoc.save();

    const order = await Order.findById(requestDoc.order);
    if (order) {
      order.refundTimeline = {
        status: "completed",
        initiatedAt: order.refundTimeline?.initiatedAt || new Date(),
        processedAt: order.refundTimeline?.processedAt || new Date(),
        completedAt: new Date(),
        expectedDate: order.refundTimeline?.expectedDate,
        note: req.body?.note || "Refund completed",
      };
      await order.save();
    }

    res.json(requestDoc);
  } catch (error) {
    console.error("Refund complete update failed:", error);
    res.status(500).json({ message: "Failed to complete refund" });
  }
});

module.exports = router;

