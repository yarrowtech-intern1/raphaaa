const cron = require("node-cron");
const Product = require("./models/Product");
const Subscriber = require("./models/Subscriber");
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const User = require("./models/User");
const { sendMail } = require("./utils/sendMail");

// ── Cart Abandonment Emails (runs every hour) ──
// Sends a reminder 1 hour after a cart was last modified if the user hasn't ordered since.
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);

    // Carts last touched between 1–2 hours ago that still have items
    const abandonedCarts = await Cart.find({
      user: { $exists: true, $ne: null },
      updatedAt: { $gte: twoHoursAgo, $lte: oneHourAgo },
      "products.0": { $exists: true },
    }).populate("user", "name email");

    for (const cart of abandonedCarts) {
      if (!cart.user?.email) continue;

      // Skip if user already placed an order after the cart was last updated
      const recentOrder = await Order.findOne({
        user: cart.user._id,
        createdAt: { $gte: cart.updatedAt },
      });
      if (recentOrder) continue;

      const itemsHtml = cart.products
        .slice(0, 5)
        .map(
          (p) => `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:10px;background:#f8fafc;border-radius:10px;">
            <img src="${p.image || ""}" alt="${p.name}" style="width:60px;height:72px;object-fit:cover;border-radius:8px;" />
            <div>
              <p style="margin:0;font-weight:600;color:#1e293b;">${p.name}</p>
              <p style="margin:0;font-size:12px;color:#64748b;">${p.color ? p.color + " · " : ""}${p.size ? "Size " + p.size : ""}</p>
              <p style="margin:0;font-weight:700;color:#0284c7;">₹${Number(p.price).toLocaleString("en-IN")} × ${p.quantity}</p>
            </div>
          </div>`
        )
        .join("");

      const totalValue = cart.products.reduce(
        (s, p) => s + Number(p.price) * p.quantity,
        0
      );

      await sendMail({
        to: cart.user.email,
        subject: "You left something behind 🛒 — Your cart is waiting!",
        message: `
          <p style="font-size:17px;font-weight:700;color:#0f172a;">Hey ${cart.user.name?.split(" ")[0] || "there"},</p>
          <p style="color:#475569;">You've got items in your cart — don't let them slip away!</p>
          ${itemsHtml}
          <p style="font-size:16px;font-weight:700;color:#0284c7;margin:16px 0;">
            Cart Total: ₹${totalValue.toLocaleString("en-IN")}
          </p>
          <a href="${process.env.FRONTEND_URL || "https://raphaaa.onrender.com"}/checkout"
            style="display:inline-block;padding:12px 28px;background:#0284c7;color:#fff;font-weight:700;border-radius:10px;text-decoration:none;margin-top:8px;">
            Complete Your Order →
          </a>
          <p style="font-size:12px;color:#94a3b8;margin-top:24px;">
            Your cart is saved and ready. Free shipping on all orders.
          </p>`,
      });
    }

    if (abandonedCarts.length > 0)
      console.log(`✅ Cart abandonment emails sent: ${abandonedCarts.length}`);
  } catch (err) {
    console.error("❌ Cart abandonment email error:", err);
  }
});

// ── Newsletter: new arrivals ──
cron.schedule("*/1 * * * *", async () => {
  try {
    const newProducts = await Product.find().sort({ createdAt: -1 }).limit(5);
    const subscribers = await Subscriber.find({ isSubscribed: true });

    if (newProducts.length === 0 || subscribers.length === 0) return;

    const itemsHtml = newProducts.map(p => `
      <p><strong>${p.name}</strong> - <a href="https://raphaaa.onrender.com/product/${p._id}">View Product</a></p>
    `).join("");

    for (const s of subscribers) {
      await sendMail({
        to: s.email,
        subject: "🛍️ This Week's Latest from Raphaaa",
        message: `
          <p>Hey fashion lover,</p>
          <p>Here are some of the hottest new arrivals just for you:</p>
          ${itemsHtml}
          <p style="font-size:12px;margin-top:20px;">
            Don’t want these emails? <a href="https://raphaaa-backend.onrender.com/api/unsubscribe/${encodeURIComponent(s.email)}">Unsubscribe</a>
          </p>
        `,
      });
    }
    console.log("✅ Daily product update emails sent.");
    console.log("✅ Automated newsletter sent to all subscribers.");
  } catch (err) {
    console.error("❌ Error sending daily product update emails:", err);
  }
});
