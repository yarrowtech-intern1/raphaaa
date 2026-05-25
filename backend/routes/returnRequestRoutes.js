const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const ReturnRequest = require("../models/ReturnRequest");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, roleCheck } = require("../middleware/authMiddleware");
const {
  createShiprocketReturnOrder,
  getTrackingByAwb,
  mapTrackingToLocalStatus,
} = require("../utils/shiprocket");

const router = express.Router();
const upload = multer({ dest: "uploads/returns/" });

const ACTIVE_RETURN_STATUSES = [
  "requested",
  "approved",
  "pickup_scheduled",
  "picked_up",
  "in_transit_to_warehouse",
  "received_at_warehouse",
  "replacement_dispatched",
];

const pushTimeline = (doc, status, note, by) => {
  doc.timeline.push({ status, note: note || "", by: by || undefined, at: new Date() });
};

const mapReverseTrackingToReturnStatus = (trackingStatus, requestType) => {
  const mapped = mapTrackingToLocalStatus(trackingStatus);
  if (!mapped) return null;

  if (mapped === "Pickup Scheduled") return "pickup_scheduled";
  if (mapped === "Picked Up") return "picked_up";
  if (mapped === "In Transit") return "in_transit_to_warehouse";
  if (mapped === "Delivered") {
    return requestType === "replace" ? "replacement_dispatched" : "received_at_warehouse";
  }
  return null;
};

const syncSingleReturnRequest = async (requestDoc) => {
  const awb = requestDoc?.shiprocketReverse?.awbCode;
  if (!awb) return requestDoc;

  const tracking = await getTrackingByAwb(awb);
  const trackData = tracking?.tracking_data || {};
  const shipmentTrack = Array.isArray(trackData?.shipment_track) ? trackData.shipment_track : [];
  const latest = shipmentTrack.length ? shipmentTrack[0] : {};
  const currentStatus = latest?.current_status || trackData?.current_status || "";

  requestDoc.shiprocketReverse = {
    ...(requestDoc.shiprocketReverse || {}),
    trackingStatus: currentStatus,
    trackingUpdatedAt: new Date(),
    lastSyncAt: new Date(),
    rawTracking: trackData,
    syncError: "",
  };

  const next = mapReverseTrackingToReturnStatus(currentStatus, requestDoc.requestType);
  if (next && next !== requestDoc.status) {
    requestDoc.status = next;
    pushTimeline(requestDoc, next, `Auto-updated from Shiprocket: ${currentStatus}`, undefined);
  }

  await requestDoc.save();
  return requestDoc;
};

// Create return/replace request
router.post("/", protect, upload.array("evidence", 5), async (req, res) => {
  try {
    const {
      orderId,
      requestType = "return",
      reason,
      itemProductIds,
      itemReason,
      damageType,
      damageDescription,
    } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({ message: "orderId and reason are required" });
    }

    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.user?._id || order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Return/replace is allowed only for delivered orders" });
    }

    const existingOpen = await ReturnRequest.findOne({
      order: order._id,
      user: req.user._id,
      status: { $in: ACTIVE_RETURN_STATUSES },
    });
    if (existingOpen) {
      return res.status(400).json({ message: "An active return request already exists for this order" });
    }

    const selectedProductIds = String(itemProductIds || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const chosenOrderItems = order.orderItems.filter((it) => {
      if (!selectedProductIds.length) return true;
      return selectedProductIds.includes(String(it.productId));
    });

    if (!chosenOrderItems.length) {
      return res.status(400).json({ message: "No valid order items selected" });
    }

    const productIds = [...new Set(chosenOrderItems.map((it) => String(it.productId)))];
    const products = await Product.find({ _id: { $in: productIds } }).select("_id name returnPolicy");
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const deliveredAt = order.deliveredAt || order.updatedAt || order.createdAt;
    const now = new Date();
    let minPolicyDays = Number.MAX_SAFE_INTEGER;

    for (const it of chosenOrderItems) {
      const p = productMap.get(String(it.productId));
      const rp = p?.returnPolicy || {};
      const eligible = rp.eligible !== false;
      const days = Number.isFinite(Number(rp.days)) ? Number(rp.days) : 7;

      if (!eligible) {
        return res.status(400).json({
          message: `Return not allowed for product: ${p?.name || it.name}`,
        });
      }

      const deadline = new Date(deliveredAt);
      deadline.setDate(deadline.getDate() + Math.max(0, days));
      if (now > deadline) {
        return res.status(400).json({
          message: `Return window expired for product: ${p?.name || it.name}. Allowed till ${deadline.toDateString()}`,
        });
      }

      minPolicyDays = Math.min(minPolicyDays, Math.max(0, days));
    }

    const items = chosenOrderItems.map((it) => ({
      orderItemId: `${it.productId}-${it.sku || ""}-${it.size || ""}-${it.color || ""}`,
      productId: it.productId,
      name: it.name,
      quantity: it.quantity,
      reason: itemReason || reason,
      sku: it.sku || "",
      price: Number(it.price || 0),
    }));

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

    const policyDeadlineAt = new Date(deliveredAt);
    policyDeadlineAt.setDate(policyDeadlineAt.getDate() + (minPolicyDays === Number.MAX_SAFE_INTEGER ? 7 : minPolicyDays));

    const requestDoc = new ReturnRequest({
      order: order._id,
      user: req.user._id,
      requestType: requestType === "replace" ? "replace" : "return",
      reason,
      damageType: String(damageType || "").trim(),
      damageDescription: String(damageDescription || "").trim(),
      items,
      evidenceImages,
      policyWindowDays: minPolicyDays === Number.MAX_SAFE_INTEGER ? 7 : minPolicyDays,
      policyDeadlineAt,
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

    // Auto-approve and auto-create Shiprocket reverse pickup where possible.
    requestDoc.status = "approved";
    pushTimeline(requestDoc, "approved", "Auto-approved after return policy validation", undefined);

    try {
      const reverse = await createShiprocketReturnOrder({ order, returnRequest: requestDoc });
      requestDoc.shiprocketReverse = {
        returnOrderId: reverse.returnOrderId,
        shipmentId: reverse.shipmentId,
        awbCode: reverse.awbCode,
        courierName: reverse.courierName,
        rawResponse: reverse.rawResponse,
      };
      if (reverse.awbCode) {
        requestDoc.status = "pickup_scheduled";
        pushTimeline(requestDoc, "pickup_scheduled", "Pickup auto-scheduled with Shiprocket", undefined);
      }
    } catch (shipErr) {
      requestDoc.adminNote = `Shiprocket reverse pickup not auto-created: ${shipErr.message}`;
      pushTimeline(requestDoc, "approved", `Awaiting manual reverse setup. ${shipErr.message}`, undefined);
    }

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

// Admin list
router.get("/", protect, roleCheck("admin", "merchantise", "marketing"), async (_req, res) => {
  try {
    const requests = await ReturnRequest.find({})
      .populate("order", "orderId totalPrice status createdAt deliveredAt")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch return requests" });
  }
});

// Get single request
router.get("/:id", protect, async (req, res) => {
  try {
    const requestDoc = await ReturnRequest.findById(req.params.id)
      .populate("order", "orderId totalPrice status createdAt deliveredAt")
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

router.post("/:id/received", protect, roleCheck("admin", "merchantise", "marketing"), (req, res) =>
  adminUpdate(req, res, "received_at_warehouse", "Return parcel received at warehouse")
);

router.post("/:id/replacement-dispatched", protect, roleCheck("admin", "merchantise", "marketing"), (req, res) =>
  adminUpdate(req, res, "replacement_dispatched", "Replacement dispatched")
);

router.post("/:id/replacement-delivered", protect, roleCheck("admin", "merchantise", "marketing"), (req, res) =>
  adminUpdate(req, res, "replacement_delivered", "Replacement delivered")
);

router.post("/:id/sync-shiprocket", protect, roleCheck("admin", "merchantise", "marketing"), async (req, res) => {
  try {
    const requestDoc = await ReturnRequest.findById(req.params.id);
    if (!requestDoc) return res.status(404).json({ message: "Return request not found" });

    await syncSingleReturnRequest(requestDoc);
    res.json(requestDoc);
  } catch (error) {
    console.error("Return Shiprocket sync failed:", error);
    res.status(500).json({ message: "Failed to sync return request status" });
  }
});

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

// Internal utility used by scheduler in server.js
const syncShiprocketStatusesForOpenReturns = async (limit = 100) => {
  const docs = await ReturnRequest.find({
    status: { $in: ["approved", "pickup_scheduled", "picked_up", "in_transit_to_warehouse"] },
    "shiprocketReverse.awbCode": { $exists: true, $ne: null },
  })
    .sort({ updatedAt: -1 })
    .limit(limit);

  for (const doc of docs) {
    try {
      await syncSingleReturnRequest(doc);
    } catch (error) {
      doc.shiprocketReverse = {
        ...(doc.shiprocketReverse || {}),
        syncError: error?.message || "Sync failed",
        lastSyncAt: new Date(),
      };
      await doc.save();
    }
  }
};

module.exports = router;
module.exports.syncShiprocketStatusesForOpenReturns = syncShiprocketStatusesForOpenReturns;
