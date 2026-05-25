import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createReturnRequest, fetchMyReturnRequests, fetchUserOrders } from "../redux/slices/orderSlice";
import axios from "axios";
import { toast } from "sonner";
import { DownloadCloud, DownloadIcon } from "lucide-react";

const MyOrders = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [reviewedProducts, setReviewedProducts] = useState(new Set());
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnForm, setReturnForm] = useState({
    orderId: "",
    requestType: "return",
    reason: "",
    damageType: "",
    damageDescription: "",
    evidenceFiles: [],
  });

  const itemsPerPage = 5;
  const dispatch = useDispatch();
  const { orders, loading, error, returnRequests } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserOrders());
    dispatch(fetchMyReturnRequests());
  }, [dispatch]);

  useEffect(() => {
    const fetchReviewedProducts = async () => {
      if (!user?.token) return;
      try {
        const response = await axios.get("/api/reviews/my-reviews", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setReviewedProducts(new Set(response.data.map((r) => r.product._id)));
      } catch (err) {
        console.error("Error fetching reviewed products:", err);
      }
    };
    fetchReviewedProducts();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
      <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Loading your orders…</span>
    </div>
  );

  if (error) return (
    <p className="text-sm text-red-500 py-10 text-center">Error: {error}</p>
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({ key, direction: prev.direction === "asc" ? "desc" : "asc" }));
  };

  const filteredOrders = orders
    .filter((order) => {
      if (statusFilter === "all") return true;
      return statusFilter === "paid" ? order.isPaid : !order.isPaid;
    })
    .filter((order) => {
      const q = searchQuery.toLowerCase();
      return (
        order._id.toLowerCase().includes(q) ||
        order.orderItems[0]?.name?.toLowerCase().includes(q) ||
        order.shippingAddress.city.toLowerCase().includes(q) ||
        order.shippingAddress.country.toLowerCase().includes(q)
      );
    });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    return sortConfig.direction === "asc"
      ? new Date(aVal) > new Date(bVal) ? 1 : -1
      : new Date(aVal) < new Date(bVal) ? 1 : -1;
  });

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handleReturnReplace = async (e, order, requestType) => {
    e.stopPropagation();
    setReturnForm({
      orderId: order._id,
      requestType,
      reason: "",
      damageType: "",
      damageDescription: "",
      evidenceFiles: [],
    });
    setReturnModalOpen(true);
  };

  const submitReturnRequest = async () => {
    if (!returnForm.reason.trim()) {
      toast.error("Please enter return reason");
      return;
    }
    const order = orders.find((o) => String(o._id) === String(returnForm.orderId));
    if (!order) {
      toast.error("Order not found");
      return;
    }
    const productIds = (order.orderItems || [])
      .map((it) => String(it.productId?._id || it.productId || ""))
      .filter(Boolean);
    setReturnSubmitting(true);
    const res = await dispatch(createReturnRequest({
      orderId: order._id,
      requestType: returnForm.requestType,
      reason: returnForm.reason.trim(),
      damageType: returnForm.damageType,
      damageDescription: returnForm.damageDescription.trim(),
      evidenceFiles: returnForm.evidenceFiles,
      itemProductIds: productIds,
    }));
    setReturnSubmitting(false);
    if (res.meta.requestStatus === "fulfilled") {
      toast.success(`${returnForm.requestType === "replace" ? "Replacement" : "Return"} request submitted`);
      setReturnModalOpen(false);
      setReturnForm({
        orderId: "",
        requestType: "return",
        reason: "",
        damageType: "",
        damageDescription: "",
        evidenceFiles: [],
      });
    } else {
      toast.error(res.payload?.message || "Failed to submit request");
    }
  };

  const statusAccent = (status) => {
    if (status === "Delivered") return "bg-emerald-500";
    if (["Cancelled", "RTO Initiated", "RTO Delivered"].includes(status)) return "bg-red-400";
    if (["Shipped", "In Transit", "Out For Delivery", "Picked Up", "Pickup Scheduled"].includes(status)) return "bg-sky-400";
    return "bg-amber-400";
  };

  const statusBadgeClass = (status) => {
    if (status === "Delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (["Cancelled", "RTO Initiated", "RTO Delivered"].includes(status)) return "bg-red-50 text-red-600 border-red-200";
    if (["Shipped", "In Transit", "Out For Delivery", "Picked Up", "Pickup Scheduled"].includes(status)) return "bg-sky-50 text-sky-700 border-sky-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const pendingCount = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status)).length;
  const cancelledCount = orders.filter((o) => o.status === "Cancelled").length;

  return (
    <>
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">My Orders</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {sortedOrders.length} order{sortedOrders.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search orders…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition w-44"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition cursor-pointer"
            >
              <option value="all">All Orders</option>
              <option value="paid">Paid</option>
              <option value="pending">Unpaid</option>
            </select>
            <button
              onClick={() => handleSort("createdAt")}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition flex items-center gap-1"
            >
              {sortConfig.key === "createdAt" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"} Date
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total", value: orders.length, textColor: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
            { label: "Delivered", value: deliveredCount, textColor: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
            { label: "In Progress", value: pendingCount, textColor: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
            { label: "Cancelled", value: cancelledCount, textColor: "text-red-600", bg: "bg-red-50 border-red-200" },
          ].map(({ label, value, textColor, bg }) => (
            <div key={label} className={`border rounded-xl px-2 py-2.5 text-center ${bg}`}>
              <p className={`text-xl font-extrabold leading-none ${textColor}`}>{value}</p>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Return requests ── */}
      {!!returnRequests?.length && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            ↩ Return / Replace Requests
          </p>
          <div className="space-y-1.5">
            {returnRequests.slice(0, 4).map((r) => (
              <div key={r._id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-amber-100">
                <span className="text-xs text-gray-600 font-mono">
                  #{r.order?.orderId || String(r.order).slice(-8).toUpperCase()} ·{" "}
                  <span className="capitalize">{r.requestType}</span>
                </span>
                <span className="text-xs font-bold text-amber-700 capitalize">
                  {String(r.status || "").replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Orders list ── */}
      {currentOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-3">📦</div>
          <p className="text-sm font-semibold text-gray-600 mb-1">No orders found</p>
          <p className="text-xs text-gray-400">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentOrders.map((order) => {
            const firstItem = order.orderItems[0];
            const extraItems = order.orderItems.length - 1;
            return (
              <div
                key={order._id}
                onClick={() => navigate(`/order/${order._id}`)}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-200 transition-all cursor-pointer group overflow-hidden"
              >
                <div className="flex">
                  {/* Left status stripe */}
                  <div className={`w-1 shrink-0 ${statusAccent(order.status)}`} />

                  <div className="flex-1 flex items-start gap-4 p-4">
                    {/* Product image */}
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-sky-200 transition">
                        <img
                          src={firstItem?.image || "/placeholder-image.jpg"}
                          alt={firstItem?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {extraItems > 0 && (
                        <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-gray-800 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                          +{extraItems}
                        </span>
                      )}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 leading-snug">
                            {firstItem?.name}
                            {extraItems > 0 && (
                              <span className="text-gray-400 font-normal text-xs"> +{extraItems} more</span>
                            )}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                            {order.orderId || `#${order._id.slice(-8).toUpperCase()}`}
                          </p>
                        </div>
                        <p className="text-base font-extrabold text-gray-900 shrink-0">
                          ₹{(order.totalPrice || 0).toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center flex-wrap gap-1.5 mt-2">
                        <span className="text-[11px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                        <span className="text-gray-200">·</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          order.isPaid
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-600 border-rose-200"
                        }`}>
                          {order.isPaid ? "Paid" : "Unpaid"}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeClass(order.status)}`}>
                          {order.status || "Processing"}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {/* Track — for active orders */}
                        {!["Delivered", "Cancelled", "RTO Initiated", "RTO Delivered"].includes(order.status) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/order/${order._id}`); }}
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100 transition">
                            📦 Track Order
                          </button>
                        )}

                        {/* Invoice download — opens OrderDetailsPage where PDF is generated */}
                        {order.isPaid && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/order/${order._id}#invoice`); }}
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 transition">
                            <DownloadIcon className="inline" size={12} /> Invoice
                          </button>
                        )}

                        {/* Cancel — only for cancellable statuses */}
                        {order.cancellationEligibility?.canCancel && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/order/${order._id}`); }}
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition">
                            ✕ Cancel
                          </button>
                        )}

                        {/* Review + Return + Replace — for delivered */}
                        {order.status === "Delivered" && (
                          <>
                            {order.orderItems.map((item) => {
                              const rawId = item.productId?._id || item.productId || item.product?._id || item.product;
                              const productId = rawId?.toString();
                              const isReviewed = reviewedProducts.has(productId);
                              return isReviewed ? (
                                <span key={productId}
                                  className="text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-400 bg-gray-50">
                                  ✓ Reviewed
                                </span>
                              ) : (
                                <button key={productId}
                                  onClick={(e) => { e.stopPropagation(); navigate(`/review/${productId}`); }}
                                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-sky-200 text-sky-600 bg-sky-50 hover:bg-sky-100 transition">
                                  ✍ Review
                                </button>
                              );
                            })}
                            <button
                              onClick={(e) => handleReturnReplace(e, order, "return")}
                              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition">
                              Return
                            </button>
                            <button
                              onClick={(e) => handleReturnReplace(e, order, "replace")}
                              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition">
                              Exchange
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-sky-400 transition shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-400">
            Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, sortedOrders.length)} of {sortedOrders.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg border text-xs font-bold transition flex items-center justify-center ${
                  currentPage === page
                    ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                    : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
    {returnModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35">
        <div className="w-full max-w-lg rounded-2xl border border-amber-100 bg-white shadow-xl overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-yellow-100 border-b border-amber-100">
            <h3 className="text-sm font-bold text-amber-800">
              {returnForm.requestType === "replace" ? "Replacement Request" : "Return Request"}
            </h3>
            <p className="text-xs text-amber-700 mt-1">Share reason and damage details for pickup processing.</p>
          </div>
          <div className="p-5 space-y-3">
            <textarea
              value={returnForm.reason}
              onChange={(e) => setReturnForm((p) => ({ ...p, reason: e.target.value }))}
              rows={3}
              placeholder="Why are you requesting return/replacement?"
              className="w-full rounded-xl border border-amber-200 bg-amber-50/30 px-3 py-2 text-sm"
            />
            <select
              value={returnForm.damageType}
              onChange={(e) => setReturnForm((p) => ({ ...p, damageType: e.target.value }))}
              className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select damage type (optional)</option>
              <option value="damaged">Damaged</option>
              <option value="defective">Defective</option>
              <option value="wrong_item">Wrong item</option>
              <option value="size_issue">Size issue</option>
              <option value="quality_issue">Quality issue</option>
              <option value="other">Other</option>
            </select>
            <textarea
              value={returnForm.damageDescription}
              onChange={(e) => setReturnForm((p) => ({ ...p, damageDescription: e.target.value }))}
              rows={2}
              placeholder="Damage description (optional)"
              className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"
            />
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setReturnForm((p) => ({ ...p, evidenceFiles: Array.from(e.target.files || []).slice(0, 5) }))}
              className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"
            />
            {!!returnForm.evidenceFiles?.length && (
              <p className="text-xs text-gray-500">{returnForm.evidenceFiles.length} file(s) selected</p>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  if (returnSubmitting) return;
                  setReturnModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-600"
              >
                Close
              </button>
              <button
                onClick={submitReturnRequest}
                disabled={returnSubmitting}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                {returnSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default MyOrders;
