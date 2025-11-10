// utils/invoice.js
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

/** Build an invoice PDF Buffer for a given order */
async function buildInvoicePDF(order) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 36 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      /* --------- Brand colors (sky → blue) --------- */
      const SKY = "#87CEEB";
      const BLUE = "#1E3A8A";
      const pageW = doc.page.width;
      const pageH = doc.page.height;

      // Top bar
      doc
        .save()
        .rect(0, 0, pageW, 18)
        .fill(SKY)
        .rect(0, 18, pageW, 4)
        .fill(BLUE)
        .restore();

      // Footer bar
      doc
        .save()
        .rect(0, pageH - 22, pageW, 4)
        .fill(SKY)
        .rect(0, pageH - 18, pageW, 18)
        .fill(BLUE)
        .restore();

      /* --------- Header / Seller --------- */
      doc
        .fillColor("#111")
        .fontSize(16)
        .text("Raphaaa - By CitiMart", 36, 36 + 24);
      doc
        .fontSize(9)
        .fillColor("#444")
        .text("Esplanade, Kolkata, West Bengal, India");
      doc.text(
        "Phone: +91 99323 63636  •  Email: support@gmail.com  •  raphaaa.com"
      );

      /* --------- Invoice meta --------- */
      const createdAt = order.createdAt
        ? new Date(order.createdAt)
        : new Date();
      const invDateStr = `${createdAt.toLocaleDateString()} ${createdAt
        .toLocaleTimeString()
        .slice(0, 5)}`;

      doc.moveDown(1);
      doc.fontSize(11).fillColor("#111").text(`Invoice: ${order._id}`);
      doc.fontSize(10).fillColor("#555").text(`Invoice Date: ${invDateStr}`);
      doc.text(`Payment Method: ${order.paymentMethod || "—"}`);

      /* --------- Buyer / Ship To --------- */
      const ship = order.shippingAddress || {};
      const shipLine1 = [ship.address, ship.city].filter(Boolean).join(", ");
      const shipLine2 = [ship.state, ship.country, ship.postalCode]
        .filter(Boolean)
        .join(" • ");
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .fillColor("#111")
        .text("Bill To:", { continued: true })
        .fillColor("#444")
        .text(`  ${order.user?.name || "Customer"}`);
      doc.fillColor("#444").fontSize(10).text(shipLine1);
      doc.text(shipLine2);
      if (ship.phone) doc.text(`Phone: +91 ${ship.phone}`);

      /* --------- Totals base (for QR amount) --------- */
      const subtotal = (order.orderItems || []).reduce(
        (sum, it) => sum + Number(it?.price || 0) * Number(it?.quantity || 0),
        0
      );
      const IGST_RATE = 0.0; // keep in sync with frontend/PDF
      const roundOff = 0.0;
      const grandTotal = subtotal + subtotal * IGST_RATE + roundOff;

      /* --------- QR (encodes id + amount + method) --------- */
      const qrPayload = JSON.stringify({
        invoiceId: String(order._id),
        amount: Number(grandTotal.toFixed(2)),
        pay: order.paymentMethod || "COD",
      });
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 256,
        margin: 1,
      });
      const qrBuf = Buffer.from(qrDataUrl.split(",")[1], "base64");
      doc.image(qrBuf, pageW - 36 - 72, 36 + 24, { width: 72 });

      /* --------- Items table (with Qty→Color gap) --------- */
      doc.moveDown(1.2);
      const startY = doc.y + 8;

      // Column X positions
      const GAP = 10; // visual gap between Qty and Color
      const X_SL = 36;
      const X_ITEM = X_SL + 24;
      const X_SKU = X_ITEM + 220;
      const X_QTY = X_SKU + 80;
      const X_COLOR = X_QTY + 32 + GAP; // gap added here
      const X_SIZE = X_COLOR + 60;
      const X_AMT = X_SIZE + 40;

      // Header row
      doc.fontSize(10).fillColor("#111");
      doc.text("Sl.", X_SL, startY, { width: 24 });
      doc.text("Item", X_ITEM, startY, { width: 220 });
      doc.text("SKU", X_SKU, startY, { width: 80 });
      doc.text("Qty", X_QTY, startY, { width: 32, align: "right" });
      doc.text("Color", X_COLOR, startY, { width: 60 });
      doc.text("Size", X_SIZE, startY, { width: 40, align: "right" });
      doc.text("Amount (INR)", X_AMT, startY, { width: 70, align: "right" });

      doc
        .moveTo(36, startY + 14)
        .lineTo(pageW - 36, startY + 14)
        .strokeColor("#1E3A8A")
        .lineWidth(0.6)
        .stroke();

      // Rows with auto-fit to one page
      const items = order.orderItems || [];
      let baseFont = 10;
      let rowH = 16;
      const headerH = 20;
      const bottomReserve = 120; // keep space for totals & footer
      const available = pageH - (startY + headerH) - bottomReserve;
      const need = items.length * rowH;

      if (need > available) {
        baseFont = 9; rowH = 14;
        if (items.length * rowH > available) {
          baseFont = 8; rowH = 12;
        }
      }
      doc.fontSize(baseFont);

      let rowY = startY + headerH;
      items.forEach((it, idx) => {
        const qty = Number(it?.quantity || 0);
        const rate = Number(it?.price || 0);
        const amount = qty * rate;

        doc.fillColor("#333");
        doc.text(String(idx + 1), X_SL, rowY, { width: 24 });
        doc.text(it?.name || "-", X_ITEM, rowY, { width: 220 });
        doc.text(it?.sku || "-", X_SKU, rowY, { width: 80 });
        doc.text(`${qty}`, X_QTY, rowY, { width: 32, align: "right" });
        doc.text(it?.color || "-", X_COLOR, rowY, { width: 60 });
        doc.text(it?.size || "-", X_SIZE, rowY, { width: 40, align: "right" });
        doc.text(amount.toFixed(2), X_AMT, rowY, { width: 70, align: "right" });

        rowY += rowH;
      });

      /* --------- Totals ---------- */
      const totalsY = Math.min(rowY + 8, pageH - 120);
      doc
        .moveTo(36, totalsY)
        .lineTo(pageW - 36, totalsY)
        .strokeColor("#1E3A8A")
        .lineWidth(0.6)
        .stroke();

      const num = (n) => Number(n || 0).toFixed(2);
      const rightX = pageW - 36;

      doc.fontSize(10).fillColor("#111");
      doc.text("SubTotal:", rightX - 150, totalsY + 8, {
        width: 80,
        align: "right",
      });
      doc.text(num(subtotal), rightX - 60, totalsY + 8, {
        width: 60,
        align: "right",
      });
      doc.text("IGST:", rightX - 150, totalsY + 26, {
        width: 80,
        align: "right",
      });
      doc.text(`${(IGST_RATE * 100).toFixed(0)} %`, rightX - 60, totalsY + 26, {
        width: 60,
        align: "right",
      });
      doc.text("Round Off:", rightX - 150, totalsY + 44, {
        width: 80,
        align: "right",
      });
      doc.text(num(roundOff), rightX - 60, totalsY + 44, {
        width: 60,
        align: "right",
      });

      doc
        .fontSize(12)
        .fillColor("#111")
        .text("Total:", rightX - 150, totalsY + 66, {
          width: 80,
          align: "right",
        });
      doc
        .font("Helvetica-Bold")
        .text(num(grandTotal), rightX - 60, totalsY + 66, {
          width: 60,
          align: "right",
        });
      doc.font("Helvetica");

      /* --------- Footer note ---------- */
      doc
        .fontSize(9)
        .fillColor("#666")
        .text("This is a Computer Generated Invoice", 36, pageH - 36 - 10, {
          width: pageW - 72,
          align: "center",
        });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { buildInvoicePDF };
