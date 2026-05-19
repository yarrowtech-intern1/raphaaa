import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RazorpayButton from "./RazorpayButton";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import {
  createRazorpayOrder,
  createCODOrder,
  verifyRazorpayPayment,
  handlePaymentFailure,
  clearCheckout,
} from "../../redux/slices/checkoutSlice";
import { clearCart } from "../../redux/slices/cartSlice";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  fetchProductDetails,
  fetchSimilarProducts,
} from "../../redux/slices/productsSlice";
import AddressForm from "./AddressForm";
import { FaPlus, FaLock, FaTruck, FaUndo, FaMapMarkerAlt } from "react-icons/fa";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { HiX } from "react-icons/hi";



const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Add New Address</h3>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
            <HiX className="text-sm" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// — Place this above `const Checkout = () => { ... }` in Checkout.jsx —

const CheckoutProgress = ({ currentStep = 2 }) => {
  const steps = [
    { id: 1, label: "Cart" },
    { id: 2, label: "Review" },
    { id: 3, label: "Payment" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => {
        const active = s.id === currentStep;
        const done   = s.id < currentStep;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${done   ? "bg-emerald-500 text-white"
                : active ? "bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200"
                : "bg-gray-100 text-gray-400"}`}
              >
                {done ? "✓" : s.id}
              </div>
              <span className={`mt-1.5 text-[11px] font-bold uppercase tracking-wider ${done || active ? "text-gray-700" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 md:w-28 mx-2 mb-5 rounded-full ${done ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};


const Checkout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    cart,
    loading: cartLoading,
    error: cartError,
  } = useSelector((state) => state.cart);
  const { selectedProduct, similarProducts } = useSelector(
    (state) => state.products
  );
  const { user } = useSelector((state) => state.auth);
  const {
    order,
    loading: checkoutLoading,
    error: checkoutError,
    razorpayOrderId,
    orderId,
    razorpayKeyId,
    amount,
    currency,
  } = useSelector((state) => state.checkout);

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [orderInitiated, setOrderInitiated] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [fullUser, setFullUser] = useState(null);
  // const [similarProducts, setSimilarProducts] = useState([]);
  const [displayCount, setDisplayCount] = useState(4);
  const [addressesOpen, setAddressesOpen] = useState(false); // collapsible toggle
  const [featuredCollab, setFeaturedCollab] = useState(null);
  // Step state derived only from existing flags (UI-only)
  const currentStep = razorpayOrderId ? 3 : 2; // 1 = Cart (previous page), 2 = Review, 3 = Payment

  // === START: computed totals (use these everywhere instead of cart.totalPrice) ===
  const computedQuantity = (cart?.products || []).reduce(
    (acc, p) => acc + Number(p.quantity || 0),
    0
  );

  const computedSubtotal = Number(
    (cart?.products || []).reduce((sum, p) => {
      // ensure numeric price, default to 0
      const price = parseFloat(p.price) || 0;
      const qty = Number(p.quantity || 0);
      return sum + price * qty;
    }, 0).toFixed(2)
  );

  // shipping rules — change if you have shipping logic
  const shippingFee = 0; // if free shipping; otherwise compute
  const gst = Number((computedSubtotal * 0.00).toFixed(2)); // 5% GST as used earlier
  const computedTotal = Number((computedSubtotal + gst + shippingFee).toFixed(2));


  useEffect(() => {
    const fetchCollab = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}`);
        if (data && data.length > 0) {
          setFeaturedCollab(data[0]);
        }
      } catch (err) {
        console.error("Failed to load feature collab", err);
      }
    };
    fetchCollab();
  }, []);

  useEffect(() => {
    if (razorpayOrderId && paymentMethod === "razorpay") {
      const payBtn = document.getElementById("autoPayButton");
      if (payBtn) payBtn.click();
    }
  }, [razorpayOrderId, paymentMethod]);


  // useEffect(() => {
  //   // Ideally, fetch from backend based on cart category or most viewed
  //   setSimilarProducts([
  //     {
  //       _id: "1",
  //       name: "Casual Shirt",
  //       price: 999,
  //       discountPrice: 799,
  //       offerPercentage: 20,
  //       rating: 4.5,
  //       numReviews: 18,
  //       images: [{ url: "/images/shirt1.jpg" }],
  //     },
  //     {
  //       _id: "2",
  //       name: "Denim Jacket",
  //       price: 1999,
  //       discountPrice: 1499,
  //       offerPercentage: 25,
  //       rating: 4.8,
  //       numReviews: 23,
  //       images: [{ url: "/images/jacket1.jpg" }],
  //     },
  //     // ... more mock data
  //   ]);
  // }, []);



  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "India",
    phone: "+91",
  });

  const countries = [
    "India",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "China",
    "Brazil",
    "Russia",
    "Italy",
    "Spain",
    "Netherlands",
    "Sweden",
    "Switzerland",
    "Norway",
    "Denmark",
    "Finland",
    "Belgium",
    "Austria",
    "Portugal",
    "Greece",
    "Ireland",
    "Poland",
    "Czech Republic",
    "Hungary",
    "Romania",
    "Bulgaria",
    "Croatia",
    "Slovenia",
    "Slovakia",
    "Estonia",
    "Latvia",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Cyprus",
  ];

  useEffect(() => {
    dispatch(clearCheckout());
    setOrderInitiated(false);
  }, [dispatch]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFullUser(data);
      } catch (error) {
        console.error(
          "Failed to load user profile:",
          error.response?.data?.message || error.message
        );
      }
    };

    fetchUserProfile();
  }, []);

  const validatePhone = (phone) => {
    if (!phone.startsWith("+91")) {
      phone = "+91" + phone.replace(/^\+91/, ""); // silently add +91
    }
    const phoneWithoutCode = phone.slice(3);
    if (phoneWithoutCode.length !== 10 || !/^\d{10}$/.test(phoneWithoutCode)) {
      setPhoneError("Phone number must be exactly 10 digits after +91");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleAddressSelect = (address, index) => {
    setSelectedAddressIndex(index);
    const firstName = address?.firstName || fullUser?.name?.split(" ")?.[0] || "";
    const lastName =
      address?.lastName ||
      (fullUser?.name ? fullUser.name.split(" ").slice(1).join(" ") : "");
    setShippingAddress({
      firstName: firstName,
      lastName: lastName,
      address: address.address || "",
      city: address.city || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      phone: String(address.phone || ""),
    });
    validatePhone(String(address.phone || ""));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.address) {
      toast.error("Please select an address first.");
      return;
    }
    if (!validatePhone(shippingAddress.phone)) return;
    if (orderInitiated || submitDisabled) return;

    if (cart && cart.products.length > 0) {
      setOrderProcessing(true);
      setSubmitDisabled(true);
      setOrderInitiated(true);

      const shipping = {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      };

      const orderData = {
        orderItems: cart.products.map((p) => ({
          productId: p.productId,
          name: p.name,
          image: p.image,
          price: p.price,
          quantity: p.quantity,
          size: p.size,
          color: p.color,
          sku: p.sku,
        })),
        shippingAddress: shipping,
        paymentMethod,
        totalPrice: cart.totalPrice,
        idempotencyKey: uuidv4(), // Add idempotency key
      };

      try {
        if (paymentMethod === "cash_on_delivery") {
          const result = await dispatch(createCODOrder(orderData));
          if (result.type === "checkout/createCODOrder/fulfilled") {
            dispatch(clearCart());
            dispatch(clearCheckout());
            setOrderInitiated(false);
            navigate("/order-confirmation", {
              state: {
                order: result.payload,
                paymentMethod: "cash_on_delivery",
              },
            });
          } else {
            console.error("[ERROR] COD Order Creation Failed:", result.error);
            alert(
              result.error?.message ||
              "Failed to create COD order. Please try again."
            );
            setOrderInitiated(false);
          }
        } else {
          const result = await dispatch(createRazorpayOrder(orderData));
          if (result.type === "checkout/createRazorpayOrder/fulfilled") {
            if (result.payload.amount !== cart.totalPrice) {
              alert(
                `A pending order (${result.payload.orderId}) exists with a different amount (₹${result.payload.amount}). Please complete or cancel it.`
              );
              dispatch(clearCheckout());
              setOrderInitiated(false);
              navigate("/order-confirmation", {
                state: { orderId: result.payload.orderId },
              });
            } else {
              setOrderProcessing(false); // Proceed to Razorpay payment
            }
          } else {
            console.error(
              "[ERROR] Razorpay Order Creation Failed:",
              result.error
            );
            alert(
              result.error?.message ||
              "Failed to create Razorpay order. Please try again."
            );
            setOrderInitiated(false);
          }
        }
      } catch (error) {
        console.error("[ERROR] Order creation error:", error);
        alert("Failed to create order. Please try again.");
        setOrderInitiated(false);
      } finally {
        setSubmitDisabled(false);
      }
    }
  };

  const handleRazorpaySuccess = async (paymentData) => {
    try {
      setOrderProcessing(true);
      const result = await dispatch(
        verifyRazorpayPayment({
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpayOrderId,
          razorpaySignature: paymentData.razorpay_signature,
          orderId,
        })
      );

      if (result.type === "checkout/verifyRazorpayPayment/fulfilled") {
        dispatch(clearCart());
        dispatch(clearCheckout());
        setOrderInitiated(false);
        navigate("/order-confirmation", {
          state: { order: result.payload.order, paymentMethod: "razorpay" },
        });
      } else {
        console.error("[ERROR] Payment verification failed:", result.error);
        alert(
          result.error?.message ||
          "Payment verification failed. Please contact support."
        );
        setOrderInitiated(false);
      }
    } catch (error) {
      console.error("[ERROR] Payment processing error:", error);
      alert("Payment processing failed. Please contact support.");
      setOrderInitiated(false);
    } finally {
      setOrderProcessing(false);
    }
  };

  const handleRazorpayError = async (errorData) => {
    console.error("[ERROR] Razorpay error:", errorData);
    setOrderProcessing(false);

    try {
      const code = errorData?.code || errorData?.error?.code || "PAYMENT_FAILED";
      const description =
        errorData?.description ||
        errorData?.error?.description ||
        errorData?.reason ||
        "Unknown error";

      const result = await dispatch(
        handlePaymentFailure({
          razorpayOrderId,
          error_code: code,
          error_description: description,
        })
      );
      if (result.type === "checkout/handlePaymentFailure/rejected") {
        throw new Error(result.payload || "Failed to update payment failure status");
      }
      alert(
        `Payment failed: ${description}. Please try again.`
      );
      dispatch(clearCheckout());
      setOrderInitiated(false);
    } catch (error) {
      console.error("[ERROR] Failed to handle payment failure:", error);
      alert("Payment failed and status update failed. Please contact support.");
      setOrderInitiated(false);
    }
  };

  const loading = cartLoading || checkoutLoading;
  const error = cartError || checkoutError;

  // if (loading) return <p>Loading cart...</p>;

  // near other useEffects in Checkout.jsx
  useEffect(() => {
    const onAddressUpdated = (e) => {
      const next = Array.isArray(e.detail) ? e.detail : e.detail?.addresses;
      if (!Array.isArray(next)) return;

      // update local user snapshot so “Select Saved Address” re-renders
      setFullUser((prev) => ({ ...(prev || {}), addresses: next }));

      // (optional) close the modal after successful save:
      setIsModalOpen(false);

      // auto-select newly added address for a simple flow
      if (next.length > 0) {
        const idx = next.length - 1;
        handleAddressSelect(next[idx], idx);
      }
    };
    window.addEventListener("address:list-updated", onAddressUpdated);
    return () => window.removeEventListener("address:list-updated", onAddressUpdated);
  }, []);

  useEffect(() => {
    const list = fullUser?.addresses || [];
    if (!Array.isArray(list) || list.length === 0) return;
    if (selectedAddressIndex !== null) return;
    const defaultIndex = list.findIndex((a) => a?.isDefault);
    const index = defaultIndex >= 0 ? defaultIndex : 0;
    handleAddressSelect(list[index], index);
  }, [fullUser?.addresses]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading your cart…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 max-w-sm w-full text-center">
        <p className="text-red-600 font-semibold mb-4">Something went wrong: {error}</p>
        <button onClick={() => navigate("/")} className="px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-700 transition">
          Go Home
        </button>
      </div>
    </div>
  );

  if (!orderProcessing && (!cart || !cart.products || cart.products.length === 0)) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <div className="text-5xl mb-4">🛒</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 text-sm mb-6">Add some products before checking out.</p>
      <button onClick={() => navigate("/")}
        className="px-6 py-3 bg-linear-to-r from-sky-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition shadow-sm">
        Continue Shopping
      </button>
    </div>
  );

  /* ─────────────────── RENDER ─────────────────── */
  const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Progress ── */}
        <CheckoutProgress currentStep={currentStep} />

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ════════ LEFT — Checkout Form ════════ */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Contact</h3>
              </div>
              <div className="p-5">
                <label className={labelCls}>Email</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-gray-500 truncate">{user?.email || "—"}</span>
                  <span className="ml-auto text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">Verified</span>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Delivery Address</h3>
              </div>
              <div className="p-5 space-y-4">
                <form onSubmit={handleCreateOrder} id="checkout-form">
                  <p className="text-sm text-gray-500 mb-4">
                    Select a saved address or add a new one.
                  </p>

                  {/* Saved addresses */}
                  {fullUser?.addresses?.length > 0 && (
                    <div className="mb-4 border border-gray-100 rounded-xl overflow-hidden">
                      <button type="button"
                        onClick={() => setAddressesOpen((v) => !v)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-sky-50 hover:bg-sky-100 transition"
                        aria-expanded={addressesOpen}
                      >
                        <span className="text-sm font-semibold text-sky-700 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-sky-500" />
                          Use a saved address
                          <span className="text-xs font-medium text-sky-400 bg-sky-100 px-2 py-0.5 rounded-full">
                            {fullUser.addresses.length}
                          </span>
                        </span>
                        {addressesOpen ? <FaChevronDown className="text-sky-500 text-xs" /> : <FaChevronRight className="text-sky-500 text-xs" />}
                      </button>
                      {addressesOpen && (
                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {fullUser.addresses.map((addr, index) => (
                            <div key={index}
                              onClick={() => handleAddressSelect(addr, index)}
                              className={`border rounded-xl p-3.5 cursor-pointer transition-all ${
                                selectedAddressIndex === index
                                  ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200"
                                  : "border-gray-200 hover:border-sky-300 hover:bg-gray-50"
                              }`}
                            >
                              <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                {selectedAddressIndex === index && <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />}
                                {fullUser?.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                {addr.address}<br />
                                {addr.city}, {addr.postalCode}, {addr.country}<br />
                                📞 {addr.phone}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add new address */}
                  <button type="button"
                    onClick={() => {
                      if (!user) {
                        navigate("/login?redirect=%2Fcheckout");
                        return;
                      }
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 border border-sky-200 hover:border-sky-400 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition"
                  >
                    <FaPlus className="text-xs" /> Add New Address
                  </button>

                  {selectedAddressIndex === null && (
                    <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      No address selected yet.
                    </p>
                  )}
                </form>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Payment Method</h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { value: "razorpay",        icon: "💳", label: "Online Payment",    sub: "UPI · Cards · Net Banking · Wallets" },
                  { value: "cash_on_delivery", icon: "💵", label: "Cash on Delivery",  sub: "Pay when you receive your order" },
                ].map((opt) => (
                  <label key={opt.value}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === opt.value
                        ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200"
                        : "border-gray-200 hover:border-sky-300 hover:bg-gray-50"
                    }`}
                  >
                    <input type="radio" name="paymentMethod" value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only" />
                    <span className="text-xl shrink-0">{opt.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      paymentMethod === opt.value ? "border-sky-500 bg-sky-500" : "border-gray-300"
                    }`}>
                      {paymentMethod === opt.value && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit / Razorpay */}
            <div>
              {!razorpayOrderId ? (
                <button type="submit" form="checkout-form"
                  className={`w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all shadow-md flex items-center justify-center gap-2.5 ${
                    loading || orderProcessing || phoneError || submitDisabled || orderInitiated
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-linear-to-r from-sky-600 to-blue-700 text-white hover:opacity-90 shadow-sky-200"
                  }`}
                  disabled={loading || orderProcessing || phoneError || submitDisabled || orderInitiated}
                >
                  {loading || orderProcessing ? (
                    <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
                  ) : paymentMethod === "razorpay" ? (
                    <><FaLock className="text-sm" /> Pay ₹{computedTotal.toLocaleString("en-IN")} online</>
                  ) : (
                    <>📦 Place Order — Cash on Delivery</>
                  )}
                </button>
              ) : (
                <div className="bg-white rounded-2xl border border-sky-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Complete Payment</h3>
                  <RazorpayButton
                    amount={amount} currency={currency}
                    name={`${shippingAddress.firstName} ${shippingAddress.lastName}`}
                    email={user?.email} contact={shippingAddress.phone}
                    orderId={razorpayOrderId || orderId} keyId={razorpayKeyId}
                    onSuccess={handleRazorpaySuccess} onError={handleRazorpayError}
                  />
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-5 py-3">
              {[
                { icon: <FaLock className="text-sky-500" />, text: "Secure payment" },
                { icon: <FaTruck className="text-emerald-500" />, text: "Free delivery" },
                { icon: <FaUndo className="text-amber-500" />, text: "7-day returns" },
              ].map(({ icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  {icon} {text}
                </span>
              ))}
            </div>
          </div>

          {/* ════════ RIGHT — Order Summary ════════ */}
          <div className="w-full lg:w-96 shrink-0 space-y-4 lg:sticky lg:top-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-linear-to-r from-sky-50 to-blue-50">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Order Summary
                  <span className="ml-2 text-xs font-medium text-gray-400 normal-case tracking-normal">
                    {computedQuantity} item{computedQuantity !== 1 ? "s" : ""}
                  </span>
                </h3>
              </div>

              {/* Product list */}
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {cart?.products?.map((product, index) => (
                  <div key={index} className="flex items-start gap-3 px-5 py-4">
                    <div className="relative shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      <img src={product.image} alt={product.name}
                        className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-50">
                        {product.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {product.color && <span>{product.color} · </span>}
                        {product.size && <span>Size {product.size}</span>}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">
                      ₹{(product.price * product.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="px-5 py-4 border-t border-gray-100 space-y-2.5">
                {[
                  { label: "Subtotal",  value: `₹${computedSubtotal.toLocaleString("en-IN")}`,  className: "text-gray-600" },
                  { label: "Shipping",  value: shippingFee === 0 ? "Free" : `₹${shippingFee}`, className: "text-emerald-600 font-semibold" },
                  ...(paymentMethod === "cash_on_delivery" ? [{ label: "COD Charges", value: "₹0", className: "text-gray-500" }] : []),
                ].map(({ label, value, className }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className={className}>{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-lg font-extrabold text-sky-700">
                    ₹{computedTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Deliver-to */}
              {(shippingAddress.firstName || shippingAddress.address) && (
                <div className="px-5 pb-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Delivering to</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {`${shippingAddress.firstName} ${shippingAddress.lastName}`.trim() || "—"}
                    </p>
                    {shippingAddress.address && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode}, {shippingAddress.country}
                      </p>
                    )}
                    {shippingAddress.phone && (
                      <p className="text-xs text-gray-500 mt-0.5">📞 {shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Status banners */}
              {orderProcessing && (
                <div className="mx-5 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-amber-400 border-t-amber-600 rounded-full animate-spin shrink-0" />
                    Processing your order… please wait.
                  </p>
                </div>
              )}
              {error && (
                <div className="mx-5 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-700 font-semibold">⚠ {error}</p>
                </div>
              )}
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && !featuredCollab?.isPublished && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">You may also like</h4>
                <div className="grid grid-cols-2 gap-3">
                  {similarProducts.slice(0, displayCount).map((product) => (
                    <div key={product._id}
                      onClick={() => navigate(`/product/${product.name.toLowerCase().replace(/\s+/g, "-")}`)}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-3/4 rounded-lg overflow-hidden bg-gray-50 mb-2">
                        <img src={product.images?.[0]?.url || "/no-image.png"} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs font-bold text-sky-600 mt-0.5">
                        ₹{Math.floor(product.discountPrice || product.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
                {similarProducts.length > displayCount && (
                  <button onClick={() => setDisplayCount((p) => p + 4)}
                    className="w-full mt-3 py-2 text-xs font-semibold text-sky-600 border border-sky-200 rounded-xl hover:bg-sky-50 transition">
                    Load More
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Add address modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <AddressForm />
          </Modal>
        </div>
      </div>
    </div>
  );

};

export default Checkout;
