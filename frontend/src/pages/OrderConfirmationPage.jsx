import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order: checkout } = useSelector((state) => state.checkout);
  const { state } = useLocation();
  const order = state?.order;

  // useEffect(() => {
  //   if (checkout && checkout._id) {
  //     dispatch(clearCart());
  //     localStorage.removeItem("cart");
  //   } else {
  //     navigate("/my-orders");
  //   }
  // }, [checkout, dispatch, navigate]);

  useEffect(() => {
    if (order && order._id) {
      dispatch(clearCart());
      localStorage.removeItem("cart");
    } else {
      navigate("/my-orders");
    }
  }, [order, dispatch, navigate]);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10);
    return orderDate.toLocaleDateString();
  };

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Order Invoice", 14, 22);

    doc.setFontSize(12);
    doc.text(`Order ID: ${checkout._id}`, 14, 32);
    doc.text(`Order Date: ${new Date(checkout.createdAt).toLocaleDateString()}`, 14, 40);
    doc.text(`Estimated Delivery: ${calculateEstimatedDelivery(checkout.createdAt)}`, 14, 48);

    doc.text("Shipping Address:", 14, 60);
    doc.text(`${checkout.shippingAddress.address}`, 14, 66);
    doc.text(`${checkout.shippingAddress.city}, ${checkout.shippingAddress.country}`, 14, 72);

    const items = checkout.checkoutItems.map((item) => [
      item.name,
      item.color,
      item.size,
      item.quantity,
      `Rs. ${item.price}`,
      `Rs. ${item.quantity * item.price}`,
    ]);

    autoTable(doc, {
      startY: 80,
      head: [["Product", "Color", "Size", "Qty", "Price", "Total"]],
      body: items,
    });

    const totalAmount = checkout.checkoutItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 100;
    // doc.text(`Payment: Online`);
    doc.text(`Payment Method: Razor Pay`, 14, finalY + 10);
    doc.text(`Total Amount: Rs. ${totalAmount}`, 14, finalY + 20);

    doc.save(`invoice_${checkout._id}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-emerald-700 mb-10">
        Hurrey! your Order is placed
      </h1>
      <img
        src="https://i.gifer.com/IDDV.gif"
        alt="Order Placed Successfully"
        className="mx-auto w-48 h-48 mb-6"
      />
      <p className="text-center text-gray-500">An email has been sent to your registered email id</p>

      {checkout && (
        <div className="space-y-10">
          {/* Order Details */}
          <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center border-b pb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Order ID: <span className="text-gray-600">{checkout._id}</span>
              </h2>

              <p className="text-sm text-gray-500">
                Order Date: {new Date(checkout.createdAt).toLocaleDateString()}
              </p>

              {/* <button
                onClick={handleDownloadInvoice}
                className="mt-2 inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-md"
              >
                Download Invoice
              </button> */}
            </div>
            <div>
              <p className="text-sm text-emerald-700 font-medium">
                Estimated Delivery:{" "}
                {calculateEstimatedDelivery(checkout.createdAt)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {checkout.checkoutItems.map((item) => (
              <div
                key={item.ProductId}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-md object-cover border"
                  />
                  <div>
                    <h4 className="text-md font-semibold text-gray-800">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Color: {item.color} | Size: {item.size}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-md text-gray-800 font-semibold">
                    ₹{item.price}
                  </p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Payment & Delivery Info */}
          <div className="grid md:grid-cols-2 gap-6 border-t pt-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Payment Method
              </h4>
              {/* <p className="text-gray-600">Razor Pay</p> */}
              <p className="text-gray-600">{checkout.paymentMethod}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Shipping Address
              </h4>
              <p className="text-gray-600">
                {checkout.shippingAddress.address}
              </p>
              <p className="text-gray-600">
                {checkout.shippingAddress.city},{" "}
                {checkout.shippingAddress.country}, {checkout.shippingAddress.postalCode}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmationPage;
