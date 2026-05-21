const ProductAlert = require("../models/ProductAlert");
const Product = require("../models/Product");
const { enqueueJob } = require("../services/jobQueue");

const clampMoney = (n) => Math.max(0, Math.round((Number(n) || 0) * 100) / 100);

function resolveSkuStock(product, sku) {
  const skuNorm = String(sku || "").trim().toLowerCase();
  if (!skuNorm) return null;

  // colorVariants
  if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
    for (const cv of product.colorVariants) {
      for (const sz of cv.sizes || []) {
        if (String(sz?.sku || "").trim().toLowerCase() === skuNorm) {
          return Number(sz?.countInStock || 0);
        }
      }
    }
  }
  // legacy variants
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const v = product.variants.find((x) => String(x?.sku || "").trim().toLowerCase() === skuNorm);
    if (v) return Number(v.countInStock || 0);
  }
  // product-level sku fallback
  if (String(product.sku || "").trim().toLowerCase() === skuNorm) {
    return Number(product.countInStock || 0);
  }
  return null;
}

function currentProductPrice(product) {
  const p = product.discountPrice || product.price || 0;
  return clampMoney(p);
}

async function triggerBackInStockForProduct(productId) {
  const product = await Product.findById(productId).lean();
  if (!product || !product.isPublished) return { triggered: 0 };

  const alerts = await ProductAlert.find({
    type: "back_in_stock",
    productId,
    isActive: true,
    triggeredAt: null,
  }).lean();

  let triggered = 0;
  for (const a of alerts) {
    const stock = resolveSkuStock(product, a.sku);
    if (stock === null || stock <= 0) continue;

    const subject = `Back in stock: ${product.name}`;
    const link = `https://raphaaa.onrender.com/product/${product._id}`;
    const msg = `
      <h2>Good news!</h2>
      <p><strong>${product.name}</strong> is back in stock${a.sku ? ` (SKU: ${a.sku})` : ""}.</p>
      <p><a href="${link}">View product</a></p>
    `;
    try {
      await enqueueJob("send_email", { to: a.email, subject, message: msg });
      await ProductAlert.updateOne({ _id: a._id }, { $set: { triggeredAt: new Date(), isActive: false } });
      triggered += 1;
    } catch (err) {
      console.error("back-in-stock send failed:", err?.message || err);
    }
  }
  return { triggered };
}

async function triggerPriceDropForProduct(productId) {
  const product = await Product.findById(productId).lean();
  if (!product || !product.isPublished) return { triggered: 0 };
  const price = currentProductPrice(product);

  const alerts = await ProductAlert.find({
    type: "price_drop",
    productId,
    isActive: true,
    triggeredAt: null,
    targetPrice: { $ne: null },
  }).lean();

  let triggered = 0;
  for (const a of alerts) {
    const target = Number(a.targetPrice || 0);
    if (target <= 0) continue;
    if (price > target) continue;

    const subject = `Price drop: ${product.name}`;
    const link = `https://raphaaa.onrender.com/product/${product._id}`;
    const msg = `
      <h2>Price drop alert</h2>
      <p><strong>${product.name}</strong> is now <strong>₹${price}</strong>.</p>
      <p>Your target price was ₹${target}.</p>
      <p><a href="${link}">View product</a></p>
    `;
    try {
      await enqueueJob("send_email", { to: a.email, subject, message: msg });
      await ProductAlert.updateOne({ _id: a._id }, { $set: { triggeredAt: new Date(), isActive: false } });
      triggered += 1;
    } catch (err) {
      console.error("price-drop send failed:", err?.message || err);
    }
  }
  return { triggered };
}

async function scanAndTriggerAlerts({ limitProducts = 200 } = {}) {
  // Batch process pending alerts by productId to reduce DB reads.
  const pending = await ProductAlert.aggregate([
    { $match: { isActive: true, triggeredAt: null } },
    { $group: { _id: "$productId" } },
    { $limit: limitProducts },
  ]);

  let totalTriggered = 0;
  for (const row of pending) {
    const productId = row._id;
    const r1 = await triggerBackInStockForProduct(productId);
    const r2 = await triggerPriceDropForProduct(productId);
    totalTriggered += (r1.triggered || 0) + (r2.triggered || 0);
  }

  return { totalTriggered };
}

module.exports = {
  triggerBackInStockForProduct,
  triggerPriceDropForProduct,
  scanAndTriggerAlerts,
};
