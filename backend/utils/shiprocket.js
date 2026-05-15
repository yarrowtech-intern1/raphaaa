const axios = require("axios");
const Order = require("../models/Order");

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";
let tokenCache = { token: null, expiresAt: 0 };
const OPEN_SHIPMENT_STATUSES = [
  "Shipped",
  "Pickup Scheduled",
  "Picked Up",
  "In Transit",
  "Out For Delivery",
];
const ORDER_STATUS_ENUM = new Set([
  "Processing",
  "Packed",
  "Pickup Scheduled",
  "Picked Up",
  "Shipped",
  "In Transit",
  "Out For Delivery",
  "Delivered",
  "RTO Initiated",
  "RTO Delivered",
  "Cancelled",
]);

const getShiprocketToken = async () => {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiresAt > now + 60 * 1000) {
    return tokenCache.token;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new Error("Shiprocket credentials missing (SHIPROCKET_EMAIL/SHIPROCKET_PASSWORD)");
  }

  const { data } = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
    email,
    password,
  });

  tokenCache = {
    token: data.token,
    expiresAt: now + 8 * 24 * 60 * 60 * 1000,
  };
  return data.token;
};

const shiprocketClient = async () => {
  const token = await getShiprocketToken();
  return axios.create({
    baseURL: SHIPROCKET_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 20000,
  });
};

const parseCustomerName = (fullName) => {
  const value = String(fullName || "").trim();
  if (!value) return { first: "Customer", last: "" };
  const parts = value.split(/\s+/);
  return { first: parts[0], last: parts.slice(1).join(" ") || "" };
};

const buildShiprocketOrderPayload = (order) => {
  const shipAddress = order.shippingAddress || {};
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || "Home";
  const fallbackState = process.env.SHIPROCKET_DEFAULT_STATE || "West Bengal";
  const fallbackCountry = shipAddress.country || "India";
  const phone = String(shipAddress.phone || "").replace(/[^\d]/g, "").slice(-10);
  const email = order?.user?.email || "customer@example.com";

  // Prefer explicit firstName/lastName; fall back to parsing the customer name from order user
  const { first: fallbackFirst, last: fallbackLast } = parseCustomerName(order?.user?.name || "");
  const billingFirst = String(shipAddress.firstName || "").trim() || fallbackFirst;
  const billingLast  = String(shipAddress.lastName  || "").trim() || fallbackLast;

  // Full delivery address (include landmark if present)
  const fullAddress = [shipAddress.address, shipAddress.landmark]
    .filter(Boolean).join(", ") || "Address not provided";

  return {
    order_id: order.orderId || String(order._id),
    order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 19).replace("T", " "),
    pickup_location: pickupLocation,
    channel_id: "",
    comment: "Created from Raphaaa OMS",
    billing_customer_name: billingFirst,
    billing_last_name: billingLast,
    billing_address: fullAddress,
    billing_city: shipAddress.city || "Unknown",
    billing_pincode: String(shipAddress.postalCode || "000000"),
    billing_state: shipAddress.state || fallbackState,
    billing_country: fallbackCountry,
    billing_email: email,
    billing_phone: phone || "9999999999",
    shipping_is_billing: true,
    order_items: (order.orderItems || []).map((item) => ({
      name: item.name || "Item",
      sku: item.sku || `SKU-${String(item.productId || "NA")}`,
      units: Number(item.quantity) || 1,
      selling_price: Number(item.price) || 0,
      discount: "",
      tax: "",
      hsn: "",
    })),
    payment_method:
      order.paymentMethod === "cash_on_delivery" ? "COD" : "Prepaid",
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: Number(order.totalPrice) || 0,
    length: Number(process.env.SHIPROCKET_PACKAGE_LENGTH || 10),
    breadth: Number(process.env.SHIPROCKET_PACKAGE_BREADTH || 10),
    height: Number(process.env.SHIPROCKET_PACKAGE_HEIGHT || 10),
    weight: Number(process.env.SHIPROCKET_PACKAGE_WEIGHT || 0.5),
  };
};

const createShiprocketOrder = async (order) => {
  if (!order) throw new Error("Order not provided");
  if (order?.shiprocket?.awbCode || order?.shiprocket?.shipmentId) return order.shiprocket;

  const client = await shiprocketClient();
  const payload = buildShiprocketOrderPayload(order);
  const { data } = await client.post("/orders/create/adhoc", payload);

  if (data?.status_code >= 400 || data?.status === false) {
    throw new Error(data?.message || "Shiprocket order creation failed");
  }

  const shipment = data?.shipment_id ? data : data?.data || {};
  return {
    shipmentId: shipment?.shipment_id || null,
    shiprocketOrderId: shipment?.order_id || null,
    awbCode: shipment?.awb_code || null,
    courierName: shipment?.courier_name || null,
  };
};

const getTrackingByAwb = async (awbCode) => {
  if (!awbCode) throw new Error("AWB code required");
  const client = await shiprocketClient();
  const { data } = await client.get(`/courier/track/awb/${awbCode}`);
  return data;
};

const toTitleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();

const mapTrackingToLocalStatus = (trackingStatus) => {
  const raw = String(trackingStatus || "").trim();
  if (!raw) return null;
  const s = raw.toLowerCase();

  if (s.includes("rto delivered")) return "RTO Delivered";
  if (s.includes("rto")) return "RTO Initiated";
  if (s.includes("out for delivery")) return "Out For Delivery";
  if (s.includes("in transit")) return "In Transit";
  if (s.includes("pickup") && s.includes("schedule")) return "Pickup Scheduled";
  if (s.includes("pickup")) return "Picked Up";
  if (s.includes("deliver")) return "Delivered";
  if (s.includes("cancel")) return "Cancelled";
  if (s.includes("ship")) return "Shipped";
  if (s.includes("pack")) return "Packed";
  const normalized = toTitleCase(raw);
  return ORDER_STATUS_ENUM.has(normalized) ? normalized : null;
};

const syncOrderTrackingStatus = async (orderDoc) => {
  if (!orderDoc?.shiprocket?.awbCode) return orderDoc;
  if (["Delivered", "Cancelled", "RTO Delivered"].includes(orderDoc.status)) return orderDoc;

  const tracking = await getTrackingByAwb(orderDoc.shiprocket.awbCode);
  const trackData = tracking?.tracking_data || {};
  const shipmentTrack = Array.isArray(trackData?.shipment_track) ? trackData.shipment_track : [];
  const latest = shipmentTrack.length ? shipmentTrack[0] : {};
  const mapped = mapTrackingToLocalStatus(latest?.current_status || trackData?.current_status);

  orderDoc.shiprocket = {
    ...(orderDoc.shiprocket || {}),
    trackingStatus: latest?.current_status || trackData?.current_status || orderDoc.shiprocket?.trackingStatus,
    trackingStatusCode: latest?.current_status_code || null,
    trackingUpdatedAt: new Date(),
    lastSyncAt: new Date(),
    rawTracking: trackData,
  };

  if (mapped) {
    orderDoc.status = mapped;
    if (mapped === "Delivered") {
      orderDoc.isDelivered = true;
      orderDoc.deliveredAt = orderDoc.deliveredAt || new Date();
      if (orderDoc.paymentMethod === "cash_on_delivery") {
        orderDoc.isPaid = true;
        orderDoc.paidAt = orderDoc.paidAt || new Date();
        orderDoc.paymentStatus = "paid";
      }
    }
    if (["Cancelled", "RTO Delivered"].includes(mapped)) {
      orderDoc.isDelivered = false;
    }
  }

  await orderDoc.save();
  return orderDoc;
};

const syncShiprocketStatusesForOpenOrders = async (limit = 50) => {
  const candidates = await Order.find({
    status: { $in: OPEN_SHIPMENT_STATUSES },
    "shiprocket.awbCode": { $exists: true, $ne: null },
  })
    .sort({ updatedAt: -1 })
    .limit(limit);

  for (const order of candidates) {
    try {
      await syncOrderTrackingStatus(order);
    } catch (error) {
      console.error(`Shiprocket sync failed for order ${order._id}:`, error.message);
    }
  }
};

const checkDeliveryServiceability = async ({
  deliveryPostcode,
  cod = 0,
  weight = null,
}) => {
  const pickupPostcode = String(
    process.env.SHIPROCKET_PICKUP_POSTCODE ||
      process.env.SHIPROCKET_PICKUP_PINCODE ||
      ""
  ).trim();

  if (!pickupPostcode) {
    throw new Error(
      "Missing SHIPROCKET_PICKUP_POSTCODE in environment for delivery check"
    );
  }

  const deliveryPin = String(deliveryPostcode || "").trim();
  if (!/^\d{6}$/.test(deliveryPin)) {
    throw new Error("Valid 6-digit delivery pincode is required");
  }

  const parcelWeight = Number(weight || process.env.SHIPROCKET_PACKAGE_WEIGHT || 0.5);
  const client = await shiprocketClient();
  const { data } = await client.get("/courier/serviceability/", {
    params: {
      pickup_postcode: pickupPostcode,
      delivery_postcode: deliveryPin,
      cod: Number(cod) ? 1 : 0,
      weight: Number.isFinite(parcelWeight) ? parcelWeight : 0.5,
    },
  });

  const companies = data?.data?.available_courier_companies || [];
  const firstCourier = companies[0] || null;
  return {
    serviceable: companies.length > 0,
    pickupPostcode,
    deliveryPostcode: deliveryPin,
    courierCount: companies.length,
    estimatedDays: firstCourier?.estimated_delivery_days ?? null,
    estimatedDate: firstCourier?.etd ?? null,
    courierName: firstCourier?.courier_name || null,
    codAvailable:
      firstCourier?.cod === 1 ||
      firstCourier?.cod === true ||
      firstCourier?.is_cod_available === 1 ||
      firstCourier?.is_cod_available === true,
    availableCouriers: companies.slice(0, 5).map((c) => ({
      courierName: c?.courier_name || null,
      estimatedDays: c?.estimated_delivery_days ?? null,
      estimatedDate: c?.etd ?? null,
      cod:
        c?.cod === 1 ||
        c?.cod === true ||
        c?.is_cod_available === 1 ||
        c?.is_cod_available === true,
      rate: c?.rate ?? null,
    })),
  };
};

module.exports = {
  createShiprocketOrder,
  syncOrderTrackingStatus,
  syncShiprocketStatusesForOpenOrders,
  checkDeliveryServiceability,
};
