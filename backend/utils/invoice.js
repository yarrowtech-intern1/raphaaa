const PDFDocument = require("pdfkit");

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("en-IN");
}

function safe(value, fallback = "-") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

async function buildInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 28 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const SKY = "#87CEEB";
      const BLUE = "#1E3A8A";
      const DARK = "#111827";
      const MUTED = "#6B7280";
      const BORDER = "#D1D5DB";

      const pageW = doc.page.width;
      const pageH = doc.page.height;
      const left = 28;
      const right = pageW - 28;

      doc.rect(0, 0, pageW, 16).fill(SKY);
      doc.rect(0, 16, pageW, 4).fill(BLUE);
      doc.rect(0, pageH - 20, pageW, 4).fill(SKY);
      doc.rect(0, pageH - 16, pageW, 16).fill(BLUE);

      doc.fillColor(DARK).font("Helvetica-Bold").fontSize(18).text("TAX INVOICE", left, 30);
      doc.fontSize(13).text("Raphaaa - By CitiMart", left, 54);
      doc.font("Helvetica").fontSize(9).fillColor(MUTED);
      doc.text("Esplanade, Kolkata, West Bengal, India", left, 72);
      doc.text("Phone: +91 99323 63636  |  Email: support@gmail.com  |  raphaaa.com", left, 84);

      const createdAt = formatDate(order.createdAt);
      const invoiceNo = safe(order.orderId || order._id);
      const paymentMethod = safe(order.paymentMethod);
      const paymentStatus = safe(order.paymentStatus);
      const transactionId = safe(
        order?.paymentResult?.id || order?.razorpayPaymentId,
        "N/A"
      );

      doc.font("Helvetica-Bold").fontSize(10).fillColor(DARK);
      doc.text("Invoice No:", 345, 34);
      doc.text("Invoice Date:", 345, 49);
      doc.text("Payment Method:", 345, 64);
      doc.text("Payment Status:", 345, 79);
      doc.text("Txn ID:", 345, 94);
      doc.font("Helvetica").fillColor(MUTED);
      doc.text(invoiceNo, 435, 34, { width: 130, align: "right" });
      doc.text(createdAt, 435, 49, { width: 130, align: "right" });
      doc.text(paymentMethod, 435, 64, { width: 130, align: "right" });
      doc.text(paymentStatus, 435, 79, { width: 130, align: "right" });
      doc.text(transactionId, 435, 94, { width: 130, align: "right" });

      const ship = order.shippingAddress || {};
      const customerName = safe(order?.user?.name, "Customer");
      const customerEmail = safe(order?.user?.email, "-");
      const customerPhone = safe(ship.phone, "-");
      const addressLine = `${safe(ship.address, "")}, ${safe(ship.city, "")}, ${safe(ship.postalCode, "")}, ${safe(ship.country, "")}`
        .replace(/\s+,/g, ",")
        .replace(/^,\s*/, "");

      doc.roundedRect(left, 118, right - left, 68, 6).lineWidth(1).strokeColor(BORDER).stroke();
      doc.font("Helvetica-Bold").fontSize(10).fillColor(DARK).text("Bill To", left + 10, 126);
      doc.font("Helvetica").fontSize(9).fillColor(MUTED);
      doc.text(customerName, left + 10, 141);
      doc.text(customerEmail, left + 10, 154);
      doc.text(`Phone: ${customerPhone}`, 280, 141);
      doc.text(addressLine || "-", 280, 154, { width: right - 290 });

      const headers = [
        { label: "Sl", x: left, w: 24, align: "left" },
        { label: "Product", x: left + 24, w: 170, align: "left" },
        { label: "SKU / Design", x: left + 194, w: 96, align: "left" },
        { label: "Color", x: left + 290, w: 52, align: "left" },
        { label: "Size", x: left + 342, w: 36, align: "left" },
        { label: "Qty", x: left + 378, w: 32, align: "right" },
        { label: "Rate", x: left + 410, w: 64, align: "right" },
        { label: "Amount", x: left + 474, w: 62, align: "right" },
      ];

      const tableY = 200;
      const rowH = 14;
      const tableBottomLimit = 650;
      const maxRows = Math.max(1, Math.floor((tableBottomLimit - tableY - 24) / rowH));
      const items = Array.isArray(order.orderItems) ? order.orderItems : [];
      const displayItems = items.slice(0, maxRows);

      doc.rect(left, tableY, right - left, 20).fill("#EFF6FF").strokeColor(BORDER).stroke();
      doc.font("Helvetica-Bold").fontSize(9).fillColor(DARK);
      headers.forEach((h) => doc.text(h.label, h.x + 2, tableY + 6, { width: h.w - 4, align: h.align }));

      let y = tableY + 20;
      doc.font("Helvetica").fontSize(8.5).fillColor("#1F2937");
      displayItems.forEach((item, idx) => {
        doc.rect(left, y, right - left, rowH).strokeColor("#E5E7EB").lineWidth(0.6).stroke();
        const qty = Number(item?.quantity || 0);
        const rate = Number(item?.price || 0);
        const amount = qty * rate;

        doc.text(String(idx + 1), headers[0].x + 2, y + 3, { width: headers[0].w - 4 });
        doc.text(safe(item?.name), headers[1].x + 2, y + 3, { width: headers[1].w - 4, ellipsis: true });
        doc.text(safe(item?.sku || item?.productId?.sku), headers[2].x + 2, y + 3, { width: headers[2].w - 4, ellipsis: true });
        doc.text(safe(item?.color), headers[3].x + 2, y + 3, { width: headers[3].w - 4, ellipsis: true });
        doc.text(safe(item?.size), headers[4].x + 2, y + 3, { width: headers[4].w - 4, ellipsis: true });
        doc.text(String(qty), headers[5].x + 2, y + 3, { width: headers[5].w - 4, align: "right" });
        doc.text(rate.toFixed(2), headers[6].x + 2, y + 3, { width: headers[6].w - 4, align: "right" });
        doc.text(amount.toFixed(2), headers[7].x + 2, y + 3, { width: headers[7].w - 4, align: "right" });
        y += rowH;
      });

      if (items.length > displayItems.length) {
        doc.font("Helvetica-Oblique").fontSize(8).fillColor(MUTED);
        doc.text(
          `+ ${items.length - displayItems.length} more item(s) not shown to keep single-page layout.`,
          left + 2,
          y + 3
        );
      }

      const subtotal = items.reduce(
        (sum, it) => sum + Number(it?.price || 0) * Number(it?.quantity || 0),
        0
      );
      const taxRate = 0;
      const tax = subtotal * taxRate;
      const roundOff = 0;
      const grandTotal = subtotal + tax + roundOff;

      const totalsY = Math.min(Math.max(y + 16, 540), 668);
      doc.roundedRect(350, totalsY, 214, 86, 6).lineWidth(1).strokeColor(BORDER).stroke();
      doc.font("Helvetica").fontSize(9).fillColor(DARK);
      doc.text("Sub Total", 360, totalsY + 12, { width: 100 });
      doc.text(subtotal.toFixed(2), 460, totalsY + 12, { width: 94, align: "right" });
      doc.text("Tax (0%)", 360, totalsY + 30, { width: 100 });
      doc.text(tax.toFixed(2), 460, totalsY + 30, { width: 94, align: "right" });
      doc.text("Round Off", 360, totalsY + 48, { width: 100 });
      doc.text(roundOff.toFixed(2), 460, totalsY + 48, { width: 94, align: "right" });
      doc.font("Helvetica-Bold").fontSize(11);
      doc.text("Grand Total (INR)", 360, totalsY + 66, { width: 120 });
      doc.text(grandTotal.toFixed(2), 460, totalsY + 66, { width: 94, align: "right" });

      doc.font("Helvetica").fontSize(8.5).fillColor(MUTED);
      doc.text("This is a computer-generated invoice. No signature required.", left, 760, {
        width: right - left,
        align: "center",
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { buildInvoicePDF };
