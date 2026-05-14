// src/pages/OrderDetailsPage.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchOrderDetails } from "../redux/slices/orderSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { orderDetails, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [dispatch, id]);

  // compute totals from orderItems (safe numeric conversion)
  const computedQuantity = (orderDetails?.orderItems || []).reduce(
    (acc, it) => acc + (Number(it?.quantity) || 0),
    0
  );

  const computedSubtotal = (orderDetails?.orderItems || []).reduce(
    (sum, it) => sum + (Number(it?.price) || 0) * (Number(it?.quantity) || 0),
    0
  );


  // ✅ Converts numeric total to words
  const convertNumberToWords = (amount) => {
    const a = [
      "",
      "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if ((amount = amount.toString()).length > 9) return "Overflow";
    let n = ("000000000" + amount).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{3})$/);
    if (!n) return;
    let str = "";
    str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore " : "";
    str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh " : "";
    str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand " : "";
    str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " " : "";
    return str.trim();
  };

  // ✅ Generate modern styled invoice (no logic changed)
  const generatePDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ✅ Fetch company details dynamically
    let companyInfo = {};
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/settings/contact`);
      companyInfo = await res.json();
    } catch (err) {
      console.error("Failed to fetch company info:", err);
    }

    // ✅ Add faint watermark
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(50);
    doc.text("RAPHAAA", pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: 45,
    });
    doc.setTextColor(0, 0, 0);

    // ✅ Background color strip for header
    doc.setFillColor(230, 242, 255);
    doc.rect(0, 0, pageWidth, 20, "F");

    // ✅ Logo (top-left)
    try {
      const logo = "/logo1.png"; // Ensure this image exists in your public folder
      doc.addImage(logo, "PNG", 14, 5, 20, 10);
    } catch (err) {
      console.error("Logo not found:", err);
    }

    // Header text
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text("RAPHAAA - Tax Invoice", 40, 12);

    // ✅ Invoice meta header details (with better top spacing)
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("Invoice Type: TAX INVOICE / RETAIL INVOICE", 14, 25); // shifted slightly down
    doc.text(`Invoice No: RPH-${new Date().getFullYear()}-${orderDetails?._id?.slice(-6)}`, 14, 30);
    doc.text(`Website: www.raphaaa.com`, 14, 35);

    // Seller info
    doc.setFontSize(10);
    doc.text("RAPHAAA Fashion Pvt. Ltd.", 14, 42);
    doc.text("Kolkata, West Bengal, 700001", 14, 47);
    doc.text(`GSTIN: ${companyInfo?.gstn || "19AAACR1234A1ZB"}`, 14, 52);
    doc.text(`Email: ${companyInfo?.gmail || "support@raphaaa.com"}`, 14, 57);
    doc.text(`Phone: ${companyInfo?.phone || "+91 98765 43210"}`, 14, 62);

    // Buyer info
    doc.setFont("helvetica", "bold");
    doc.text("Buyer (Bill To):", 120, 42);
    doc.setFont("helvetica", "normal");
    doc.text(`${orderDetails?.user?.name || "Customer"}`, 120, 47);
    doc.text(`${orderDetails?.user?.email || ""}`, 120, 52);
    doc.text(`Phone: ${orderDetails?.shippingAddress?.phone || "N/A"}`, 120, 57);
    const buyerAddress = `${orderDetails?.shippingAddress?.address || ""}, ${orderDetails?.shippingAddress?.city || ""}, ${orderDetails?.shippingAddress?.country || ""} - ${orderDetails?.shippingAddress?.postalCode || ""}`;
    doc.text(buyerAddress, 120, 62, { maxWidth: 80 });

    // ✅ Product Table
    autoTable(doc, {
      startY: 72,
      head: [["#", "Description", "Variant", "SKU / HSN", "Qty", "Rate", "Per", "Disc.%", "Amount"]],
      body: (orderDetails?.orderItems || []).map((item, i) => [
        i + 1,
        item?.name || "-",
        `${item?.variant ? item.variant : `${item?.size || "-"} / ${item?.color || "-"}`}`,
        item?.product?.sku || item?.sku || "-",
        item?.quantity ?? 0,
        item?.price?.toFixed(2) ?? "0.00",
        "pcs",
        "0%",
        `INR. ${((item?.quantity ?? 0) * (item?.price ?? 0)).toFixed(2)}`,
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [63, 149, 255],
        textColor: 255,
        halign: "center",
      },
      styles: {
        fontSize: 9,
        cellPadding: 2,
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 255],
      },
    });

    // Totals
    const subtotal = (orderDetails?.orderItems || []).reduce(
      (sum, item) => sum + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );
    const gst = subtotal * 0.05;
    const total = subtotal + gst;

    const y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: INR. ${subtotal.toFixed(2)}`, 150, y);
    doc.text(`GST (5%): INR. ${gst.toFixed(2)}`, 150, y + 5);
    doc.text(`Total: INR. ${total.toFixed(2)}`, 150, y + 10);

    // Amount in words
    const numberToWords = (num) => {
      if (num === 0) return "Zero";
      const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"];
      const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
      const convert = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
        if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
        if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
        return "";
      };
      return convert(num);
    };
    const amountWords = numberToWords(Math.round(total));
    doc.text(`Amount Chargeable (in words):`, 14, y + 20);
    doc.text(`INR ${amountWords} Only`, 14, y + 25);

    // Declaration + Terms
    doc.setFontSize(9);
    doc.text("Declaration:", 14, y + 35);
    doc.text(
      "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      14,
      y + 40,
      { maxWidth: 180 }
    );

    doc.text("Terms & Conditions:", 14, y + 50);
    const terms = [
      "1. Goods once sold will not be returned or refunded.",
      "2. Prices include all applicable taxes.",
      `3. For support: ${companyInfo.email || "support@raphaaa.com"} | ${companyInfo.phone || "+91 98765 43210"}`,
    ];
    terms.forEach((t, i) => doc.text(t, 14, y + 55 + i * 5));

    // ✅ Digital Signature + Authorized Signatory
    try {
      const signatureImg = "/signature.png"; // Ensure this file exists
      const imgWidth = 40;
      const imgHeight = 20;
      const imgX = 150;
      const imgY = y + 65;
      doc.addImage(signatureImg, "PNG", imgX, imgY, imgWidth, imgHeight);
    } catch (err) {
      console.error("Signature image not found:", err);
    }

    doc.setFontSize(10);
    doc.text("Authorised Signatory", 150, y + 90);

    // ✅ Page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 25, pageHeight - 10);
    }

    // ✅ Footer background strip
    doc.setFillColor(230, 242, 255);
    doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Thank you for shopping with RAPHAAA!", 70, pageHeight - 10);

    doc.save(`Raphaaa_Invoice_${orderDetails?._id || "NA"}.pdf`);
  };






  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-6 animate-pulse">
        <div className="h-8 w-44 bg-gray-200 mb-4 rounded"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );

  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-800">
          Order Details
        </h2>

        {orderDetails && (
          <button
            onClick={generatePDF}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 text-white px-4 py-2 font-medium shadow-md hover:bg-sky-700 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01.88-2.545l4.12-5.49a2 2 0 113.2 2.31L12.2 15H17a2 2 0 110 4H7a2 2 0 110-4z"
              />
            </svg>
            Download Invoice
          </button>
        )}
      </div>

      {!orderDetails ? (
        <p>No Order details found</p>
      ) : (
        <div className="rounded-xl bg-white p-4 sm:p-6 shadow-xl border border-sky-100">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <h3 className="text-lg md:text-xl font-semibold">
                Order ID:{" "}
                <span className="text-gray-700"># {orderDetails?._id}</span>
              </h3>
              <p className="text-gray-500">
                {orderDetails?.createdAt
                  ? new Date(orderDetails.createdAt).toLocaleDateString()
                  : ""}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${orderDetails?.isPaid
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                  }`}
              >
                {orderDetails?.isPaid ? "Paid" : "Unpaid"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${orderDetails?.status === "Delivered"
                  ? "bg-emerald-50 text-emerald-700"
                  : ["Shipped", "In Transit", "Out For Delivery", "Picked Up", "Pickup Scheduled"].includes(orderDetails?.status)
                    ? "bg-amber-50 text-amber-700"
                    : ["Cancelled", "RTO Initiated", "RTO Delivered"].includes(orderDetails?.status)
                      ? "bg-rose-50 text-rose-700"
                    : "bg-gray-100 text-gray-700"
                  }`}
              >
                {orderDetails?.status || "Pending"}
              </span>
            </div>
          </div>

          {orderDetails?.shiprocket?.trackingStatus && (
            <div className="mb-5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
              Shiprocket Status: {orderDetails.shiprocket.trackingStatus}
            </div>
          )}

          {/* Customer Info */}
          {orderDetails?.user && (
            <div className="mb-8">
              <h4 className="mb-2 text-lg font-semibold text-sky-700">
                Customer Info
              </h4>
              <div className="grid sm:grid-cols-3 gap-3 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-900">Name:</span>{" "}
                  {orderDetails?.user?.name}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Email:</span>{" "}
                  {orderDetails?.user?.email}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Phone:</span>{" "}
                  {orderDetails?.shippingAddress?.phone
                    ? `+91 ${orderDetails.shippingAddress.phone}`
                    : "N/A"}
                </p>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="overflow-x-auto">
            <h4 className="mb-4 text-lg font-semibold text-sky-700">
              Ordered Products
            </h4>
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-sky-50 text-sky-700">
                <tr>
                  <th className="py-2 px-3 text-left">Name</th>
                  <th className="py-2 px-3">Qty</th>
                  <th className="py-2 px-3">Price</th>
                  <th className="py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {(orderDetails?.orderItems || []).map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={item?.image}
                          alt={item?.name || "Product"}
                          className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200"
                        />
                        <div className="text-sm">
                          <Link
                            to={`/product/${item?.productId?._id || item?.productId}/p/${item?.sku}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {item?.name || "-"}
                          </Link>
                          <p className="text-gray-500">Color: {item?.color || "N/A"}</p>
                          <p className="text-gray-500">Size: {item?.size || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">{item?.quantity}</td>
                    <td className="py-2 px-3 text-center">₹{item?.price}</td>
                    <td className="py-2 px-3 text-center">
                      ₹{item?.price * item?.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-between items-center">
            <Link to="/my-orders" className="text-sky-600 hover:underline">
              ← Back to My Orders
            </Link>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Quantity</p>
              <p className="text-sm text-gray-500">{computedQuantity} items</p>

              <p className="text-sm text-gray-500 mt-2">Final Amount</p>
              <p className="text-xl font-semibold text-gray-900">
                ₹{computedSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
