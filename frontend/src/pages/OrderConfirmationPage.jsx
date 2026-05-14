import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice";
import axios from "axios";

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order: checkoutOrder } = useSelector((state) => state.checkout);
  const { state } = useLocation();
  const [fetchedOrder, setFetchedOrder] = React.useState(null);
  const [loadingOrder, setLoadingOrder] = React.useState(false);
  const stateOrder = state?.order || checkoutOrder;
  const orderId = fetchedOrder?._id || fetchedOrder?.id || stateOrder?._id || stateOrder?.id || state?.orderId;
  const order = fetchedOrder || stateOrder;
  const orderItems = order?.orderItems || order?.checkoutItems || [];
  const transactionId =
    order?.paymentResult?.id ||
    order?.razorpayPaymentId ||
    state?.transactionId ||
    "N/A";
  // useEffect(() => {
  //   if (checkout && checkout._id) {
  //     dispatch(clearCart());
  //     localStorage.removeItem("cart");
  //   } else {
  //     navigate("/my-orders");
  //   }
  // }, [checkout, dispatch, navigate]);

  useEffect(() => {
    if (orderId) {
      dispatch(clearCart());
      localStorage.removeItem("cart");
    } else {
      navigate("/my-orders");
    }
  }, [orderId, dispatch, navigate]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      try {
        setLoadingOrder(true);
        const token = localStorage.getItem("userToken");
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFetchedOrder(data);
      } catch (error) {
        console.error(
          "Failed to fetch order details:",
          error?.response?.data?.message || error.message
        );
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10);
    return orderDate.toLocaleDateString();
  };

  const handleDownloadInvoice = async () => {
    if (!orderId) return;
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Invoice_${order.orderId || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download invoice:", error?.response?.data?.message || error.message);
      alert("Failed to download invoice. Please try again.");
    }
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

      {loadingOrder && (
        <div className="text-center py-8 text-gray-600">Loading order details...</div>
      )}

      {!loadingOrder && order && (
        <div className="space-y-10">
          {/* Order Details */}
          <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center border-b pb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Order ID: <span className="text-gray-600">{orderId}</span>
              </h2>

              <p className="text-sm text-gray-500">
                Order Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Reference Order No: {order.orderId || "-"}
              </p>

              <button
                onClick={handleDownloadInvoice}
                className="mt-2 inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-md"
              >
                Download Invoice
              </button>
            </div>
            <div>
              <p className="text-sm text-emerald-700 font-medium">
                Estimated Delivery:{" "}
                {order.createdAt ? calculateEstimatedDelivery(order.createdAt) : "-"}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {orderItems.length === 0 && (
              <p className="text-gray-500">No product details available for this order.</p>
            )}
            {orderItems.map((item) => (
              <div
                key={item.productId || item._id || item.name}
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
                      Color: {item.color || "-"} | Size: {item.size || "-"}
                    </p>
                    <p className="text-sm text-gray-500">
                      SKU / Design: {item.sku || item.productId?.sku || "-"}
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
              <p className="text-gray-600">{order.paymentMethod || state?.paymentMethod || "-"}</p>
              <p className="text-gray-600 mt-1">Transaction ID: {transactionId}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Shipping Address
              </h4>
              <p className="text-gray-600">
                {order.shippingAddress?.address || "-"}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress?.city || "-"},{" "}
                {order.shippingAddress?.country || "-"}, {order.shippingAddress?.postalCode || "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {!loadingOrder && !order && (
        <div className="text-center py-8 text-gray-600">
          Order details are unavailable right now. Please open this order from My Orders.
        </div>
      )}
    </div>
  );
};

export default OrderConfirmationPage;
