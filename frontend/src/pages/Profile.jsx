import React, { useEffect, useState } from "react";
import MyOrders from "./MyOrdersPage";
import {
  FaUserCircle, FaTrash, FaHeart, FaMapMarkerAlt,
  FaBoxOpen, FaCheckCircle,
} from "react-icons/fa";
import { AiOutlineLogout } from "react-icons/ai";
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import { MdVerified } from "react-icons/md";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";
import axios from "axios";
import AddressForm from "../components/Cart/AddressForm";
import ViewAddress from "../components/Cart/ViewAddress";

const NAV_ITEMS = [
  { key: "orders",    label: "My Orders",   icon: FaBoxOpen },
  { key: "wishlist",  label: "Wishlist",    icon: FaHeart },
  { key: "address",   label: "Addresses",   icon: FaMapMarkerAlt },
  { key: "profile",   label: "Profile Info",icon: FaUserCircle },
  { key: "complaint", label: "Complaints",  icon: HiOutlineExclamationCircle },
];

export default function Profile() {
  const { user }    = useSelector((s) => s.auth);
  const navigate    = useNavigate();
  const dispatch    = useDispatch();

  const [activeTab,       setActiveTab]      = useState("orders");
  const [wishlistItems,   setWishlistItems]  = useState([]);
  const [orderId,         setOrderId]        = useState("");
  const [orderVerified,   setOrderVerified]  = useState(null);
  const [submitting,      setSubmitting]     = useState(false);
  const [complaints,      setComplaints]     = useState([]);
  const [verifying,       setVerifying]      = useState(false);
  const [selectedImages,  setSelectedImages] = useState([]);

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);

  /* ── wishlist ── */
  useEffect(() => {
    if (activeTab !== "wishlist") return;
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    }).then((r) => setWishlistItems(r.data)).catch(console.error);
  }, [activeTab]);

  const removeWishlist = async (id) => {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    });
    setWishlistItems((p) => p.filter((x) => x._id !== id));
    toast.success("Removed from wishlist");
  };

  /* ── complaints ── */
  const fetchComplaints = async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/complaints`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    });
    setComplaints(data.complaints || []);
  };
  useEffect(() => { if (activeTab === "complaint") fetchComplaints(); }, [activeTab]);

  const verifyOrder = async () => {
    if (!orderId.trim()) return;
    setVerifying(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/verify/${orderId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
      );
      setOrderVerified(data.exists);
    } catch { setOrderVerified(false); }
    finally   { setVerifying(false); }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/complaints/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    });
    toast.success("Complaint deleted");
    fetchComplaints();
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.target);
      selectedImages.forEach((f) => fd.append("images", f));
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/complaints/add`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Complaint submitted!");
      e.target.reset();
      setSelectedImages([]);
      setOrderId("");
      setOrderVerified(null);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally { setSubmitting(false); }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  /* ═══════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ════════ LEFT SIDEBAR ════════ */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

              {/* User card */}
              <div className="bg-linear-to-br from-sky-600 to-blue-700 px-5 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-xl font-extrabold shrink-0 overflow-hidden">
                    {user?.photo
                      ? <img src={user.photo} alt="" className="w-full h-full object-cover" />
                      : initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                      <MdVerified className="text-sky-200 text-sm shrink-0" />
                    </div>
                    <p className="text-sky-100 text-xs truncate mt-0.5">{user?.email}</p>
                    <span className="mt-2 inline-block bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize">
                      {user?.role?.replace("_", " ") || "Customer"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nav links */}
              <nav className="p-2">
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5
                        ${active
                          ? "bg-sky-50 text-sky-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <Icon className={`text-base shrink-0 ${active ? "text-sky-600" : "text-gray-400"}`} />
                      <span>{label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Divider + logout */}
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
                >
                  <AiOutlineLogout className="text-base shrink-0" />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* ════════ MAIN CONTENT ════════ */}
          <main className="flex-1 min-w-0">
            <div className=" overflow-hidden">

            {/* ─── MY ORDERS ─── */}
            {activeTab === "orders" && (
              <div className="p-4 md:p-6">
                <MyOrders />
              </div>
            )}

            {/* ─── WISHLIST ─── */}
            {activeTab === "wishlist" && (
              <div className="p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <FaHeart className="text-red-400 text-sm" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">My Wishlist</h2>
                  </div>
                  {wishlistItems.length > 0 && (
                    <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full">
                      {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Empty state */}
                {wishlistItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                      <FaHeart className="text-3xl text-red-300" />
                    </div>
                    <h3 className="text-base font-bold text-gray-700 mb-1">Your wishlist is empty</h3>
                    <p className="text-sm text-gray-400 mb-5 max-w-xs">
                      Save items you love and come back to them anytime.
                    </p>
                    <Link
                      to="/collections/all"
                      className="px-6 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition shadow-sm"
                    >
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  /* Wishlist cards — vertical list */
                  <div className="space-y-3">
                    {wishlistItems.map((item) => {
                      const img  = item.colorVariants?.[0]?.images?.[0]?.url
                                || item.images?.[0]?.url
                                || "/placeholder.png";
                      const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                      const outOfStock  = item.countInStock === 0;
                      const lowStock    = item.countInStock > 0 && item.countInStock < 5;

                      return (
                        <div
                          key={item._id}
                          className="group flex gap-4 bg-white border border-gray-100 rounded-2xl p-3 hover:border-sky-200 hover:shadow-md transition-all duration-200"
                        >
                          {/* Image */}
                          <Link
                            to={`/product/${item._id}`}
                            className="relative shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gray-50"
                          >
                            <img
                              src={img}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {hasDiscount && (
                              <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                {item.offerPercentage || Math.round(100 - (item.discountPrice / item.price) * 100)}% OFF
                              </span>
                            )}
                          </Link>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              {/* Brand */}
                              {item.brand && (
                                <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">
                                  {item.brand}
                                </p>
                              )}
                              {/* Name */}
                              <Link to={`/product/${item._id}`}>
                                <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 hover:text-sky-700 transition">
                                  {item.name}
                                </p>
                              </Link>
                              {/* Category / Gender */}
                              {(item.category || item.gender) && (
                                <p className="text-[11px] text-gray-400 mt-0.5 capitalize">
                                  {[item.gender, item.category].filter(Boolean).join(" · ")}
                                </p>
                              )}

                              {/* Price row */}
                              <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-base font-extrabold text-gray-900">
                                  ₹{hasDiscount ? item.discountPrice.toLocaleString() : item.price.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{item.price.toLocaleString()}
                                  </span>
                                )}
                                {hasDiscount && (
                                  <span className="text-xs font-bold text-emerald-600">
                                    {item.offerPercentage || Math.round(100 - (item.discountPrice / item.price) * 100)}% off
                                  </span>
                                )}
                              </div>

                              {/* Stock badge */}
                              <div className="mt-1.5">
                                {outOfStock ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                                    Out of Stock
                                  </span>
                                ) : lowStock ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                                    Only {item.countInStock} left
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                    In Stock
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3">
                              <Link
                                to={`/product/${item._id}`}
                                className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition shadow-sm"
                              >
                                View Product
                              </Link>
                              <button
                                onClick={() => removeWishlist(item._id)}
                                className="flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition"
                                title="Remove from wishlist"
                              >
                                <FaTrash className="text-[11px]" />
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── ADDRESS ─── */}
            {activeTab === "address" && (
              <div className="p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <FaMapMarkerAlt className="text-sky-600 text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 leading-none">Saved Addresses</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Manage your delivery addresses</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Add new address card */}
                  <div className="rounded-2xl border border-sky-100 overflow-hidden">
                    <div className="flex items-center gap-3 bg-sky-50 px-4 py-3 border-b border-sky-100">
                      <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-sky-700">Add New Address</p>
                    </div>
                    <div className="p-4 md:p-5 bg-white">
                      <AddressForm />
                    </div>
                  </div>

                  {/* Saved addresses card */}
                  {/* <div className="rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-100">
                      <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                        <FaMapMarkerAlt className="text-gray-500 text-xs" />
                      </div>
                      <p className="text-sm font-bold text-gray-700">All Saved Addresses</p>
                    </div>
                    <div className="p-4 md:p-5 bg-white">
                      <ViewAddress />
                    </div>
                  </div> */}
                </div>
              </div>
            )}

            {/* ─── PROFILE INFO ─── */}
            {activeTab === "profile" && (
              <div className="p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <FaUserCircle className="text-blue-600 text-sm" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 leading-none">Profile Information</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Your personal account details</p>
                  </div>
                </div>

                {/* Avatar + name banner */}
                <div className="flex items-center gap-4 bg-linear-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-sky-500 to-blue-600 text-white text-xl font-extrabold flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {user?.photo
                      ? <img src={user.photo} alt="" className="w-full h-full object-cover" />
                      : initials}
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-gray-800">{user?.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
                    <span className="mt-1.5 inline-block bg-sky-100 text-sky-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                      {user?.role?.replace("_", " ") || "Customer"}
                    </span>
                  </div>
                </div>

                {/* Info fields */}
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Full Name",     value: user?.name,                          icon: "👤" },
                    { label: "Email Address", value: user?.email,                         icon: "✉️" },
                    { label: "Mobile Number", value: user?.mobile   || "Not added",       icon: "📱" },
                    { label: "Account Role",  value: user?.role?.replace("_", " ") || "Customer", icon: "🏷️" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="group flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:border-sky-200 hover:shadow-sm transition-all">
                      <span className="text-lg leading-none mt-0.5">{icon}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                        <p className={`text-sm font-semibold text-gray-800 truncate ${label === "Email Address" ? "normal-case" : "capitalize"}`}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit button */}
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile/update"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </Link>
                </div>
              </div>
            )}

            {/* ─── COMPLAINTS ─── */}
            {activeTab === "complaint" && (
              <div className="p-4 md:p-6 space-y-6">

                {/* ── Page header ── */}
                <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                    <HiOutlineExclamationCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 leading-tight">Support &amp; Complaints</h2>
                    <p className="text-xs text-gray-400 mt-0.5">We respond to every complaint within 24–48 hours</p>
                  </div>
                </div>

                {/* ── Raise Complaint Form ── */}
                <form onSubmit={submitComplaint} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                  {/* Form title strip */}
                  <div className="px-5 py-4 border-b border-gray-100 bg-sky-50">
                    <h3 className="text-sm font-bold text-sky-800">Raise a Complaint</h3>
                    <p className="text-[11px] text-sky-500 mt-0.5">Fill all required fields and verify your order ID before submitting.</p>
                  </div>

                  <div className="p-5 space-y-5">

                    {/* Complaint Type */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Complaint Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Damaged Product", "Missing Item", "Wrong Product Delivered", "Late Delivery", "Other"].map((type) => (
                          <label key={type} className="cursor-pointer">
                            <input type="radio" name="complaintType" value={type} required className="sr-only peer" />
                            <span className="inline-block px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 bg-white
                              peer-checked:bg-sky-600 peer-checked:text-white peer-checked:border-sky-600
                              hover:border-sky-300 hover:text-sky-700 transition-all cursor-pointer select-none">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Order ID */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Order ID <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text" name="orderId" required
                            value={orderId}
                            onChange={(e) => { setOrderId(e.target.value); setOrderVerified(null); }}
                            placeholder="Paste your Order ID here…"
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition pr-9
                              ${orderVerified === true  ? "border-emerald-400 bg-emerald-50 focus:ring-2 focus:ring-emerald-300"
                              : orderVerified === false ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300"
                              : "border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400"}`}
                          />
                          {orderVerified === true && (
                            <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={verifyOrder}
                          disabled={!orderId.trim() || verifying}
                          className="shrink-0 px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {verifying ? "Checking…" : "Verify"}
                        </button>
                      </div>
                      <div className="mt-1.5 min-h-4">
                        {orderVerified === true  && <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><FaCheckCircle className="text-[11px]" /> Order verified successfully</p>}
                        {orderVerified === false && !verifying && <p className="text-xs text-red-500 font-medium">✗ Order not found or doesn't belong to you</p>}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Describe Your Issue <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description" required rows={4}
                        placeholder="What happened? When? What resolution are you expecting?…"
                        className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none resize-none transition"
                      />
                    </div>

                    {/* Image upload */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Attach Photos
                        <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
                      </label>
                      <label className="flex items-center gap-4 w-full px-4 py-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-sky-50 hover:border-sky-300 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-sky-100 flex items-center justify-center shrink-0 transition">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-sky-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600 group-hover:text-sky-700 transition">Click to upload photos</p>
                          <p className="text-xs text-gray-400 mt-0.5">PNG or JPG · multiple files allowed</p>
                        </div>
                        <input
                          type="file" accept="image/*" multiple className="hidden"
                          onChange={(e) => setSelectedImages((p) => [...p, ...Array.from(e.target.files)])}
                        />
                      </label>

                      {selectedImages.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedImages.map((img, i) => (
                            <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
                              <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <button
                                  type="button"
                                  onClick={() => setSelectedImages((p) => p.filter((_, j) => j !== i))}
                                  className="w-6 h-6 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center"
                                >✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={submitting || !orderVerified}
                      className={`w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all
                        ${submitting || !orderVerified
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-sky-600 hover:bg-sky-700 text-white shadow-sm hover:shadow-md"
                        }`}
                    >
                      {submitting
                        ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting…</span>
                        : "Submit Complaint"
                      }
                    </button>
                  </div>
                </form>

                {/* ── My Complaints list ── */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-700">My Complaints</h3>
                    {complaints.length > 0 && (
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {complaints.length} total
                      </span>
                    )}
                  </div>

                  {complaints.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <HiOutlineExclamationCircle className="text-2xl text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">No complaints yet</p>
                      <p className="text-xs text-gray-400 mt-1">Any complaint you raise will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {complaints.map((c) => {
                        const statusMap = {
                          Pending:  { pill: "bg-amber-100 text-amber-700 border-amber-200",   bar: "bg-amber-400",   dot: "bg-amber-400"  },
                          Resolved: { pill: "bg-emerald-100 text-emerald-700 border-emerald-200", bar: "bg-emerald-500", dot: "bg-emerald-500" },
                        };
                        const s = statusMap[c.status] || { pill: "bg-red-100 text-red-700 border-red-200", bar: "bg-red-500", dot: "bg-red-500" };

                        return (
                          <div key={c._id} className={`relative flex bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all`}>
                            {/* Left status bar */}
                            <div className={`w-1 shrink-0 ${s.bar}`} />

                            <div className="flex-1 min-w-0 p-4">
                              {/* Top row */}
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Type badge */}
                                  <span className="text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-0.5 rounded-lg">
                                    {c.complaintType}
                                  </span>
                                  {/* Status badge */}
                                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-lg border ${s.pill}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                                    {c.status}
                                  </span>
                                </div>
                                {/* Delete */}
                                <button
                                  onClick={() => deleteComplaint(c._id)}
                                  className="shrink-0 w-7 h-7 rounded-lg border border-gray-100 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition"
                                  title="Delete complaint"
                                >
                                  <FaTrash className="text-[11px]" />
                                </button>
                              </div>

                              {/* Order ID */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Order</span>
                                <span className="text-xs font-mono text-gray-700 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
                                  {c.orderId}
                                </span>
                              </div>

                              {/* Description */}
                              <p className="text-sm text-gray-600 leading-relaxed">{c.description}</p>

                              {/* Attached images */}
                              {c.images?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {c.images.map((img, idx) => (
                                    <img
                                      key={idx} src={img}
                                      alt={`Attachment ${idx + 1}`}
                                      className="w-14 h-14 object-cover rounded-xl border border-gray-100 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Date */}
                              <p className="text-[11px] text-gray-300 mt-3 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                {new Date(c.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>{/* end white card wrapper */}
          </main>
        </div>
      </div>
    </div>
  );
}
